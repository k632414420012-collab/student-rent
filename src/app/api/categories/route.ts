import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách danh mục' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, icon, minDepositRate = 0.5 } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: 'Tên danh mục và slug không được để trống' },
        { status: 400 }
      );
    }

    const newCategory = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        icon: icon || null,
        minDepositRate: parseFloat(minDepositRate) || 0.5,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Tạo danh mục mới thành công!',
      data: newCategory,
    });
  } catch (error: any) {
    console.error('Create category error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Slug danh mục này đã tồn tại' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tạo danh mục mới' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, slug, minDepositRate } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Thiếu mã danh mục' },
        { status: 400 }
      );
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(slug ? { slug: slug.trim().toLowerCase() } : {}),
        ...(minDepositRate !== undefined ? { minDepositRate: parseFloat(minDepositRate) } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Cập nhật danh mục thành công!',
      data: updated,
    });
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật danh mục' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Thiếu mã danh mục cần xóa' },
        { status: 400 }
      );
    }

    const itemCount = await prisma.item.count({ where: { categoryId: id } });
    if (itemCount > 0) {
      return NextResponse.json(
        { success: false, error: `Không thể xóa danh mục đang chứa ${itemCount} sản phẩm` },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Đã xóa danh mục thành công!',
    });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi xóa danh mục' },
      { status: 500 }
    );
  }
}

