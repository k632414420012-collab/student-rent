import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { formatVND } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received payment webhook payload:', body);

    // Support standard webhook formats (PayOS, SePay, VietQR or simulated format)
    const bookingCode =
      body.bookingCode ||
      body.content?.match(/BRW\s*([A-Za-z0-9]+)/i)?.[1] ||
      body.orderCode?.toString();

    const transferAmount = parseFloat(body.amount || body.transferAmount || 0);

    if (!bookingCode) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy mã đơn hàng trong nội dung chuyển khoản' },
        { status: 400 }
      );
    }

    // Find booking in DB
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [
          { bookingCode: bookingCode.replace('BRW', '').trim() },
          { bookingCode: bookingCode.trim() },
          { bookingCode: { contains: bookingCode.trim() } },
        ],
      },
      include: {
        item: {
          include: { lender: true },
        },
        renter: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: `Không tìm thấy đơn hàng với mã: ${bookingCode}` },
        { status: 404 }
      );
    }

    if (booking.status !== 'PENDING_PAYMENT') {
      return NextResponse.json({
        success: true,
        message: 'Đơn hàng này đã được xác nhận thanh toán trước đó.',
        data: booking,
      });
    }

    // Automatic Reconciliation & Escrow Lock Transaction
    const updatedBooking = await prisma.$transaction(async (tx) => {
      // 1. Update Booking status to CONFIRMED
      const b = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CONFIRMED',
        },
      });

      // 2. Update Transaction to SUCCESS
      await tx.transaction.updateMany({
        where: { bookingId: booking.id, type: 'RENTAL_PAYMENT' },
        data: {
          gatewayStatus: 'SUCCESS',
          gatewayRef: body.referenceCode || body.transactionId || `WEBHOOK-${Date.now()}`,
        },
      });

      // 3. Create Escrow Hold Transaction Record
      await tx.transaction.create({
        data: {
          bookingId: booking.id,
          userId: booking.renterId,
          transactionCode: `ESCROW-HOLD-${Date.now().toString().slice(-6)}`,
          type: 'DEPOSIT_HOLD',
          amount: booking.depositFee,
          paymentMethod: 'VIETQR',
          gatewayStatus: 'SUCCESS',
        },
      });

      // 4. AUTOMATIC CALENDAR LOCKING: Mark all dates in range as BOOKED
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
          update: { status: 'BOOKED' },
          create: {
            itemId: booking.itemId,
            date: targetDate,
            status: 'BOOKED',
          },
        });
        curr.setDate(curr.getDate() + 1);
      }

      // 5. Send Automated Notifications
      // For Renter
      await tx.notification.create({
        data: {
          userId: booking.renterId,
          title: 'Thanh toán thành công & Cọc đã được bảo vệ (Escrow)',
          content: `Đơn thuê #${booking.bookingCode} cho món đồ "${booking.item.title}" đã được xác nhận. Tiền cọc ${formatVND(
            booking.depositFee
          )} được bảo vệ qua hệ thống Escrow.`,
          type: 'PAYMENT',
          linkUrl: `/my-orders?tab=renter`,
        },
      });

      // For Lender
      await tx.notification.create({
        data: {
          userId: booking.item.lenderId,
          title: 'Có đơn đặt thuê mới đã thanh toán!',
          content: `Món đồ "${booking.item.title}" đã được người thuê ${booking.renter.fullName} thanh toán và chốt lịch từ ${new Date(
            booking.startDate
          ).toLocaleDateString('vi-VN')} đến ${new Date(booking.endDate).toLocaleDateString(
            'vi-VN'
          )}.`,
          type: 'BOOKING',
          linkUrl: `/my-orders?tab=lender`,
        },
      });

      return b;
    });

    return NextResponse.json({
      success: true,
      message: 'Đối soát và xác nhận đơn hàng thành công!',
      data: updatedBooking,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi xử lý webhook đối soát thanh toán' },
      { status: 500 }
    );
  }
}
