'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  Star,
  MapPin,
  Calendar,
  Sparkles,
  Info,
  CheckCircle,
  ArrowRight,
  User,
  Clock,
  Laptop,
  Shirt,
  Home as HomeIcon,
  BookOpen,
  Speaker,
  Bike,
  Shield,
  MessageCircle,
  Edit,
  Package,
  Eye,
  EyeOff,
  Phone,
} from 'lucide-react';
import AvailabilityCalendar from '@/components/calendar/AvailabilityCalendar';
import { formatVND } from '@/lib/utils';

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;
  const { user } = useAuth();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Selected Booking Parameters
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [totalRental, setTotalRental] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);
  const [withProtectionPlan, setWithProtectionPlan] = useState(false);
  const PROTECTION_FEE = 15000; // 15,000 VND for optional protection plan

  useEffect(() => {
    async function fetchItem() {
      try {
        setLoading(true);
        const res = await fetch(`/api/items/${itemId}`);
        const data = await res.json();
        if (data.success) {
          setItem(data.data);
          setDepositAmount(data.data.depositAmount);
        } else {
          setError(data.error || 'Không thể tải thông tin món đồ');
        }
      } catch (err) {
        setError('Lỗi kết nối máy chủ');
      } finally {
        setLoading(false);
      }
    }
    if (itemId) fetchItem();
  }, [itemId]);

  const handleRangeSelect = (start: Date | null, end: Date | null, rental: number, deposit: number) => {
    setStartDate(start);
    setEndDate(end);
    setTotalRental(rental);
    setDepositAmount(deposit);
  };

  const handleProceedToCheckout = () => {
    if (!startDate || !endDate) {
      alert('Vui lòng chọn khoảng ngày bắt đầu và kết thúc trên lịch trước khi tiếp tục!');
      return;
    }

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    router.push(
      `/checkout/${itemId}?start=${startStr}&end=${endStr}&protect=${withProtectionPlan}`
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>Đang tải thông tin món đồ...</div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>{error || 'Không tìm thấy sản phẩm'}</h2>
        <Link href="/search" className="btn btn-primary btn-sm">
          Quay lại tìm kiếm
        </Link>
      </div>
    );
  }

  const isOwner = user && (user.id === item.lenderId || user.role === 'ADMIN');
  const allImages = item.images && item.images.length > 0
    ? item.images.map((img: any) => img.imageUrl)
    : ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80'];
  
  const currentImage = allImages[selectedImageIndex] || allImages[0];

  const daysCount = startDate && endDate
    ? Math.ceil(Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 0;

  const grandTotal = totalRental + depositAmount + (withProtectionPlan ? PROTECTION_FEE : 0);

  return (
    <div style={{ padding: '36px 0 80px', background: 'var(--bg-main)' }}>
      <div className="app-container">
        
        {/* Owner Management Bar */}
        {isOwner && (
          <div
            style={{
              background: 'linear-gradient(135deg, var(--pastel-lavender-bg) 0%, var(--primary-light) 100%)',
              border: '1px solid var(--primary-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 22px',
              marginBottom: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 14,
              boxShadow: '0 4px 14px rgba(112, 101, 240, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldCheck size={20} color="var(--primary)" />
              <span style={{ fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                👑 Bạn là chủ sở hữu của món đồ này ({item.status === 'ACTIVE' ? 'Đang hiển thị cho thuê' : 'Đang tạm ẩn'}).
              </span>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Link href={`/items/${item.id}/edit`} className="btn btn-primary btn-sm btn-pill">
                <Edit size={14} />
                <span>Chỉnh sửa món đồ</span>
              </Link>
              <Link href="/my-items" className="btn btn-secondary btn-sm btn-pill">
                <Package size={14} style={{ color: 'var(--primary)' }} />
                <span>Đồ của tôi</span>
              </Link>
            </div>
          </div>
        )}

        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px', alignItems: 'center' }}>
          <Link href="/">Trang chủ</Link>
          <span>/</span>
          <Link href={`/search?category=${item.category?.slug}`}>{item.category?.name}</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.title}</span>
        </div>

        {/* 2-Column Grid: Details + Booking Sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px', alignItems: 'start' }}>
          
          {/* Left Column: Media, Details, Calendar, Reviews */}
          <div>
            {/* Visual Media Showcase */}
            <div style={{ marginBottom: '28px' }}>
              <div
                style={{
                  height: '380px',
                  background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentImage}
                  alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: '8px' }}>
                  <span className="badge badge-primary">{item.category?.name}</span>
                  {item.isPremium && (
                    <span className="badge badge-premium">
                      <Sparkles size={13} /> Gói Ưu tiên
                    </span>
                  )}
                  <span
                    className={`badge ${item.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}
                  >
                    {item.status === 'ACTIVE' ? '● Khả dụng' : '○ Tạm ẩn'}
                  </span>
                </div>
              </div>

              {/* Multiple Images Thumbnail Strip */}
              {allImages.length > 1 && (
                <div style={{ display: 'flex', gap: 10, marginTop: 12, overflowX: 'auto', paddingBottom: 4 }}>
                  {allImages.map((imgUrl: string, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      style={{
                        width: 72,
                        height: 54,
                        borderRadius: '8px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: selectedImageIndex === idx ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                        opacity: selectedImageIndex === idx ? 1 : 0.65,
                        transition: 'all var(--transition-fast)',
                        flexShrink: 0,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgUrl} alt={`Thumb ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Key Highlights */}
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ fontSize: '1.95rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', lineHeight: 1.25 }}>
                {item.title}
              </h1>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 600 }}>
                  <CheckCircle size={16} /> Tình trạng: {item.conditionStatus}
                </span>
                <span>•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={16} /> {item.location}
                </span>
                <span>•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#eab308', fontWeight: 700 }}>
                  <Star size={16} fill="#eab308" /> {item.avgRating || '5.0'} ({item.reviewCount || 0} đánh giá)
                </span>
              </div>
            </div>

            {/* Description Card */}
            <div className="card" style={{ marginBottom: '32px', borderRadius: 'var(--radius-xl)' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
                Mô tả chi tiết sản phẩm
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', whiteSpace: 'pre-line' }}>
                {item.description}
              </p>
            </div>

            {/* Availability Calendar Component */}
            <div style={{ marginBottom: '32px' }}>
              <AvailabilityCalendar
                itemId={item.id}
                availabilities={item.availabilities || []}
                rentalPricePerDay={item.rentalPricePerDay}
                depositAmount={item.depositAmount}
                mode="renter"
                onRangeSelect={handleRangeSelect}
              />
            </div>

            {/* Lender Profile Card */}
            <div className="card" style={{ marginBottom: '32px', borderRadius: 'var(--radius-xl)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
                Thông tin người cho thuê (Chủ đồ)
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'var(--gradient-primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.3rem',
                  }}
                >
                  {item.lender.fullName?.charAt(0) || 'U'}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1.05rem' }}>
                    <span>{item.lender.fullName}</span>
                    {item.lender.isVerified && (
                      <span className="badge badge-verified" style={{ fontSize: '0.72rem' }}>
                        <ShieldCheck size={12} /> Đã xác thực SV
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {item.lender.university || 'Sinh viên Đại học'}
                    {item.lender.phone && ` • SĐT: ${item.lender.phone}`}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {item.lender.phone && (
                    <a
                      href={`https://zalo.me/${item.lender.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Phone size={14} />
                      <span>Liên hệ Zalo</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="card" style={{ borderRadius: 'var(--radius-xl)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Đánh giá từ người thuê ({item.reviewCount || 0})
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#eab308' }}>
                  <Star size={16} fill="#eab308" />
                  <span>{item.avgRating || '5.0'} / 5.0</span>
                </div>
              </div>

              {item.reviews && item.reviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {item.reviews.map((rev: any) => (
                    <div key={rev.id} style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{rev.reviewer.fullName}</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '2px', color: '#eab308', marginBottom: '6px' }}>
                        {Array.from({ length: rev.rating }).map((_, idx) => (
                          <Star key={idx} size={13} fill="#eab308" />
                        ))}
                      </div>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{rev.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                  Chưa có đánh giá nào cho món đồ này. Hãy là người thuê đầu tiên!
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Pricing & Booking Card */}
          <div style={{ position: 'sticky', top: '92px' }}>
            <div className="card" style={{ boxShadow: 'var(--shadow-xl)', border: '1px solid var(--primary-border)', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <span style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.5px' }}>
                    {formatVND(item.rentalPricePerDay)}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}> / ngày</span>
                </div>
                <span className={`badge ${item.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>
                  {item.status === 'ACTIVE' ? 'Sẵn sàng thuê' : 'Đang tạm ẩn'}
                </span>
              </div>

              {/* Selected Dates Display */}
              <div style={{ background: 'var(--bg-muted)', padding: '14px 16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 500 }}>Thời gian thuê dự kiến</div>
                {startDate && endDate ? (
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.94rem' }}>
                    {startDate.toLocaleDateString('vi-VN')} ➔ {endDate.toLocaleDateString('vi-VN')}
                    <span style={{ color: 'var(--primary)', marginLeft: '6px' }}>({daysCount} ngày)</span>
                  </div>
                ) : (
                  <div style={{ color: '#d97706', fontSize: '0.86rem', fontWeight: 600 }}>
                    Chọn khoảng ngày trên lịch bên trái
                  </div>
                )}
              </div>

              {/* Cost Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Tiền thuê ({daysCount} ngày):</span>
                  <span style={{ fontWeight: 600 }}>{formatVND(totalRental)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>Tiền cọc giữ qua Escrow:</span>
                    <span title="Hoàn trả 100% tự động khi trả đồ đúng hạn"><Info size={13} /></span>
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{formatVND(depositAmount)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Phí nền tảng (8%):</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Miễn phí</span>
                </div>

                {/* Protection Plan Option */}
                <div style={{ marginTop: '6px', paddingTop: '10px', borderTop: '1px dashed var(--border-subtle)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.84rem' }}>
                    <input
                      type="checkbox"
                      checked={withProtectionPlan}
                      onChange={(e) => setWithProtectionPlan(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                    />
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      Gói bảo vệ đồ dùng (+{formatVND(PROTECTION_FEE)})
                    </span>
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '2px solid var(--border-subtle)', fontSize: '1.1rem', fontWeight: 800 }}>
                  <span>Tổng tiền thanh toán:</span>
                  <span style={{ color: 'var(--primary)' }}>{formatVND(grandTotal)}</span>
                </div>
              </div>

              {/* Action Button */}
              {isOwner ? (
                <Link
                  href={`/items/${item.id}/edit`}
                  className="btn btn-primary btn-lg btn-pill"
                  style={{ width: '100%' }}
                >
                  <Edit size={18} />
                  <span>Chỉnh sửa món đồ của bạn</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  disabled={!startDate || !endDate || item.status !== 'ACTIVE'}
                  className="btn btn-primary btn-lg btn-pill"
                  style={{
                    width: '100%',
                    opacity: !startDate || !endDate || item.status !== 'ACTIVE' ? 0.6 : 1,
                    cursor: !startDate || !endDate || item.status !== 'ACTIVE' ? 'not-allowed' : 'pointer',
                  }}
                >
                  <span>{item.status !== 'ACTIVE' ? 'Món đồ đang tạm ẩn' : 'Tiếp tục đặt đồ'}</span>
                  <ArrowRight size={18} />
                </button>
              )}

              {/* Escrow Guarantee Note */}
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <ShieldCheck size={16} color="var(--accent)" />
                <span>Tiền cọc được giữ an toàn bởi BorrowMe Escrow</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
