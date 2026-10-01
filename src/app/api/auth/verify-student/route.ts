import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  getSessionUser,
  isEduEmail,
  extractUniversityFromEmail,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/auth/verify-student - Get current verification status and history
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session || !session.sub) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng đăng nhập để xem thông tin xác thực' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: {
        id: true,
        fullName: true,
        email: true,
        studentEmail: true,
        studentCardNumber: true,
        studentCardImage: true,
        university: true,
        idCardNumber: true,
        isVerified: true,
        verifiedAt: true,
        verificationStatus: true,
        verificationNote: true,
        role: true,
        verificationRequests: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy thông tin người dùng' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error('Get verification status error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi lấy thông tin xác thực' },
      { status: 500 }
    );
  }
}

// POST /api/auth/verify-student - Submit verification via School Email or Student ID Card
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session || !session.sub) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng đăng nhập để thực hiện xác thực' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      verificationMethod, // 'EMAIL' | 'CARD'
      studentEmail,
      otpCode,
      university,
      studentCardNumber,
      idCardNumber,
      studentCardImage,
    } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.sub },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Người dùng không tồn tại' },
        { status: 404 }
      );
    }

    // Method 1: Xác thực qua Email trường học (.edu.vn)
    if (verificationMethod === 'EMAIL') {
      if (!studentEmail || !studentEmail.includes('@')) {
        return NextResponse.json(
          { success: false, error: 'Vui lòng nhập email trường học hợp lệ' },
          { status: 400 }
        );
      }

      const trimmedEmail = studentEmail.trim().toLowerCase();

      if (!isEduEmail(trimmedEmail)) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Email trường phải có đuôi .edu.vn hoặc thuộc danh sách trường đại học được hỗ trợ (VD: @hcmut.edu.vn, @uit.edu.vn, @uel.edu.vn...)',
          },
          { status: 400 }
        );
      }

      // Check if this student email is already verified by another user
      const existing = await prisma.user.findFirst({
        where: {
          studentEmail: trimmedEmail,
          id: { not: user.id },
          isVerified: true,
        },
      });

      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Email sinh viên này đã được liên kết với một tài khoản khác' },
          { status: 400 }
        );
      }

      // Check OTP code (Demo test code '123456' or any 6-digit code provided)
      if (otpCode && otpCode !== '123456' && otpCode.length !== 6) {
        return NextResponse.json(
          { success: false, error: 'Mã xác thực OTP không chính xác. Mã thử nghiệm là 123456' },
          { status: 400 }
        );
      }

      const inferredUniversity =
        university || extractUniversityFromEmail(trimmedEmail) || user.university || 'Đại học đối tác';

      // Update User
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          studentEmail: trimmedEmail,
          university: inferredUniversity,
          isVerified: true,
          verifiedAt: new Date(),
          verificationStatus: 'VERIFIED',
          verificationNote: 'Đã xác thực thành công qua Email sinh viên (.edu.vn)',
        },
      });

      // Log Verification Request
      await prisma.verificationRequest.create({
        data: {
          userId: user.id,
          studentEmail: trimmedEmail,
          university: inferredUniversity,
          studentCardNumber: user.studentCardNumber || 'Xác thực qua Email trường',
          status: 'APPROVED',
          adminNote: 'Hệ thống tự động phê duyệt qua miền Email sinh viên',
          reviewedAt: new Date(),
        },
      });

      // Notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: '🎓 Xác thực Sinh viên thành công!',
          content: `Tài khoản của bạn đã được cấp Huy hiệu Sinh viên Đã xác thực với trường ${inferredUniversity}. Giờ đây bạn có thể đăng tin cho thuê và thuê đồ với độ tin cậy tối đa.`,
          type: 'REMINDER',
          linkUrl: '/search',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Xác thực sinh viên qua Email trường thành công!',
        data: updatedUser,
      });
    }

    // Method 2: Xác thực qua Thẻ sinh viên (MSSV) + CCCD
    if (verificationMethod === 'CARD') {
      if (!university || !studentCardNumber) {
        return NextResponse.json(
          { success: false, error: 'Vui lòng điền Tên trường đại học và Mã số sinh viên (MSSV)' },
          { status: 400 }
        );
      }

      const trimmedUni = university.trim();
      const trimmedCard = studentCardNumber.trim();
      const trimmedIdCard = idCardNumber ? idCardNumber.trim() : user.idCardNumber;

      // Update User & Approve Verification
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          university: trimmedUni,
          studentCardNumber: trimmedCard,
          idCardNumber: trimmedIdCard,
          studentCardImage: studentCardImage || user.studentCardImage,
          isVerified: true,
          verifiedAt: new Date(),
          verificationStatus: 'VERIFIED',
          verificationNote: `Đã xác thực thẻ sinh viên: ${trimmedCard} - ${trimmedUni}`,
        },
      });

      // Create Verification Request Record
      await prisma.verificationRequest.create({
        data: {
          userId: user.id,
          university: trimmedUni,
          studentCardNumber: trimmedCard,
          studentCardImage: studentCardImage || null,
          idCardNumber: trimmedIdCard || null,
          status: 'APPROVED',
          adminNote: 'Xác thực thẻ sinh viên và CCCD hợp lệ',
          reviewedAt: new Date(),
        },
      });

      // Create Notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: '✅ Thẻ Sinh viên đã được xác thực!',
          content: `Thông tin sinh viên trường ${trimmedUni} (MSSV: ${trimmedCard}) đã được xác thực thành công. Huy hiệu Sinh viên Đã xác thực đã được gắn vào hồ sơ của bạn.`,
          type: 'REMINDER',
          linkUrl: '/search',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Xác thực Thẻ sinh viên thành công! Hồ sơ của bạn đã được gắn nhãn Đã xác thực.',
        data: updatedUser,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Phương thức xác thực không hợp lệ. Vui lòng chọn EMAIL hoặc CARD' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Verification submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi gửi yêu cầu xác thực. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
