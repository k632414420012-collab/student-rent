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
    const categorySlug = searchParams.get('category');
    const keyword = searchParams.get('q');

    const where: any = {};
    if (status) where.status = status;
    if (categorySlug) where.category = { slug: categorySlug };
    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { description: { contains: keyword } },
        { location: { contains: keyword } },
      ];
    }

    const items = await prisma.item.findMany({
      where,
      include: {
        category: true,
        lender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            isVerified: true,
            university: true,
          },
        },
        images: { orderBy: { order: 'asc' } },
        _count: { select: { bookings: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: items,
      total: items.length,
    });
  } catch (error) {
    console.error('Admin items list error:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể lấy danh sách tin đăng' },
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
    const { itemId, action, isPremium } = body; // action: 'ACTIVATE' | 'HIDE' | 'BAN' | 'TOGGLE_PREMIUM' | 'DELETE'

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp mã sản phẩm' },
        { status: 400 }
      );
    }

    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: { lender: true },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy sản phẩm' },
        { status: 404 }
      );
    }

    if (action === 'DELETE') {
      await prisma.item.delete({ where: { id: itemId } });
      return NextResponse.json({
        success: true,
        message: 'Đã xóa sản phẩm thành công!',
      });
    }

    let updatedStatus = item.status;
    let updatedIsPremium = item.isPremium;

    if (action === 'ACTIVATE') updatedStatus = 'ACTIVE';
    if (action === 'HIDE') updatedStatus = 'HIDDEN';
    if (action === 'BAN') updatedStatus = 'BANNED';
    if (action === 'TOGGLE_PREMIUM') {
      updatedIsPremium = typeof isPremium === 'boolean' ? isPremium : !item.isPremium;
    }

    const updated = await prisma.item.update({
      where: { id: itemId },
      data: {
        status: updatedStatus,
        isPremium: updatedIsPremium,
      },
    });

    // Send warning/notification if banned
    if (action === 'BAN') {
      await prisma.notification.create({
        data: {
          userId: item.lenderId,
          title: '⚠️ Tin đăng của bạn đã bị khóa do vi phạm',
          content: `Tin đăng "${item.title}" đã bị Admin khóa do không tuân thủ quy chuẩn cho thuê đồ dùng sinh viên.`,
          type: 'DISPUTE',
          linkUrl: '/my-items',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật trạng thái tin đăng thành công!',
      data: updated,
    });
  } catch (error) {
    console.error('Admin update item error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật trạng thái tin đăng' },
      { status: 500 }
    );
  }
}
