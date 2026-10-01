import Link from 'next/link';
import { Suspense } from 'react';
import prisma from '@/lib/prisma';
import ItemCard from '@/components/item/ItemCard';
import ItemFilters from '@/components/item/ItemFilters';
import {
  Search,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Tag,
  DollarSign,
  MapPin,
  Calendar,
  Layers,
  X,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { formatVND } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: {
    q?: string;
    category?: string;
    condition?: string;
    minPrice?: string;
    maxPrice?: string;
    location?: string;
    verifiedOnly?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    premium?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const keyword = searchParams.q || '';
  const categorySlug = searchParams.category || '';
  const condition = searchParams.condition || '';
  const minPrice = searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined;
  const maxPrice = searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined;
  const location = searchParams.location || '';
  const verifiedOnly = searchParams.verifiedOnly === 'true';
  const isPremiumOnly = searchParams.premium === 'true';
  const sortBy = searchParams.sortBy || 'newest';
  const startDateParam = searchParams.startDate;
  const endDateParam = searchParams.endDate;

  // Query categories for filter sidebar
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { items: { where: { status: 'ACTIVE' } } },
      },
    },
    orderBy: { name: 'asc' },
  });

  // Find active category object if any
  const currentCategory = categories.find((c) => c.slug === categorySlug);

  // Build Prisma where filter
  const where: any = {
    status: 'ACTIVE',
  };

  if (keyword) {
    where.OR = [
      { title: { contains: keyword } },
      { description: { contains: keyword } },
      { location: { contains: keyword } },
    ];
  }

  if (categorySlug) {
    where.category = { slug: categorySlug };
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

  // Filter by calendar availability dates
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

  // Determine Prisma DB sorting
  let orderBy: any = { createdAt: 'desc' };
  if (sortBy === 'priceAsc') orderBy = { rentalPricePerDay: 'asc' };
  if (sortBy === 'priceDesc') orderBy = { rentalPricePerDay: 'desc' };
  if (sortBy === 'popular') orderBy = { bookings: { _count: 'desc' } };

  const items = await prisma.item.findMany({
    where,
    orderBy: [{ isPremium: 'desc' }, orderBy],
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
        select: { rating: true },
      },
      _count: {
        select: { bookings: true, reviews: true },
      },
    },
  });

  // Transform items with average rating
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

  // Helper to build URL without a specific query param
  const buildRemoveUrl = (removeKey: string) => {
    const params = new URLSearchParams();
    if (keyword && removeKey !== 'q') params.set('q', keyword);
    if (categorySlug && removeKey !== 'category') params.set('category', categorySlug);
    if (condition && removeKey !== 'condition') params.set('condition', condition);
    if (minPrice !== undefined && removeKey !== 'minPrice' && removeKey !== 'price') params.set('minPrice', minPrice.toString());
    if (maxPrice !== undefined && removeKey !== 'maxPrice' && removeKey !== 'price') params.set('maxPrice', maxPrice.toString());
    if (location && removeKey !== 'location') params.set('location', location);
    if (verifiedOnly && removeKey !== 'verifiedOnly') params.set('verifiedOnly', 'true');
    if (isPremiumOnly && removeKey !== 'premium') params.set('premium', 'true');
    if (startDateParam && removeKey !== 'dates') params.set('startDate', startDateParam);
    if (endDateParam && removeKey !== 'dates') params.set('endDate', endDateParam);
    if (sortBy && sortBy !== 'newest' && removeKey !== 'sortBy') params.set('sortBy', sortBy);

    const qs = params.toString();
    return `/search${qs ? `?${qs}` : ''}`;
  };

  // Helper to change sort param
  const buildSortUrl = (newSort: string) => {
    const params = new URLSearchParams();
    if (keyword) params.set('q', keyword);
    if (categorySlug) params.set('category', categorySlug);
    if (condition) params.set('condition', condition);
    if (minPrice !== undefined) params.set('minPrice', minPrice.toString());
    if (maxPrice !== undefined) params.set('maxPrice', maxPrice.toString());
    if (location) params.set('location', location);
    if (verifiedOnly) params.set('verifiedOnly', 'true');
    if (isPremiumOnly) params.set('premium', 'true');
    if (startDateParam) params.set('startDate', startDateParam);
    if (endDateParam) params.set('endDate', endDateParam);
    if (newSort !== 'newest') params.set('sortBy', newSort);

    const qs = params.toString();
    return `/search${qs ? `?${qs}` : ''}`;
  };

  const hasAnyFilter =
    keyword ||
    categorySlug ||
    condition ||
    minPrice !== undefined ||
    maxPrice !== undefined ||
    location ||
    verifiedOnly ||
    isPremiumOnly ||
    startDateParam ||
    endDateParam;

  return (
    <div style={{ padding: '36px 0 80px', background: 'var(--bg-main)' }}>
      <div className="app-container">
        {/* Breadcrumb & Title */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <Link href="/" style={{ color: 'var(--text-secondary)' }}>Trang chủ</Link>
            <span>/</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Tìm kiếm đồ cho thuê</span>
            {currentCategory && (
              <>
                <span>/</span>
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{currentCategory.name}</span>
              </>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '6px' }}>
                {currentCategory ? `Đồ dùng: ${currentCategory.name}` : keyword ? `Kết quả cho "${keyword}"` : 'Khám Phá & Thuê Đồ Dùng Sinh Viên'}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                Tìm thấy <strong style={{ color: 'var(--primary)', fontWeight: 700 }}>{transformedItems.length}</strong> món đồ sẵn sàng cho thuê với lịch trống tự động.
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Layout: Filter Sidebar + Products Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '290px 1fr', gap: '28px', alignItems: 'start' }}>
          {/* Left Filter Sidebar */}
          <aside style={{ position: 'sticky', top: '90px' }}>
            <Suspense fallback={<div style={{ padding: 20, background: '#fff', borderRadius: 12 }}>Đang tải bộ lọc...</div>}>
              <ItemFilters categories={categories} />
            </Suspense>
          </aside>

          {/* Right Content Area */}
          <div>
            {/* Active Filters Bar */}
            {hasAnyFilter && (
              <div
                style={{
                  background: '#fff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Filter size={13} style={{ color: 'var(--primary)' }} />
                  Đang lọc theo:
                </span>

                {keyword && (
                  <Link
                    href={buildRemoveUrl('q')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      background: 'rgba(79, 70, 229, 0.08)',
                      color: 'var(--primary)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      border: '1px solid rgba(79, 70, 229, 0.2)',
                    }}
                  >
                    <span>Từ khóa: &quot;{keyword}&quot;</span>
                    <X size={13} />
                  </Link>
                )}

                {categorySlug && (
                  <Link
                    href={buildRemoveUrl('category')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      background: 'rgba(79, 70, 229, 0.08)',
                      color: 'var(--primary)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      border: '1px solid rgba(79, 70, 229, 0.2)',
                    }}
                  >
                    <span>Danh mục: {currentCategory?.name || categorySlug}</span>
                    <X size={13} />
                  </Link>
                )}

                {condition && (
                  <Link
                    href={buildRemoveUrl('condition')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      background: 'rgba(5, 150, 105, 0.08)',
                      color: '#059669',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      border: '1px solid rgba(5, 150, 105, 0.2)',
                    }}
                  >
                    <Tag size={12} />
                    <span>Tình trạng: {condition}</span>
                    <X size={13} />
                  </Link>
                )}

                {(minPrice !== undefined || maxPrice !== undefined) && (
                  <Link
                    href={buildRemoveUrl('price')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      background: 'rgba(2, 132, 199, 0.08)',
                      color: '#0284c7',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      border: '1px solid rgba(2, 132, 199, 0.2)',
                    }}
                  >
                    <DollarSign size={12} />
                    <span>
                      Giá: {minPrice ? formatVND(minPrice) : '0đ'} - {maxPrice ? formatVND(maxPrice) : '∞'}
                    </span>
                    <X size={13} />
                  </Link>
                )}

                {location && (
                  <Link
                    href={buildRemoveUrl('location')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      background: 'rgba(217, 119, 6, 0.08)',
                      color: '#d97706',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      border: '1px solid rgba(217, 119, 6, 0.2)',
                    }}
                  >
                    <MapPin size={12} />
                    <span>Khu vực: {location}</span>
                    <X size={13} />
                  </Link>
                )}

                {verifiedOnly && (
                  <Link
                    href={buildRemoveUrl('verifiedOnly')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      background: 'rgba(2, 132, 199, 0.1)',
                      color: '#0284c7',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      border: '1px solid rgba(2, 132, 199, 0.3)',
                    }}
                  >
                    <ShieldCheck size={12} />
                    <span>Chủ đồ đã xác thực</span>
                    <X size={13} />
                  </Link>
                )}

                {isPremiumOnly && (
                  <Link
                    href={buildRemoveUrl('premium')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      background: 'rgba(245, 158, 11, 0.1)',
                      color: '#b45309',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                    }}
                  >
                    <Sparkles size={12} />
                    <span>Tin ưu tiên</span>
                    <X size={13} />
                  </Link>
                )}

                {(startDateParam || endDateParam) && (
                  <Link
                    href={buildRemoveUrl('dates')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      background: 'rgba(79, 70, 229, 0.08)',
                      color: 'var(--primary)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      border: '1px solid rgba(79, 70, 229, 0.2)',
                    }}
                  >
                    <Calendar size={12} />
                    <span>
                      Ngày: {startDateParam || '...'} → {endDateParam || '...'}
                    </span>
                    <X size={13} />
                  </Link>
                )}

                <Link
                  href="/search"
                  style={{
                    marginLeft: 'auto',
                    fontSize: '0.78rem',
                    color: '#ef4444',
                    fontWeight: 600,
                    textDecoration: 'underline',
                  }}
                >
                  Xóa tất cả
                </Link>
              </div>
            )}

            {/* Quick Sort Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '18px',
                padding: '10px 16px',
                background: '#fff',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                fontSize: '0.86rem',
              }}
            >
              <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                Hiển thị <strong style={{ color: 'var(--text-primary)' }}>{transformedItems.length}</strong> kết quả
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <ArrowUpDown size={13} />
                  Sắp xếp:
                </span>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Mới nhất', key: 'newest' },
                    { label: 'Giá tăng dần', key: 'priceAsc' },
                    { label: 'Giá giảm dần', key: 'priceDesc' },
                    { label: 'Đánh giá cao ⭐', key: 'topRated' },
                    { label: 'Thuê nhiều', key: 'popular' },
                  ].map((s) => {
                    const isActive = sortBy === s.key;
                    return (
                      <Link
                        key={s.key}
                        href={buildSortUrl(s.key)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: isActive ? 700 : 500,
                          background: isActive ? 'var(--primary)' : '#f1f5f9',
                          color: isActive ? '#fff' : 'var(--text-secondary)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {s.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Listings Grid or Empty State */}
            {transformedItems.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {transformedItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div
                style={{
                  background: '#fff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '16px',
                  padding: '56px 24px',
                  textAlign: 'center',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.08)',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <AlertCircle size={32} />
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Không tìm thấy món đồ phù hợp
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '460px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                  Không có sản phẩm nào khớp với các tiêu chí tìm kiếm của bạn. Hãy thử nới lỏng khoảng giá, thay đổi từ khóa hoặc xem các gợi ý dưới đây.
                </p>

                {/* Suggestions / Popular Searches */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Gợi ý tìm kiếm phổ biến
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <Link href="/search?category=dien-tu" className="badge badge-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                      Máy chiếu & Máy ảnh
                    </Link>
                    <Link href="/search?category=trang-phuc" className="badge badge-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                      Vest sự kiện
                    </Link>
                    <Link href="/search?category=am-thanh" className="badge badge-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                      Loa kéo KTX
                    </Link>
                    <Link href="/search?location=KTX Khu B" className="badge badge-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                      KTX Khu B
                    </Link>
                    <Link href="/search?condition=Mới 99%" className="badge badge-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                      Đồ mới 99%
                    </Link>
                  </div>
                </div>

                <Link href="/search" className="btn btn-secondary btn-sm" style={{ fontWeight: 600 }}>
                  Xóa tất cả bộ lọc & xem toàn bộ
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
