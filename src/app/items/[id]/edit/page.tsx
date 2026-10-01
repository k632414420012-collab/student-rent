'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Edit3,
  Sparkles,
  ShieldCheck,
  Info,
  ArrowRight,
  Upload,
  CheckCircle2,
  Tag,
  MapPin,
  Image as ImageIcon,
  DollarSign,
  AlertTriangle,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
} from 'lucide-react';
import { formatVND } from '@/lib/utils';

function EditItemContent() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;
  const { user, loading: authLoading } = useAuth();

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [conditionStatus, setConditionStatus] = useState('Rất tốt');
  const [rentalPricePerDay, setRentalPricePerDay] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'HIDDEN'>('ACTIVE');
  const [isPremium, setIsPremium] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 1. Fetch categories and item details
  useEffect(() => {
    async function initData() {
      if (!itemId) return;

      try {
        setLoading(true);
        // Fetch categories
        const catRes = await fetch('/api/categories');
        const catData = await catRes.json();
        if (catData.success) {
          setCategories(catData.data);
        }

        // Fetch item detail
        const itemRes = await fetch(`/api/items/${itemId}`);
        const itemData = await itemRes.json();

        if (itemData.success && itemData.data) {
          const it = itemData.data;
          setTitle(it.title);
          setCategoryId(it.categoryId);
          setDescription(it.description);
          setConditionStatus(it.conditionStatus);
          setRentalPricePerDay(it.rentalPricePerDay.toString());
          setDepositAmount(it.depositAmount.toString());
          setLocation(it.location);
          setStatus(it.status === 'HIDDEN' ? 'HIDDEN' : 'ACTIVE');
          setIsPremium(!!it.isPremium);

          if (it.images && it.images.length > 0) {
            setImages(it.images.map((img: any) => img.imageUrl));
          } else {
            setImages([
              'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
            ]);
          }

          // Check if current user is owner or admin
          if (user && it.lenderId !== user.id && user.role !== 'ADMIN') {
            setFetchError('Bạn không có quyền chỉnh sửa sản phẩm này');
          }
        } else {
          setFetchError(itemData.error || 'Không tìm thấy thông tin sản phẩm');
        }
      } catch (err) {
        setFetchError('Lỗi kết nối máy chủ');
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      initData();
    }
  }, [itemId, user, authLoading]);

  // Handle Add Image URL
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImages([...images, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  // Handle Remove Image
  const handleRemoveImage = (index: number) => {
    if (images.length === 1) {
      alert('Sản phẩm phải có ít nhất 1 hình ảnh');
      return;
    }
    setImages(images.filter((_, i) => i !== index));
  };

  // Handle Submit Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!title.trim() || title.trim().length < 3) {
      setErrorMsg('Tên sản phẩm phải có tối thiểu 3 ký tự');
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setErrorMsg('Mô tả chi tiết phải có tối thiểu 10 ký tự');
      return;
    }

    const price = parseFloat(rentalPricePerDay);
    if (isNaN(price) || price <= 0) {
      setErrorMsg('Giá thuê mỗi ngày phải lớn hơn 0');
      return;
    }

    const deposit = parseFloat(depositAmount);
    if (isNaN(deposit) || deposit < 0) {
      setErrorMsg('Tiền cọc không hợp lệ');
      return;
    }

    if (!location.trim()) {
      setErrorMsg('Vui lòng nhập địa điểm/khu vực nhận trả đồ');
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch(`/api/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          categoryId,
          conditionStatus,
          rentalPricePerDay: price,
          depositAmount: deposit,
          location: location.trim(),
          status,
          isPremium,
          images,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Cập nhật thông tin sản phẩm thành công!');
        setTimeout(() => {
          router.push(`/items/${itemId}`);
        }, 1200);
      } else {
        setErrorMsg(data.error || 'Cập nhật thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      setErrorMsg('Lỗi kết nối máy chủ khi lưu thông tin');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="app-container" style={{ padding: '80px 16px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-container" style={{ padding: '80px 16px', maxWidth: 520, margin: '0 auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '40px 24px', borderRadius: 'var(--radius-xl)' }}>
          <Lock size={36} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>
            Yêu cầu Đăng nhập
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.92rem' }}>
            Vui lòng đăng nhập để chỉnh sửa thông tin món đồ cho thuê.
          </p>
          <Link href={`/login?redirect=/items/${itemId}/edit`} className="btn btn-primary">
            <span>Đăng nhập</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="app-container" style={{ padding: '80px 16px', maxWidth: 540, margin: '0 auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '40px 24px', borderRadius: 'var(--radius-xl)' }}>
          <AlertTriangle size={36} color="#ef4444" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 8 }}>
            Không thể truy cập
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.92rem' }}>
            {fetchError}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link href="/my-items" className="btn btn-primary">
              <span>Về đồ của tôi</span>
            </Link>
            <Link href="/search" className="btn btn-secondary">
              <span>Khám phá đồ thuê</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 16px 80px', minHeight: '85vh' }}>
      <div className="app-container" style={{ maxWidth: 960, margin: '0 auto' }}>
        
        {/* Navigation & Header */}
        <div style={{ marginBottom: 28 }}>
          <Link
            href={`/items/${itemId}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
              marginBottom: 12,
            }}
          >
            <ArrowLeft size={16} />
            <span>Quay lại trang chi tiết sản phẩm</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                Chỉnh Sửa Thông Tin Sản Phẩm
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem' }}>
                Cập nhật mô tả, hình ảnh, mức giá hoặc chuyển trạng thái hiển thị món đồ.
              </p>
            </div>

            <Link href="/my-items" className="btn btn-secondary btn-sm">
              <span>Xem tất cả đồ của tôi</span>
            </Link>
          </div>
        </div>

        {/* Feedback Alerts */}
        {successMsg && (
          <div
            style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              marginBottom: 24,
              color: '#065f46',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <CheckCircle2 size={22} color="var(--accent)" />
            <div>
              <strong>{successMsg}</strong>
            </div>
          </div>
        )}

        {errorMsg && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              marginBottom: 24,
              color: '#b91c1c',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertTriangle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }}>
            
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Core Information Card */}
              <div
                className="card"
                style={{
                  padding: '28px',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Tag size={20} color="var(--primary)" />
                  <span>1. Thông tin Cơ bản</span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {/* Title */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                      Tên món đồ / Thiết bị cho thuê *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-strong)',
                        fontSize: '0.95rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Category & Condition */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                        Danh mục sản phẩm *
                      </label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-strong)',
                          fontSize: '0.92rem',
                          outline: 'none',
                          background: '#fff',
                        }}
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                        Tình trạng món đồ *
                      </label>
                      <select
                        value={conditionStatus}
                        onChange={(e) => setConditionStatus(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-strong)',
                          fontSize: '0.92rem',
                          outline: 'none',
                          background: '#fff',
                        }}
                      >
                        <option value="Mới 99%">Mới 99% (Như mới, không trầy)</option>
                        <option value="Rất tốt">Rất tốt (Hoạt động hoàn hảo)</option>
                        <option value="Tốt">Tốt (Đã sử dụng, ngoại hình đẹp)</option>
                        <option value="Khá">Khá (Có trầy xước nhẹ)</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                      Mô tả chi tiết & Phụ kiện đi kèm *
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-strong)',
                        fontSize: '0.92rem',
                        outline: 'none',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                      Địa điểm nhận và trả đồ *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                        <MapPin size={18} />
                      </span>
                      <input
                        type="text"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 14px 11px 42px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-strong)',
                          fontSize: '0.92rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Images Card */}
              <div
                className="card"
                style={{
                  padding: '28px',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ImageIcon size={20} color="var(--primary)" />
                  <span>2. Quản lý Hình ảnh</span>
                </h3>

                {/* Previews */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12, marginBottom: 16 }}>
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'relative',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        aspectRatio: '4/3',
                        border: idx === 0 ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`Preview ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      
                      {idx === 0 && (
                        <span
                          style={{
                            position: 'absolute',
                            top: 4,
                            left: 4,
                            background: 'var(--primary)',
                            color: '#fff',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: 4,
                          }}
                        >
                          Ảnh chính
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        style={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          background: 'rgba(0,0,0,0.6)',
                          color: '#fff',
                          borderRadius: '50%',
                          width: 24,
                          height: 24,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                        title="Xóa ảnh này"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Image URL */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="url"
                    placeholder="Dán đường dẫn ảnh mới (URL Unsplash, Cloudinary, Imgur...)"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-strong)',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="btn btn-secondary"
                    style={{ padding: '0 16px', fontSize: '0.88rem' }}
                  >
                    <span>Thêm ảnh</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column: Pricing & Status */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              <div
                className="card"
                style={{
                  padding: '24px',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-subtle)',
                  background: '#ffffff',
                }}
              >
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <DollarSign size={20} color="var(--accent)" />
                  <span>3. Giá thuê & Trạng thái</span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Status Toggle */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                      Trạng thái hiển thị món đồ *
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <button
                        type="button"
                        onClick={() => setStatus('ACTIVE')}
                        style={{
                          padding: '10px',
                          borderRadius: 'var(--radius-md)',
                          border: `2px solid ${status === 'ACTIVE' ? 'var(--accent)' : 'var(--border-subtle)'}`,
                          background: status === 'ACTIVE' ? 'var(--accent-light)' : '#fff',
                          color: status === 'ACTIVE' ? '#065f46' : 'var(--text-secondary)',
                          fontWeight: 700,
                          fontSize: '0.86rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                        }}
                      >
                        <Eye size={16} />
                        <span>Đang cho thuê</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStatus('HIDDEN')}
                        style={{
                          padding: '10px',
                          borderRadius: 'var(--radius-md)',
                          border: `2px solid ${status === 'HIDDEN' ? '#d97706' : 'var(--border-subtle)'}`,
                          background: status === 'HIDDEN' ? '#fffbeb' : '#fff',
                          color: status === 'HIDDEN' ? '#92400e' : 'var(--text-secondary)',
                          fontWeight: 700,
                          fontSize: '0.86rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                        }}
                      >
                        <EyeOff size={16} />
                        <span>Tạm ẩn</span>
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                      Giá thuê mỗi ngày (VNĐ/ngày) *
                    </label>
                    <input
                      type="number"
                      required
                      min={5000}
                      step={5000}
                      value={rentalPricePerDay}
                      onChange={(e) => setRentalPricePerDay(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-strong)',
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: 'var(--primary)',
                        outline: 'none',
                      }}
                    />
                    {rentalPricePerDay && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                        Hiển thị: <strong>{formatVND(parseFloat(rentalPricePerDay) || 0)} / ngày</strong>
                      </span>
                    )}
                  </div>

                  {/* Deposit */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                      Tiền cọc yêu cầu (VNĐ) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={10000}
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-strong)',
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: 'var(--accent)',
                        outline: 'none',
                      }}
                    />
                    {depositAmount && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                        Hiển thị cọc: <strong>{formatVND(parseFloat(depositAmount) || 0)}</strong>
                      </span>
                    )}
                  </div>

                  {/* Premium checkbox */}
                  <div
                    style={{
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)', display: 'block' }}>
                        Gói tin ưu tiên (Premium)
                      </strong>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        Ưu tiên vị trí hiển thị
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isPremium}
                      onChange={(e) => setIsPremium(e.target.checked)}
                      style={{ width: 18, height: 18, cursor: 'pointer' }}
                    />
                  </div>
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-lg"
                  style={{
                    width: '100%',
                    marginTop: 20,
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? (
                    <span>Đang lưu thay đổi...</span>
                  ) : (
                    <>
                      <Edit3 size={18} />
                      <span>Lưu Thay Đổi</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        </form>

      </div>
    </div>
  );
}

export default function EditItemPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '60px 0' }}>Đang tải...</div>}>
      <EditItemContent />
    </Suspense>
  );
}
