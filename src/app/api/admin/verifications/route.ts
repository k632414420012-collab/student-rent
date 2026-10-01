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
    const status = searchParams.get('status');

    const where: any = {};
    if (status) where.status = status;

    const requests = await prisma.verificationRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            isVerified: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: requests,
      total: requests.length,
    });
  } catch (error) {
    console.error('List verifications error:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể lấy danh sách yêu cầu xác thực' },
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
    const { requestId, action, adminNote } = body; // action: 'APPROVE' | 'REJECT'

    if (!requestId || !action) {
      return NextResponse.json(
        { success: false, error: 'Thiếu mã yêu cầu hoặc hành động duyệt' },
        { status: 400 }
      );
    }

    const verificationReq = await prisma.verificationRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!verificationReq) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy yêu cầu xác thực' },
        { status: 404 }
      );
    }

    const isApprove = action === 'APPROVE';

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update VerificationRequest
      const reqUpdated = await tx.verificationRequest.update({
        where: { id: requestId },
        data: {
          status: isApprove ? 'APPROVED' : 'REJECTED',
          adminNote: adminNote || (isApprove ? 'Thẻ sinh viên hợp lệ' : 'Thông tin không khớp hoặc ảnh mờ'),
          reviewedAt: new Date(),
        },
      });

      // 2. Update User profile
      await tx.user.update({
        where: { id: verificationReq.userId },
        data: {
          isVerified: isApprove,
          verifiedAt: isApprove ? new Date() : null,
          verificationStatus: isApprove ? 'VERIFIED' : 'REJECTED',
          verificationNote: adminNote || null,
          university: verificationReq.university,
          studentCardNumber: verificationReq.studentCardNumber,
          studentCardImage: verificationReq.studentCardImage,
          idCardNumber: verificationReq.idCardNumber,
        },
      });

      // 3. Send Notification to User
      await tx.notification.create({
        data: {
          userId: verificationReq.userId,
          title: isApprove ? '🎉 Xác thực sinh viên thành công!' : '❌ Yêu cầu xác thực chưa được duyệt',
          content: isApprove
            ? `Chúc mừng bạn! Hồ sơ sinh viên trường ${verificationReq.university} đã được Admin phê duyệt. Bạn đã nhận huy hiệu Đã Xác Thực Uy Tín (Verified Student).`
            : `Yêu cầu xác thực của bạn bị từ chối với lý do: "${adminNote || 'Ảnh thẻ sinh viên không rõ hoặc thông tin không khớp'}". Vui lòng gửi lại.`,
          type: 'BOOKING',
          linkUrl: '/verify-student',
        },
      });

      return reqUpdated;
    });

    return NextResponse.json({
      success: true,
      message: isApprove
        ? 'Đã duyệt xác thực sinh viên thành công!'
        : 'Đã từ chối yêu cầu xác thực.',
      data: result,
    });
  } catch (error) {
    console.error('Process verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi xử lý duyệt xác thực' },
      { status: 500 }
    );
  }
}
