import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('q') || '';
    const categorySlug = searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const location = searchParams.get('location') || '';
    const condition = searchParams.get('condition') || '';
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true';
    const isPremiumOnly = searchParams.get('premium') === 'true';
    const sortBy = searchParams.get('sortBy') || 'newest'; // newest, priceAsc, priceDesc, topRated, popular
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const myItems = searchParams.get('myItems') === 'true';
    const lenderIdParam = searchParams.get('lenderId') || '';

    const session = await getSessionUser(request);

    // Build Prisma query conditions
    const where: any = {};

    // If fetching user's own items
    if (myItems) {
      if (!session || !session.sub) {
        return NextResponse.json(
          { success: false, error: 'Vui lòng đăng nhập để xem danh sách đồ của bạn' },
          { status: 401 }
        );
      }
      where.lenderId = session.sub;
      // When viewing own items, allow all statuses (ACTIVE, HIDDEN)
    } else if (lenderIdParam) {
      where.lenderId = lenderIdParam;
      if (session?.sub !== lenderIdParam && session?.role !== 'ADMIN') {
        where.status = 'ACTIVE';
      }
    } else {
      // Public search only shows ACTIVE items
      where.status = 'ACTIVE';
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { description: { contains: keyword } },
        { location: { contains: keyword } },
      ];
    }

    if (categorySlug) {
      where.category = {
        slug: categorySlug,
      };
    }

    if (condition) {
      where.conditionStatus = condition;
    }

    if (verifiedOnly) {
      where.lender = {
        isVerified: true,
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.rentalPricePerDay = {};
      if (minPrice !== undefined) where.rentalPricePerDay.gte = minPrice;
      if (maxPrice !== undefined) where.rentalPricePerDay.lte = maxPrice;
    }

    if (location) {
      where.location = { contains: location };
    }

    if (isPremiumOnly) {
      where.isPremium = true;
    }

    // Filter by availability calendar date range if provided
    if (startDateParam && endDateParam) {
      const startDate = new Date(startDateParam);
      const endDate = new Date(endDateParam);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      where.availabilities = {
        some: {
          date: {
            gte: startDate,
            lte: endDate,
          },
          status: 'AVAILABLE',
        },
        none: {
          date: {
            gte: startDate,
            lte: endDate,
          },
          status: { in: ['BOOKED', 'UNAVAILABLE'] },
        },
      };
    }

    // Determine sorting
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'priceAsc') orderBy = { rentalPricePerDay: 'asc' };
    if (sortBy === 'priceDesc') orderBy = { rentalPricePerDay: 'desc' };
    if (sortBy === 'popular') orderBy = { bookings: { _count: 'desc' } };

    const items = await prisma.item.findMany({
      where,
      orderBy: [
        { isPremium: 'desc' }, // Premium listings are prioritized at top
        orderBy,
      ],
      include: {
        category: true,
        lender: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            isVerified: true,
            university: true,
          },
        },
        images: {
          orderBy: { order: 'asc' },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: { bookings: true, reviews: true },
        },
      },
    });

    // Compute average rating
    let transformedItems = items.map((item) => {
      const totalRatings = item.reviews.reduce((acc, r) => acc + r.rating, 0);
      const avgRating = item.reviews.length > 0 ? (totalRatings / item.reviews.length).toFixed(1) : '5.0';
      return {
        ...item,
        avgRating: parseFloat(avgRating),
        reviewCount: item._count.reviews,
        bookingCount: item._count.bookings,
      };
    });

    if (sortBy === 'topRated') {
      transformedItems = transformedItems.sort((a, b) => b.avgRating - a.avgRating);
    }

    return NextResponse.json({
      success: true,
      data: transformedItems,
      total: transformedItems.length,
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tìm kiếm danh sách đồ cho thuê' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser(request);

    if (!session || !session.sub) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng đăng nhập để đăng sản phẩm cho thuê' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      categoryId,
      conditionStatus = 'Rất tốt',
      rentalPricePerDay,
      depositAmount,
      location,
      images,
      isPremium = false,
      availableDates,
    } = body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'Tên sản phẩm phải có tối thiểu 3 ký tự' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string' || description.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Mô tả chi tiết sản phẩm phải có tối thiểu 10 ký tự' },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng chọn danh mục cho sản phẩm' },
        { status: 400 }
      );
    }

    const price = parseFloat(rentalPricePerDay);
    if (isNaN(price) || price <= 0) {
      return NextResponse.json(
        { success: false, error: 'Giá thuê mỗi ngày phải là số dương lớn hơn 0' },
        { status: 400 }
      );
    }

    const deposit = parseFloat(depositAmount);
    if (isNaN(deposit) || deposit < 0) {
      return NextResponse.json(
        { success: false, error: 'Tiền cọc yêu cầu không hợp lệ' },
        { status: 400 }
      );
    }

    if (!location || typeof location !== 'string' || location.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập vị trí/khu vực nhận trả đồ' },
        { status: 400 }
      );
    }

    // Verify category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!categoryExists) {
      return NextResponse.json(
        { success: false, error: 'Danh mục sản phẩm không tồn tại' },
        { status: 404 }
      );
    }

    // Prepare image array
    const imageUrls: string[] = [];
    if (Array.isArray(images) && images.length > 0) {
      images.forEach((img) => {
        if (typeof img === 'string' && img.trim()) {
          imageUrls.push(img.trim());
        }
      });
    }

    // Default fallback image if none provided
    if (imageUrls.length === 0) {
      imageUrls.push('https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80');
    }

    // Create Item in transaction
    const newItem = await prisma.$transaction(async (tx) => {
      const item = await tx.item.create({
        data: {
          title: title.trim(),
          description: description.trim(),
          categoryId,
          lenderId: session.sub,
          conditionStatus: conditionStatus || 'Rất tốt',
          rentalPricePerDay: price,
          depositAmount: deposit,
          location: location.trim(),
          isPremium: !!isPremium,
          status: 'ACTIVE',
        },
      });

      // Save images
      await tx.itemImage.createMany({
        data: imageUrls.map((url: string, index: number) => ({
          itemId: item.id,
          imageUrl: url,
          isPrimary: index === 0,
          order: index,
        })),
      });

      // Save availability dates (30 days default)
      const datesToInsert = Array.isArray(availableDates) && availableDates.length > 0
        ? availableDates
        : Array.from({ length: 30 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() + i);
            d.setHours(0, 0, 0, 0);
            return d.toISOString();
          });

      for (const dateStr of datesToInsert) {
        const d = new Date(dateStr);
        d.setHours(0, 0, 0, 0);
        await tx.itemAvailability.upsert({
          where: {
            itemId_date: {
              itemId: item.id,
              date: d,
            },
          },
          update: { status: 'AVAILABLE' },
          create: {
            itemId: item.id,
            date: d,
            status: 'AVAILABLE',
          },
        });
      }

      return item;
    });

    return NextResponse.json({
      success: true,
      message: 'Đăng sản phẩm cho thuê thành công!',
      data: newItem,
    });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi đăng sản phẩm cho thuê' },
      { status: 500 }
    );
  }
}
