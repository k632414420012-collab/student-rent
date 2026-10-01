import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateVietQRUrl } from '@/lib/vietqr';
import { SERVICE_FEE_RATE } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      itemId,
      startDate: startStr,
      endDate: endStr,
      renterEmail,
      withProtectionPlan = false,
    } = body;

    if (!itemId || !startStr || !endStr) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp đầy đủ thông tin món đồ và khoảng ngày thuê' },
        { status: 400 }
      );
    }

    const startDate = new Date(startStr);
    const endDate = new Date(endStr);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    if (startDate > endDate) {
      return NextResponse.json(
        { success: false, error: 'Ngày bắt đầu thuê không được sau ngày kết thúc' },
        { status: 400 }
      );
    }

    // 1. Fetch Item & Lender
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        availabilities: {
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
    });

    if (!item || item.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Món đồ không tồn tại hoặc đang tạm ngưng cho thuê' },
        { status: 404 }
      );
    }

    // 2. Check Calendar Availability Conflict (Availability Engine)
    const hasAvailabilityConflict = item.availabilities.some(
      (avail) => avail.status === 'BOOKED' || avail.status === 'UNAVAILABLE'
    );

    if (hasAvailabilityConflict) {
      return NextResponse.json(
        {
          success: false,
          error: 'Khoảng ngày bạn chọn đã có người đặt hoặc chủ đồ đã khóa. Vui lòng chọn khoảng ngày trống khác.',
        },
        { status: 400 }
      );
    }

    // 3. Double-Booking Direct Check against Confirmed/Active Bookings
    const overlappingBooking = await prisma.booking.findFirst({
      where: {
        itemId: item.id,
        status: { in: ['CONFIRMED', 'ACTIVE'] },
        AND: [
          { startDate: { lte: endDate } },
          { endDate: { gte: startDate } },
        ],
      },
    });

    if (overlappingBooking) {
      return NextResponse.json(
        {
          success: false,
          error: 'Món đồ này đã có người thuê trong khoảng thời gian đã chọn. Hệ thống tự động khóa để chống đặt trùng.',
        },
        { status: 400 }
      );
    }

    // 4. Authenticated Renter or Session fallback
    const { getSessionUser } = await import('@/lib/auth');
    const session = await getSessionUser(request);

    let renter = null;
    if (session && session.sub) {
      renter = await prisma.user.findUnique({ where: { id: session.sub } });
    }

    if (!renter) {
      renter = await prisma.user.findFirst({
        where: renterEmail ? { email: renterEmail } : { role: 'RENTER' },
      });
    }

    if (!renter) {
      renter = await prisma.user.create({
        data: {
          email: renterEmail || `renter.${Date.now()}@sv.edu.vn`,
          fullName: 'Sinh viên Đi Thuê',
          role: 'RENTER',
          isVerified: true,
        },
      });
    }

    // Do not allow lender to rent their own item
    if (renter.id === item.lenderId) {
      return NextResponse.json(
        { success: false, error: 'Bạn không thể tự thuê món đồ do chính mình đăng tải' },
        { status: 400 }
      );
    }

    // 5. Calculate Days and Costs
    const s = new Date(startStr);
    const e = new Date(endStr);
    s.setHours(0, 0, 0, 0);
    e.setHours(0, 0, 0, 0);
    const diffMs = e.getTime() - s.getTime();
    const totalDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);

    const rentalFee = totalDays * item.rentalPricePerDay;
    const depositFee = item.depositAmount;
    const serviceFee = Math.round(rentalFee * SERVICE_FEE_RATE); // 8% platform fee
    const protectionFee = withProtectionPlan ? 15000 : 0;
    const totalAmount = rentalFee + depositFee + protectionFee;

    // Generate unique booking & transaction codes
    const timestampSuffix = Date.now().toString().slice(-6);
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `BRW${timestampSuffix}${randomCode}`;
    const transactionCode = `TX${timestampSuffix}${randomCode}`;

    // 6. Generate Dynamic VietQR
    const qrInfo = generateVietQRUrl({
      amount: totalAmount,
      memo: `BRW ${bookingCode}`,
    });

    // 7. Save Booking & Transaction in DB Transaction
    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          bookingCode,
          renterId: renter.id,
          itemId: item.id,
          startDate,
          endDate,
          totalDays,
          rentalFee,
          depositFee,
          serviceFee,
          protectionFee,
          totalAmount,
          status: 'PENDING_PAYMENT',
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          bookingId: booking.id,
          userId: renter.id,
          transactionCode,
          type: 'RENTAL_PAYMENT',
          amount: totalAmount,
          paymentMethod: 'VIETQR',
          qrPayload: qrInfo.qrUrl,
          gatewayStatus: 'PENDING',
        },
      });

      return { booking, transaction };
    });

    return NextResponse.json({
      success: true,
      message: 'Tạo đơn đặt thuê thành công! Vui lòng quét mã VietQR để hoàn tất đặt chỗ.',
      data: {
        bookingId: result.booking.id,
        bookingCode: result.booking.bookingCode,
        totalAmount,
        rentalFee,
        depositFee,
        protectionFee,
        totalDays,
        qr: qrInfo,
      },
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi khởi tạo đơn thuê' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'renter'; // 'renter' or 'lender'
    const status = searchParams.get('status');

    const { getSessionUser } = await import('@/lib/auth');
    const session = await getSessionUser(request);

    const where: any = {};
    if (status) where.status = status;

    if (session && session.sub && session.role !== 'ADMIN') {
      if (role === 'renter') {
        where.renterId = session.sub;
      } else if (role === 'lender') {
        where.item = { lenderId: session.sub };
      }
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        item: {
          include: {
            category: true,
            lender: {
              select: {
                id: true,
                fullName: true,
                phone: true,
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

    return NextResponse.json({
      success: true,
      data: bookings,
      total: bookings.length,
    });
  } catch (error) {
    console.error('Error listing bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể lấy danh sách đơn thuê' },
      { status: 500 }
    );
  }
}
