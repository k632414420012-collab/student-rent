import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { formatVND } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { deductedAmount, adminNote, resolvedById } = body;

    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            item: { include: { lender: true } },
            renter: true,
          },
        },
      },
    });

    if (!dispute) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy hồ sơ khiếu nại' },
        { status: 404 }
      );
    }

    const deduct = Math.min(parseFloat(deductedAmount || 0), dispute.booking.depositFee);
    const refundToRenter = Math.max(dispute.booking.depositFee - deduct, 0);

    const resolved = await prisma.$transaction(async (tx) => {
      // 1. Update dispute record
      const d = await tx.dispute.update({
        where: { id },
        data: {
          deductedAmount: deduct,
          adminNote: adminNote || 'Đã phân xử xong',
          resolvedById: resolvedById || null,
          status: 'RESOLVED',
          resolvedAt: new Date(),
        },
      });

      // 2. Update booking status to COMPLETED
      await tx.booking.update({
        where: { id: dispute.bookingId },
        data: {
          status: 'COMPLETED',
        },
      });

      // 3. Compensation payout to Lender if deducted
      if (deduct > 0) {
        await tx.transaction.create({
          data: {
            bookingId: dispute.bookingId,
            userId: dispute.booking.item.lenderId,
            transactionCode: `COMPENSATE-${Date.now().toString().slice(-6)}`,
            type: 'DEPOSIT_DEDUCT',
            amount: deduct,
            paymentMethod: 'VIETQR',
            gatewayStatus: 'SUCCESS',
          },
        });
      }

      // 4. Remaining deposit refund to Renter
      if (refundToRenter > 0) {
        await tx.transaction.create({
          data: {
            bookingId: dispute.bookingId,
            userId: dispute.booking.renterId,
            transactionCode: `REFUND-REMAIN-${Date.now().toString().slice(-6)}`,
            type: 'DEPOSIT_REFUND',
            amount: refundToRenter,
            paymentMethod: 'VIETQR',
            gatewayStatus: 'SUCCESS',
          },
        });
      }

      // 5. Dual Notifications
      await tx.notification.create({
        data: {
          userId: dispute.booking.renterId,
          title: 'Kết quả giải quyết khiếu nại đơn hàng',
          content: `Admin đã phân xử: Khấu trừ bồi thường ${formatVND(deduct)}. Phần cọc còn lại ${formatVND(
            refundToRenter
          )} đã được hoàn về tài khoản của bạn.`,
          type: 'DISPUTE',
          linkUrl: '/my-orders?tab=renter',
        },
      });

      await tx.notification.create({
        data: {
          userId: dispute.booking.item.lenderId,
          title: 'Kết quả giải quyết khiếu nại đơn hàng',
          content: `Admin đã phân xử: Bồi thường ${formatVND(
            deduct
          )} từ tiền cọc của người thuê đã được ghi nhận cho bạn.`,
          type: 'DISPUTE',
          linkUrl: '/profile',
        },
      });

      return d;
    });

    return NextResponse.json({
      success: true,
      message: 'Đã giải quyết tranh chấp và phân bổ tiền cọc Escrow thành công!',
      data: resolved,
    });
  } catch (error) {
    console.error('Resolve dispute error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi giải quyết tranh chấp' },
      { status: 500 }
    );
  }
}
