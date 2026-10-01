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

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const isVerified = searchParams.get('isVerified');
    const keyword = searchParams.get('q');

    const where: any = {};
    if (role) where.role = role;
    if (isVerified === 'true') where.isVerified = true;
    if (isVerified === 'false') where.isVerified = false;
    if (keyword) {
      where.OR = [
        { fullName: { contains: keyword } },
        { email: { contains: keyword } },
        { phone: { contains: keyword } },
        { university: { contains: keyword } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isVerified: true,
        verifiedAt: true,
        verificationStatus: true,
        university: true,
        studentCardNumber: true,
        createdAt: true,
        _count: {
          select: {
            items: true,
            bookings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: users,
      total: users.length,
    });
  } catch (error) {
    console.error('Admin users list error:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể lấy danh sách người dùng' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Chỉ Admin mới có quyền truy cập' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, role, isVerified } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp mã người dùng' },
        { status: 400 }
      );
    }

    const dataToUpdate: any = {};
    if (role) dataToUpdate.role = role;
    if (typeof isVerified === 'boolean') {
      dataToUpdate.isVerified = isVerified;
      dataToUpdate.verificationStatus = isVerified ? 'VERIFIED' : 'UNVERIFIED';
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      message: 'Cập nhật người dùng thành công!',
      data: updated,
    });
  } catch (error) {
    console.error('Admin update user error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật người dùng' },
      { status: 500 }
    );
  }
}
