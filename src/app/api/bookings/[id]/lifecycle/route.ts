import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { formatVND } from '@/lib/utils';
import { DEFAULT_FREE_CANCEL_HOURS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, note } = body; // action: 'HANDOVER' | 'RETURN_AND_REFUND' | 'CANCEL'

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        item: { include: { lender: true } },
        renter: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy đơn hàng' },
        { status: 404 }
      );
    }

    // 1. ACTION: HANDOVER (Giao nhận đồ -> Đang thuê)
    if (action === 'HANDOVER') {
      if (booking.status !== 'CONFIRMED') {
        return NextResponse.json(
          { success: false, error: 'Chỉ có thể xác nhận giao đồ cho đơn đã thanh toán (Đã xác nhận)' },
          { status: 400 }
        );
      }

      const updated = await prisma.booking.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          lenderConfirmedHandover: true,
          renterConfirmedReceived: true,
        },
      });

      await prisma.notification.create({
        data: {
          userId: booking.renterId,
          title: 'Đơn thuê bắt đầu hoạt động',
          content: `Bạn đã nhận món đồ "${booking.item.title}". Vui lòng giữ gìn cẩn thận và trả đúng hạn vào ngày ${new Date(
            booking.endDate
          ).toLocaleDateString('vi-VN')}.`,
          type: 'BOOKING',
          linkUrl: '/my-orders?tab=renter',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Đã xác nhận giao nhận đồ thành công. Đơn hàng chuyển sang trạng thái ĐANG THUÊ.',
        data: updated,
      });
    }

    // 2. ACTION: RETURN_AND_REFUND (Chủ đồ xác nhận nhận lại đồ nguyên vẹn -> TỰ ĐỘNG HOÀN CỌC ESCROW 100%)
    if (action === 'RETURN_AND_REFUND') {
      if (booking.status !== 'ACTIVE' && booking.status !== 'CONFIRMED') {
        return NextResponse.json(
          { success: false, error: 'Trạng thái đơn hàng không hợp lệ để kích hoạt hoàn cọc' },
          { status: 400 }
        );
      }

      const updated = await prisma.$transaction(async (tx) => {
        // Update booking status
        const b = await tx.booking.update({
          where: { id },
          data: {
            status: 'COMPLETED',
            lenderConfirmedReturn: true,
          },
        });

        // Create 100% Escrow Deposit Refund Transaction
        await tx.transaction.create({
          data: {
            bookingId: booking.id,
            userId: booking.renterId,
            transactionCode: `REFUND-${Date.now().toString().slice(-6)}`,
            type: 'DEPOSIT_REFUND',
            amount: booking.depositFee,
            paymentMethod: 'VIETQR',
            gatewayStatus: 'SUCCESS',
          },
        });

        // Create Lender Payout Transaction (Rental fee minus platform service fee 8-10%)
        const lenderEarnings = booking.rentalFee - booking.serviceFee;
        await tx.transaction.create({
          data: {
            bookingId: booking.id,
            userId: booking.item.lenderId,
            transactionCode: `PAYOUT-${Date.now().toString().slice(-6)}`,
            type: 'LENDER_PAYOUT',
            amount: lenderEarnings,
            paymentMethod: 'VIETQR',
            gatewayStatus: 'SUCCESS',
          },
        });

        // Notification for Renter (Refund confirmation)
        await tx.notification.create({
          data: {
            userId: booking.renterId,
            title: '🎉 Hoàn cọc Escrow 100% thành công!',
            content: `Chủ đồ đã xác nhận nhận lại món đồ "${booking.item.title}" nguyên vẹn. Toàn bộ tiền cọc ${formatVND(
              booking.depositFee
            )} đã được tự động hoàn lại cho bạn!`,
            type: 'PAYMENT',
            linkUrl: '/my-orders?tab=renter',
          },
        });

        // Notification for Lender (Earnings credited)
        await tx.notification.create({
          data: {
            userId: booking.item.lenderId,
            title: 'Doanh thu đơn thuê đã được đối soát',
            content: `Đơn thuê #${booking.bookingCode} đã hoàn tất. Doanh thu ${formatVND(
              lenderEarnings
            )} (đã trừ 8% phí sàn) đã được ghi nhận.`,
            type: 'PAYMENT',
            linkUrl: '/profile',
          },
        });

        return b;
      });

      return NextResponse.json({
        success: true,
        message: 'Hoàn tất đơn hàng! Hệ thống đã tự động hoàn 100% tiền cọc cho người thuê và đối soát doanh thu cho chủ đồ.',
        data: updated,
      });
    }

    // 3. ACTION: CANCEL (Hủy đơn theo chính sách)
    if (action === 'CANCEL') {
      if (booking.status !== 'PENDING_PAYMENT' && booking.status !== 'CONFIRMED') {
        return NextResponse.json(
          { success: false, error: 'Không thể hủy đơn hàng ở trạng thái này' },
          { status: 400 }
        );
      }

      // Check cancellation policy: prior to pickup date
      const now = new Date();
      const pickupDate = new Date(booking.startDate);
      const hoursUntilPickup = (pickupDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      const isFreeCancellation = hoursUntilPickup >= DEFAULT_FREE_CANCEL_HOURS || booking.status === 'PENDING_PAYMENT';

      const updated = await prisma.$transaction(async (tx) => {
        const b = await tx.booking.update({
          where: { id },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
            cancelReason: note || 'Người dùng yêu cầu hủy đơn',
          },
        });

        // Unlock booked days on calendar
        const curr = new Date(booking.startDate);
        const end = new Date(booking.endDate);
        curr.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        while (curr <= end) {
          const targetDate = new Date(curr);
          await tx.itemAvailability.upsert({
            where: {
              itemId_date: {
                itemId: booking.itemId,
                date: targetDate,
              },
            },
            update: { status: 'AVAILABLE' },
            create: {
              itemId: booking.itemId,
              date: targetDate,
              status: 'AVAILABLE',
            },
          });
          curr.setDate(curr.getDate() + 1);
        }

        // Refund if already confirmed
        if (booking.status === 'CONFIRMED') {
          await tx.transaction.create({
            data: {
              bookingId: booking.id,
              userId: booking.renterId,
              transactionCode: `CANCEL-REFUND-${Date.now().toString().slice(-6)}`,
              type: 'DEPOSIT_REFUND',
              amount: isFreeCancellation ? booking.totalAmount : booking.depositFee,
              paymentMethod: 'VIETQR',
              gatewayStatus: 'SUCCESS',
            },
          });
        }

        return b;
      });

      return NextResponse.json({
        success: true,
        message: 'Hủy đơn thuê thành công. Lịch trống đã được mở lại tự động.',
        data: updated,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Hành động không hợp lệ' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Lifecycle update error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật vòng đời đơn hàng' },
      { status: 500 }
    );
  }
}
