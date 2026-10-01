import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('email');

    const { getSessionUser } = await import('@/lib/auth');
    const session = await getSessionUser(request);

    let user = null;
    if (session && session.sub) {
      user = await prisma.user.findUnique({ where: { id: session.sub } });
    } else if (userEmail) {
      user = await prisma.user.findUnique({ where: { email: userEmail } });
    }

    const where: any = {};
    if (user) {
      where.userId = user.id;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const unreadCount = await prisma.notification.count({
      where: { ...where, isRead: false },
    });

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Không thể lấy danh sách thông báo' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, markAllRead } = body;

    if (markAllRead) {
      await prisma.notification.updateMany({
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: 'Đã đánh dấu tất cả là đã đọc' });
    }

    if (notificationId) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: 'Đã đánh dấu là đã đọc' });
    }

    return NextResponse.json({ success: false, error: 'Thiếu thông số' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Lỗi cập nhật thông báo' }, { status: 500 });
  }
}
