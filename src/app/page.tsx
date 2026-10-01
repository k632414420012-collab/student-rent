import Link from 'next/link';
import {
  Calendar,
  QrCode,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Clock,
  Laptop,
  Shirt,
  Home as HomeIcon,
  BookOpen,
  Speaker,
  Bike,
  Tag,
  MapPin,
  Star,
  Search,
  GraduationCap,
  HeartHandshake,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import ItemCard from '@/components/item/ItemCard';
import { formatVND } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { items: { where: { status: 'ACTIVE' } } },
      },
    },
    orderBy: { name: 'asc' },
  });

  const sampleItems = await prisma.item.findMany({
    where: { status: 'ACTIVE' },
    orderBy: [
      { isPremium: 'desc' },
      { createdAt: 'desc' },
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
        select: { rating: true },
      },
      _count: {
        select: { bookings: true, reviews: true },
      },
    },
    take: 6,
  });

  const transformedItems = sampleItems.map((item) => {
    const totalRatings = item.reviews.reduce((acc, r) => acc + r.rating, 0);
    const avgRating = item.reviews.length > 0 ? (totalRatings / item.reviews.length).toFixed(1) : '5.0';
    return {
      ...item,
      avgRating: parseFloat(avgRating),
      reviewCount: item._count.reviews,
      bookingCount: item._count.bookings,
    };
  });

  const getCategoryDetails = (slug: string) => {
    switch (slug) {
      case 'dien-tu':
        return {
          icon: <Laptop size={24} />,
          bg: 'var(--pastel-sky-bg)',
          color: '#0284c7',
          border: 'var(--secondary-border)',
        };
      case 'trang-phuc':
        return {
          icon: <Shirt size={24} />,
          bg: 'var(--pastel-rose-bg)',
          color: '#db2777',
          border: '#fbcfe8',
        };
      case 'gia-dung':
        return {
          icon: <HomeIcon size={24} />,
          bg: 'var(--pastel-mint-bg)',
          color: '#059669',
          border: 'var(--accent-border)',
        };
      case 'hoc-tap':
        return {
          icon: <BookOpen size={24} />,
          bg: 'var(--pastel-lemon-bg)',
          color: '#d97706',
          border: '#fef08a',
        };
      case 'am-thanh':
        return {
          icon: <Speaker size={24} />,
          bg: 'var(--pastel-lavender-bg)',
          color: '#7065f0',
          border: 'var(--primary-border)',
        };
      case 'phuong-tien':
        return {
          icon: <Bike size={24} />,
          bg: 'var(--pastel-peach-bg)',
          color: '#ea580c',
          border: '#fed7aa',
        };
      default:
        return {
          icon: <Tag size={24} />,
          bg: 'var(--bg-muted)',
          color: 'var(--text-secondary)',
          border: 'var(--border-subtle)',
        };
    }
  };

  return (
    <div>
      {/* Hero Section - Dreamy Bright Pastel Atmosphere */}
      <section className="hero-section">
        <div className="hero-glow" />
        <div className="hero-glow-2" />
        <div className="hero-glow-3" />
        <div className="app-container">
          <div className="hero-content">
            <div className="hero-tag">
              <Sparkles size={16} style={{ color: '#7065f0' }} />
              <span>Nền tảng Cho thuê Đồ dùng Sinh viên Tự động hóa</span>
            </div>

            <h1 className="hero-title">
              Thuê Đồ Nhanh Chóng <br />
              <span className="hero-highlight">Tự Động & An Toàn Tuyệt Đối</span>
            </h1>

            <p className="hero-subtitle">
              Không còn lo nhắn tin xin phép thủ công hay sợ bùng cọc. Chọn ngày trực tiếp
              trên lịch trống, quét mã VietQR tự động chốt đơn và bảo vệ tiền cọc với Escrow.
            </p>

            {/* Floating Search Dock */}
            <div
              style={{
                maxWidth: '650px',
                margin: '0 auto 32px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(16px)',
                padding: '8px 10px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(222, 218, 251, 0.85)',
                boxShadow: '0 16px 36px -8px rgba(112, 101, 240, 0.16), 0 4px 12px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, padding: '0 14px' }}>
                <Search size={21} style={{ color: 'var(--primary)' }} />
                <form
                  action="/search"
                  method="GET"
                  style={{ display: 'flex', width: '100%', gap: '8px' }}
                >
                  <input
                    type="text"
                    name="q"
                    placeholder="Bạn cần thuê gì? Máy chiếu, loa kéo, vest, flycam..."
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      width: '100%',
                      fontSize: '0.96rem',
                      color: 'var(--text-primary)',
                      padding: '8px 0',
                    }}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary btn-pill"
                    style={{ padding: '10px 24px', fontSize: '0.92rem' }}
                  >
                    <span>Tìm kiếm</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Quick CTA Links */}
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/search" className="btn btn-primary btn-lg btn-pill">
                <Calendar size={18} />
                <span>Khám phá tất cả đồ cho thuê</span>
              </Link>
              <Link
                href="/items/post"
                className="btn btn-secondary btn-lg btn-pill"
              >
                <span>Đăng tin cho thuê</span>
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Trust Points Mini Banner */}
            <div
              style={{
                marginTop: '44px',
                display: 'inline-flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '24px',
                padding: '12px 24px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(222, 218, 251, 0.6)',
                fontSize: '0.86rem',
                color: 'var(--text-secondary)',
                fontWeight: 600,
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} style={{ color: 'var(--accent)' }} /> Bảo vệ cọc Escrow 100%
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={16} style={{ color: 'var(--warning)' }} /> Đối soát VietQR tự động 3s
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <GraduationCap size={16} style={{ color: 'var(--primary)' }} /> Xác thực sinh viên & CCCD
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section style={{ padding: '60px 0 32px', background: 'var(--bg-main)' }}>
        <div className="app-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
            <div>
              <div className="section-badge">Danh mục nổi bật</div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>
                Duyệt đồ theo nhu cầu
              </h2>
            </div>
            <Link
              href="/search"
              style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'var(--primary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--primary-light)',
              }}
            >
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: '18px' }}>
            {categories.map((cat) => {
              const details = getCategoryDetails(cat.slug);
              return (
                <Link
                  key={cat.id}
                  href={`/search?category=${cat.slug}`}
                  className="card card-hover"
                  style={{
                    padding: '22px 18px',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '12px',
                    textDecoration: 'none',
                    background: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '16px',
                      background: details.bg,
                      color: details.color,
                      border: `1px solid ${details.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform var(--transition-bounce)',
                    }}
                  >
                    {details.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)', marginBottom: 2 }}>
                      {cat.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      {cat._count.items} món đồ
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="features-section">
        <div className="app-container">
          <div className="section-header">
            <div className="section-badge">Công Nghệ Lõi</div>
            <h2 className="section-title">Khác biệt vượt trội của BorrowMe</h2>
            <p className="section-subtitle">
              Giải quyết hoàn toàn các bất cập khi thuê đồ qua mạng xã hội với hệ thống vận hành tự động 100%.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper feature-icon-primary">
                <Calendar size={28} />
              </div>
              <h3 className="feature-card-title">Lịch trống Thời gian thực</h3>
              <p className="feature-card-desc">
                Mỗi món đồ có lịch riêng biệt. Tự do drag chọn khoảng ngày cần thuê và hệ thống tự động khóa lịch ngay khi thanh toán.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper feature-icon-secondary">
                <QrCode size={28} />
              </div>
              <h3 className="feature-card-title">Thanh toán VietQR Động</h3>
              <p className="feature-card-desc">
                Sinh mã QR thanh toán tức thì với số tiền và cú pháp chuẩn hóa. Cổng thanh toán webhook tự động xác nhận sau 3 giây.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper feature-icon-accent">
                <ShieldCheck size={28} />
              </div>
              <h3 className="feature-card-title">Quản lý Cọc An toàn (Escrow)</h3>
              <p className="feature-card-desc">
                Hệ thống tạm giữ tiền cọc trung gian. Tự động hoàn cọc 100% khi người thuê trả đồ đúng hạn, bảo vệ an toàn cho cả hai bên.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items Section */}
      <section style={{ padding: '64px 0 80px', background: 'var(--bg-muted)' }}>
        <div className="app-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div className="section-badge">Sản phẩm nổi bật</div>
              <h2 className="section-title" style={{ fontSize: '1.9rem', marginBottom: '6px' }}>Đồ dùng sẵn sàng cho thuê</h2>
              <p className="section-subtitle" style={{ fontSize: '0.98rem' }}>Các món đồ được xác minh uy tín từ cộng đồng sinh viên</p>
            </div>
            <Link
              href="/search"
              className="btn btn-secondary btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: 'var(--radius-full)',
                padding: '8px 18px',
                fontWeight: 600,
              }}
            >
              <span>Xem tất cả ({transformedItems.length})</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(285px, 1fr))', gap: '26px' }}>
            {transformedItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
