import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateVietQRUrl } from '@/lib/vietqr';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        item: {
          include: {
            category: true,
            lender: {
              select: {
                id: true,
                fullName: true,
                phone: true,
                email: true,
                university: true,
                isVerified: true,
              },
            },
          },
        },
        renter: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
            university: true,
            isVerified: true,
          },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
        dispute: true,
        reviews: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy đơn hàng' },
        { status: 404 }
      );
    }

    // Generate dynamic QR info for checkout if still pending
    const qrInfo = generateVietQRUrl({
      amount: booking.totalAmount,
      memo: `BRW ${booking.bookingCode}`,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...booking,
        qrInfo,
      },
    });
  } catch (error) {
    console.error('Error fetching booking detail:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tải chi tiết đơn hàng' },
      { status: 500 }
    );
  }
}
