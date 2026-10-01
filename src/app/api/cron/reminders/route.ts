import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { formatDateVN } from '@/lib/utils';

export const dynamic = 'force-dynamic';

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true; // Trong dev mode nếu chưa set thì cho phép chạy
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  return triggerReminders();
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  return triggerReminders();
}

async function triggerReminders() {
  try {
    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const logs = [];

    // 1. Remind upcoming pickups (CONFIRMED bookings starting in <= 24h)
    const upcomingPickups = await prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        startDate: {
          lte: oneDayFromNow,
          gte: now,
        },
      },
      include: {
        item: { include: { lender: true } },
        renter: true,
      },
    });

    for (const booking of upcomingPickups) {
      // Check if reminder already sent today
      const alreadySent = await prisma.notification.findFirst({
        where: {
          userId: booking.renterId,
          type: 'REMINDER',
          title: { contains: 'Nhắc lịch nhận đồ' },
          createdAt: {
            gte: new Date(now.setHours(0, 0, 0, 0)),
          },
        },
      });

      if (!alreadySent) {
        await prisma.notification.create({
          data: {
            userId: booking.renterId,
            title: '⏰ Nhắc lịch nhận đồ ngày mai!',
            content: `Ngày mai (${formatDateVN(booking.startDate)}) là ngày nhận món đồ "${
              booking.item.title
            }" tại ${booking.item.location}. Hãy liên hệ chủ đồ (${booking.item.lender.fullName} - ${
              booking.item.lender.phone || 'qua chat'
            }) để hẹn giờ nhận đồ.`,
            type: 'REMINDER',
            linkUrl: '/my-orders?tab=renter',
          },
        });
        logs.push(`Sent pickup reminder to ${booking.renter.fullName} for #${booking.bookingCode}`);
      }
    }

    // 2. Remind upcoming returns (ACTIVE bookings ending in <= 24h)
    const upcomingReturns = await prisma.booking.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          lte: oneDayFromNow,
          gte: now,
        },
      },
      include: {
        item: true,
        renter: true,
      },
    });

    for (const booking of upcomingReturns) {
      await prisma.notification.create({
        data: {
          userId: booking.renterId,
          title: '📦 Nhắc lịch trả đồ đúng hạn!',
          content: `Hạn trả món đồ "${booking.item.title}" là ngày mai (${formatDateVN(
            booking.endDate
          )}). Hãy hoàn trả đúng hạn và nguyên vẹn để nhận lại 100% tiền cọc tự động nhé!`,
          type: 'REMINDER',
          linkUrl: '/my-orders?tab=renter',
        },
      });
      logs.push(`Sent return reminder to ${booking.renter.fullName} for #${booking.bookingCode}`);
    }

    // 3. Alert Overdue Returns (ACTIVE bookings where endDate < now)
    const overdueBookings = await prisma.booking.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          lt: new Date(now.getTime() - 12 * 60 * 60 * 1000), // Overdue by > 12h
        },
      },
      include: {
        item: true,
        renter: true,
      },
    });

    for (const booking of overdueBookings) {
      await prisma.notification.create({
        data: {
          userId: booking.renterId,
          title: '⚠️ CẢNH BÁO: Đơn thuê đã quá hạn trả!',
          content: `Món đồ "${booking.item.title}" đã quá hạn trả từ ngày ${formatDateVN(
            booking.endDate
          )}. Vui lòng liên hệ chủ đồ và trả ngay để tránh bị khấu trừ tiền cọc theo biểu phí trễ hạn!`,
          type: 'REMINDER',
          linkUrl: '/my-orders?tab=renter',
        },
      });
      logs.push(`Sent OVERDUE warning to ${booking.renter.fullName} for #${booking.bookingCode}`);
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      triggeredCount: logs.length,
      logs,
    });
  } catch (error) {
    console.error('Cron reminder error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi quét lịch nhắc tự động' },
      { status: 500 }
    );
  }
}
