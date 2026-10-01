import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, raisedById, reason, evidenceUrls, deductedAmount } = body;

    if (!bookingId || !reason) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp mã đơn hàng và lý do khiếu nại' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { item: true },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy đơn hàng' },
        { status: 404 }
      );
    }

    // Create dispute and freeze booking into DISPUTED status
    const dispute = await prisma.$transaction(async (tx) => {
      const d = await tx.dispute.create({
        data: {
          bookingId,
          raisedById: raisedById || booking.item.lenderId,
          reason,
          evidenceUrls: JSON.stringify(evidenceUrls || []),
          deductedAmount: deductedAmount ? parseFloat(deductedAmount) : 0,
          status: 'OPEN',
        },
      });

      await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'DISPUTED' },
      });

      // Notification for both parties
      await tx.notification.create({
        data: {
          userId: booking.renterId,
          title: 'Đơn hàng đang có khiếu nại (Tạm giữ cọc Escrow)',
          content: `Chủ đồ đã gửi khiếu nại cho đơn #${booking.bookingCode}. Tiền cọc đang được tạm giữ để chờ Admin phân xử.`,
          type: 'DISPUTE',
          linkUrl: '/my-orders?tab=renter',
        },
      });

      return d;
    });

    return NextResponse.json({
      success: true,
      message: 'Gửi khiếu nại thành công! Admin sẽ thẩm định bằng chứng và phân xử mức khấu trừ cọc.',
      data: dispute,
    });
  } catch (error) {
    console.error('Create dispute error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tạo khiếu nại tranh chấp' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const disputes = await prisma.dispute.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          include: {
            item: true,
            renter: true,
          },
        },
        raisedBy: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: disputes,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Không thể lấy danh sách tranh chấp' },
      { status: 500 }
    );
  }
}
