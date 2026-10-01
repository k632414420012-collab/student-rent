import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  hashPassword,
  createAuthToken,
  isEduEmail,
  extractUniversityFromEmail,
  COOKIE_NAME,
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      fullName,
      phone,
      role = 'RENTER',
      university,
      studentEmail,
      studentCardNumber,
    } = body;

    // 1. Validations
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng điền đầy đủ Họ tên, Email và Mật khẩu' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Địa chỉ email không đúng định dạng' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Mật khẩu phải có độ dài tối thiểu 6 ký tự' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: trimmedEmail },
          ...(studentEmail ? [{ studentEmail: studentEmail.trim().toLowerCase() }] : []),
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email hoặc Email sinh viên này đã được đăng ký' },
        { status: 400 }
      );
    }

    // 2. Hash password
    const hashedPassword = await hashPassword(password);

    // 3. Determine Student Verification Status
    const isMainEdu = isEduEmail(trimmedEmail);
    const isStudentEdu = studentEmail ? isEduEmail(studentEmail.trim().toLowerCase()) : false;
    const isAutoVerified = isMainEdu || isStudentEdu;

    const finalUniversity =
      university ||
      (isMainEdu ? extractUniversityFromEmail(trimmedEmail) : null) ||
      (isStudentEdu && studentEmail ? extractUniversityFromEmail(studentEmail) : null) ||
      null;

    const finalStudentEmail = isMainEdu ? trimmedEmail : studentEmail ? studentEmail.trim().toLowerCase() : null;

    // 4. Create User in Database
    const newUser = await prisma.user.create({
      data: {
        email: trimmedEmail,
        password: hashedPassword,
        fullName: fullName.trim(),
        phone: phone ? phone.trim() : null,
        role: role === 'LENDER' ? 'LENDER' : role === 'ADMIN' ? 'ADMIN' : 'RENTER',
        isVerified: isAutoVerified,
        verifiedAt: isAutoVerified ? new Date() : null,
        verificationStatus: isAutoVerified ? 'VERIFIED' : 'UNVERIFIED',
        studentEmail: finalStudentEmail,
        studentCardNumber: studentCardNumber ? studentCardNumber.trim() : null,
        university: finalUniversity,
      },
    });

    // 5. If auto-verified via school email, create a log record in VerificationRequest
    if (isAutoVerified) {
      await prisma.verificationRequest.create({
        data: {
          userId: newUser.id,
          studentEmail: finalStudentEmail,
          university: finalUniversity || 'Trường Đại học',
          studentCardNumber: studentCardNumber || 'Tự động xác thực qua Email trường',
          status: 'APPROVED',
          adminNote: 'Hệ thống tự động phê duyệt qua miền Email trường học (.edu.vn)',
          reviewedAt: new Date(),
        },
      });
    }

    // 6. Create Welcome Notification
    await prisma.notification.create({
      data: {
        userId: newUser.id,
        title: isAutoVerified
          ? '🎉 Chúc mừng! Tài khoản Sinh viên của bạn đã được xác thực'
          : '👋 Chào mừng bạn gia nhập BorrowMe!',
        content: isAutoVerified
          ? `Tài khoản ${newUser.fullName} đã được xác minh thành công với Email trường ${finalStudentEmail}. Bạn có huy hiệu Sinh viên Đã xác thực uy tín!`
          : `Chào ${newUser.fullName}, bạn có thể gửi thông tin thẻ sinh viên để nhận huy hiệu Sinh viên Đã xác thực bất cứ lúc nào!`,
        type: 'REMINDER',
        linkUrl: isAutoVerified ? '/search' : '/verify-student',
      },
    });

    // 7. Generate Token & Session
    const token = await createAuthToken({
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role,
      fullName: newUser.fullName,
      isVerified: newUser.isVerified,
      university: newUser.university,
    });

    // 8. Return response with cookie
    const response = NextResponse.json({
      success: true,
      message: isAutoVerified
        ? 'Đăng ký thành công! Bạn đã được tự động xác thực danh tính sinh viên.'
        : 'Đăng ký tài khoản thành công!',
      user: {
        id: newUser.id,
        email: newUser.email,
        studentEmail: newUser.studentEmail,
        fullName: newUser.fullName,
        phone: newUser.phone,
        role: newUser.role,
        isVerified: newUser.isVerified,
        verificationStatus: newUser.verificationStatus,
        university: newUser.university,
        studentCardNumber: newUser.studentCardNumber,
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
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
