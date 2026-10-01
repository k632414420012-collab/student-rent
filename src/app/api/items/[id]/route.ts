import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/items/[id] - Fetch detailed item information
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        category: true,
        lender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            studentEmail: true,
            avatarUrl: true,
            isVerified: true,
            university: true,
            phone: true,
            createdAt: true,
          },
        },
        images: {
          orderBy: { order: 'asc' },
        },
        availabilities: {
          orderBy: { date: 'asc' },
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                fullName: true,
                avatarUrl: true,
                university: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { bookings: true, reviews: true },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy thông tin món đồ cho thuê' },
        { status: 404 }
      );
    }

    const totalRatings = item.reviews.reduce((acc, r) => acc + r.rating, 0);
    const avgRating = item.reviews.length > 0 ? (totalRatings / item.reviews.length).toFixed(1) : '5.0';

    return NextResponse.json({
      success: true,
      data: {
        ...item,
        avgRating: parseFloat(avgRating),
        reviewCount: item._count.reviews,
        bookingCount: item._count.bookings,
      },
    });
  } catch (error) {
    console.error('Error fetching item detail:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy chi tiết món đồ' },
      { status: 500 }
    );
  }
}

// PUT /api/items/[id] - Update item details (Only item owner or admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await getSessionUser(request);

    if (!session || !session.sub) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng đăng nhập để chỉnh sửa sản phẩm' },
        { status: 401 }
      );
    }

    const item = await prisma.item.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy sản phẩm' },
        { status: 404 }
      );
    }

    // Check ownership or admin
    if (item.lenderId !== session.sub && session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền chỉnh sửa sản phẩm này' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      categoryId,
      conditionStatus,
      rentalPricePerDay,
      depositAmount,
      location,
      status,
      isPremium,
      images,
    } = body;

    // Validate fields if provided
    if (title && (typeof title !== 'string' || title.trim().length < 3)) {
      return NextResponse.json(
        { success: false, error: 'Tên sản phẩm phải có tối thiểu 3 ký tự' },
        { status: 400 }
      );
    }

    if (description && (typeof description !== 'string' || description.trim().length < 10)) {
      return NextResponse.json(
        { success: false, error: 'Mô tả chi tiết phải có tối thiểu 10 ký tự' },
        { status: 400 }
      );
    }

    const price = rentalPricePerDay !== undefined ? parseFloat(rentalPricePerDay) : undefined;
    if (price !== undefined && (isNaN(price) || price <= 0)) {
      return NextResponse.json(
        { success: false, error: 'Giá thuê phải là số dương lớn hơn 0' },
        { status: 400 }
      );
    }

    const deposit = depositAmount !== undefined ? parseFloat(depositAmount) : undefined;
    if (deposit !== undefined && (isNaN(deposit) || deposit < 0)) {
      return NextResponse.json(
        { success: false, error: 'Tiền cọc không hợp lệ' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (categoryId) updateData.categoryId = categoryId;
    if (conditionStatus) updateData.conditionStatus = conditionStatus;
    if (price !== undefined) updateData.rentalPricePerDay = price;
    if (deposit !== undefined) updateData.depositAmount = deposit;
    if (location) updateData.location = location.trim();
    if (status && ['ACTIVE', 'HIDDEN', 'BANNED'].includes(status)) {
      updateData.status = status;
    }
    if (isPremium !== undefined) updateData.isPremium = !!isPremium;

    const updatedItem = await prisma.$transaction(async (tx) => {
      const updated = await tx.item.update({
        where: { id },
        data: updateData,
        include: {
          category: true,
          images: true,
        },
      });

      // Update images if provided
      if (Array.isArray(images) && images.length > 0) {
        await tx.itemImage.deleteMany({
          where: { itemId: id },
        });

        await tx.itemImage.createMany({
          data: images.map((url: string, index: number) => ({
            itemId: id,
            imageUrl: url.trim(),
            isPrimary: index === 0,
            order: index,
          })),
        });
      }

      return updated;
    });

    return NextResponse.json({
      success: true,
      message: 'Cập nhật thông tin sản phẩm thành công!',
      data: updatedItem,
    });
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi cập nhật sản phẩm' },
      { status: 500 }
    );
  }
}

// DELETE /api/items/[id] - Delete an item (Only item owner or admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await getSessionUser(request);

    if (!session || !session.sub) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng đăng nhập để thực hiện xóa sản phẩm' },
        { status: 401 }
      );
    }

    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            status: { in: ['CONFIRMED', 'ACTIVE', 'PENDING_PAYMENT'] },
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy sản phẩm cần xóa' },
        { status: 404 }
      );
    }

    // Check ownership or admin
    if (item.lenderId !== session.sub && session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền xóa sản phẩm này' },
        { status: 403 }
      );
    }

    // If item currently has active bookings, don't hard delete
    if (item.bookings.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Món đồ đang có đơn thuê đang hoạt động hoặc chờ thanh toán. Bạn không thể xóa mà chỉ có thể chuyển trạng thái sang Tạm ẩn (HIDDEN).',
        },
        { status: 400 }
      );
    }

    // Delete item (relations with onDelete: Cascade will be removed automatically)
    await prisma.item.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Đã xóa sản phẩm cho thuê thành công!',
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi xóa sản phẩm' },
      { status: 500 }
    );
  }
}
