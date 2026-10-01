import Link from 'next/link';
import { Sparkles, ShieldCheck, MapPin, Star, Laptop, Shirt, Home as HomeIcon, BookOpen, Speaker, Bike, ArrowRight, Tag } from 'lucide-react';
import { formatVND } from '@/lib/utils';

interface ItemCardProps {
  item: {
    id: string;
    title: string;
    description: string;
    rentalPricePerDay: number;
    depositAmount: number;
    location: string;
    conditionStatus: string;
    isPremium: boolean;
    category: {
      name: string;
      slug: string;
    };
    lender: {
      fullName: string;
      isVerified: boolean;
      university?: string | null;
    };
    images?: Array<{ imageUrl: string; isPrimary: boolean }>;
    avgRating?: number;
    reviewCount?: number;
  };
}

export default function ItemCard({ item }: ItemCardProps) {
  const primaryImage = item.images?.find((img) => img.isPrimary)?.imageUrl || item.images?.[0]?.imageUrl;

  const getCategoryDetails = (slug: string) => {
    switch (slug) {
      case 'dien-tu': return { icon: <Laptop size={44} />, color: '#0284c7' };
      case 'trang-phuc': return { icon: <Shirt size={44} />, color: '#db2777' };
      case 'gia-dung': return { icon: <HomeIcon size={44} />, color: '#059669' };
      case 'hoc-tap': return { icon: <BookOpen size={44} />, color: '#d97706' };
      case 'am-thanh': return { icon: <Speaker size={44} />, color: '#7065f0' };
      case 'phuong-tien': return { icon: <Bike size={44} />, color: '#ea580c' };
      default: return { icon: <Tag size={44} />, color: '#7065f0' };
    }
  };

  const catDetails = getCategoryDetails(item.category.slug);

  return (
    <div
      className="card card-hover"
      style={{
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        background: '#ffffff',
      }}
    >
      {/* Card Visual / Image Banner */}
      <div
        style={{
          height: '190px',
          background: 'linear-gradient(135deg, #f5f3ff 0%, #eff6ff 100%)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: catDetails.color,
          overflow: 'hidden',
        }}
      >
        {primaryImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={primaryImage}
            alt={item.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ opacity: 0.65 }}>
            {catDetails.icon}
          </div>
        )}

        {/* Badges on Top Image */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            right: 12,
            display: 'flex',
            justifyContent: 'space-between',
            pointerEvents: 'none',
          }}
        >
          <span
            className="badge badge-primary"
            style={{
              backdropFilter: 'blur(8px)',
              background: 'rgba(255, 255, 255, 0.92)',
              color: 'var(--primary)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            {item.category.name}
          </span>

          {item.isPremium && (
            <span
              className="badge badge-premium"
              style={{
                backdropFilter: 'blur(8px)',
                background: 'rgba(254, 243, 199, 0.95)',
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.15)',
              }}
            >
              <Sparkles size={12} /> Ưu tiên
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div style={{ padding: '20px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Lender and Location */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '0.82rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            <span>{item.lender.fullName}</span>
            {item.lender.isVerified && (
              <span title="Chủ đồ đã xác thực sinh viên/CCCD" style={{ display: 'inline-flex', color: '#0284c7' }}>
                <ShieldCheck size={15} />
              </span>
            )}
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: 700 }}>
            <Star size={13} fill="#f59e0b" />
            <span>{item.avgRating || '5.0'}</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({item.reviewCount || 0})</span>
          </div>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: '1.08rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
          <Link href={`/items/${item.id}`} style={{ color: 'inherit' }}>
            {item.title}
          </Link>
        </h3>

        {/* Location & Condition */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={13} style={{ color: 'var(--primary)' }} /> {item.location}
          </span>
          <span>•</span>
          <span style={{ color: '#059669', fontWeight: 600, background: 'var(--accent-light)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
            {item.conditionStatus}
          </span>
        </div>

        {/* Description snippet */}
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '18px', flex: 1, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.55 }}>
          {item.description}
        </p>

        {/* Bottom Pricing & Action */}
        <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 500 }}>Giá thuê</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.3px' }}>
              {formatVND(item.rentalPricePerDay)}
              <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)' }}>/ngày</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 2 }}>
              Cọc: <strong style={{ color: '#059669' }}>{formatVND(item.depositAmount)}</strong>
            </div>
          </div>

          <Link href={`/items/${item.id}`} className="btn btn-primary btn-sm btn-pill" style={{ padding: '8px 16px' }}>
            <span>Chọn ngày</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
