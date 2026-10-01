import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);

    if (!session || !session.sub) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: {
        id: true,
        email: true,
        studentEmail: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        isVerified: true,
        verifiedAt: true,
        studentCardNumber: true,
        studentCardImage: true,
        verificationStatus: true,
        verificationNote: true,
        idCardNumber: true,
        university: true,
        createdAt: true,
        _count: {
          select: {
            items: true,
            bookings: true,
            notifications: {
              where: { isRead: false },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        ...user,
        itemsCount: user._count.items,
        bookingsCount: user._count.bookings,
        unreadNotificationsCount: user._count.notifications,
      },
    });
  } catch (error: any) {
    console.error('Fetch me error:', error);
    return NextResponse.json(
      { authenticated: false, user: null, error: 'Lỗi kiểm tra phiên đăng nhập' },
      { status: 500 }
    );
  }
}
