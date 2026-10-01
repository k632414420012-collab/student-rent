import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Chỉ Admin mới có quyền truy cập' }, { status: 403 });
    }

    // Compute comprehensive dashboard metrics
    const [
      totalUsers,
      verifiedUsersCount,
      pendingVerificationsCount,
      totalItems,
      activeItemsCount,
      totalBookings,
      confirmedBookingsCount,
      completedBookingsCount,
      disputedBookingsCount,
      allTransactions,
      allBookings,
      openDisputesCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isVerified: true } }),
      prisma.verificationRequest.count({ where: { status: 'PENDING' } }),
      prisma.item.count(),
      prisma.item.count({ where: { status: 'ACTIVE' } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.booking.count({ where: { status: 'DISPUTED' } }),
      prisma.transaction.findMany({
        where: { gatewayStatus: 'SUCCESS' },
      }),
      prisma.booking.findMany({
        include: {
          item: { select: { title: true, category: { select: { name: true } } } },
          renter: { select: { fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.dispute.count({ where: { status: 'OPEN' } }),
    ]);

    // Calculate Platform Service Fee revenue (serviceFee collected from completed/confirmed bookings)
    let totalPlatformRevenue = 0;
    let totalEscrowHeld = 0;
    let totalDepositRefunded = 0;
    let totalRentalVolume = 0;

    allTransactions.forEach((tx) => {
      if (tx.type === 'RENTAL_PAYMENT') {
        totalRentalVolume += tx.amount;
      } else if (tx.type === 'DEPOSIT_HOLD') {
        totalEscrowHeld += tx.amount;
      } else if (tx.type === 'DEPOSIT_REFUND') {
        totalDepositRefunded += tx.amount;
      }
    });

    // Net escrow currently held in platform
    const currentEscrowHolding = Math.max(0, totalEscrowHeld - totalDepositRefunded);

    // Platform revenue (approx 8% of completed rental volume)
    const completedBookings = await prisma.booking.findMany({
      where: { status: { in: ['CONFIRMED', 'ACTIVE', 'COMPLETED'] } },
      select: { serviceFee: true, rentalFee: true },
    });
    totalPlatformRevenue = completedBookings.reduce((sum, b) => sum + (b.serviceFee || b.rentalFee * 0.08), 0);

    // Success Rate
    const successRate = totalBookings > 0
      ? Math.round((completedBookingsCount / totalBookings) * 100)
      : 100;

    // Top Rented Items
    const topItems = await prisma.item.findMany({
      where: { status: 'ACTIVE' },
      include: {
        category: true,
        lender: { select: { fullName: true } },
        _count: { select: { bookings: true } },
      },
      orderBy: { bookings: { _count: 'desc' } },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalUsers,
          verifiedUsersCount,
          pendingVerificationsCount,
          totalItems,
          activeItemsCount,
          totalBookings,
          completedBookingsCount,
          confirmedBookingsCount,
          disputedBookingsCount,
          openDisputesCount,
          totalPlatformRevenue,
          totalRentalVolume,
          currentEscrowHolding,
          successRate,
        },
        topItems: topItems.map((item) => ({
          id: item.id,
          title: item.title,
          categoryName: item.category.name,
          rentalPricePerDay: item.rentalPricePerDay,
          lenderName: item.lender.fullName,
          bookingCount: item._count.bookings,
        })),
        recentBookings: allBookings,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tải dữ liệu thống kê Admin' },
      { status: 500 }
    );
  }
}
