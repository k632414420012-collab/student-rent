import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, createAuthToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session || !session.sub) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng đăng nhập để chuyển vai trò' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { role } = body;

    if (!role || !['RENTER', 'LENDER', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Vai trò không hợp lệ (chỉ chấp nhận RENTER hoặc LENDER)' },
        { status: 400 }
      );
    }

    // Don't allow non-admin to switch to ADMIN via this endpoint unless they are already ADMIN
    const currentUser = await prisma.user.findUnique({
      where: { id: session.sub },
    });

    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy người dùng' }, { status: 404 });
    }

    if (role === 'ADMIN' && currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Không có quyền kích hoạt vai trò Quản trị viên' },
        { status: 403 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: { role },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isVerified: true,
        university: true,
        verificationStatus: true,
      },
    });

    // Update token
    const token = await createAuthToken({
      sub: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      fullName: updatedUser.fullName,
      isVerified: updatedUser.isVerified,
      university: updatedUser.university,
    });

    const response = NextResponse.json({
      success: true,
      message: `Đã chuyển đổi vai trò sang ${role === 'LENDER' ? 'Người cho thuê (Lender)' : 'Người thuê (Renter)'}!`,
      user: updatedUser,
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Switch role error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi chuyển đổi vai trò' },
      { status: 500 }
    );
  }
}
