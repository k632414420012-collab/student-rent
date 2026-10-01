import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, createAuthToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập đầy đủ Email và Mật khẩu' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Find user by primary email or studentEmail
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: trimmedEmail },
          { studentEmail: trimmedEmail },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Email hoặc mật khẩu không chính xác' },
        { status: 401 }
      );
    }

    // Check password
    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tài khoản chưa được thiết lập mật khẩu. Vui lòng liên hệ quản trị viên hoặc sử dụng chức năng đăng ký.',
        },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Email hoặc mật khẩu không chính xác' },
        { status: 401 }
      );
    }

    // Create session token
    const token = await createAuthToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      isVerified: user.isVerified,
      university: user.university,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Đăng nhập thành công!',
      user: {
        id: user.id,
        email: user.email,
        studentEmail: user.studentEmail,
        fullName: user.fullName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus,
        university: user.university,
        studentCardNumber: user.studentCardNumber,
        createdAt: user.createdAt,
      },
      token,
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
