'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  PlusCircle,
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
  Package,
} from 'lucide-react';
import { formatVND } from '@/lib/utils';

// Sample student item presets for quick testing and selection
const ITEM_PRESETS = [
  {
    categorySlug: 'dien-tu',
    title: 'Máy chiếu Mini Epson Full HD 3000 lumens kết nối HDMI/Wifi',
    description: 'Máy chiếu còn rất mới, độ sáng cao, đầy đủ cáp HDMI và remote. Thích hợp cho thuyết trình đồ án, chiếu phim phòng trọ hoặc KTX.',
    price: 70000,
    deposit: 500000,
    condition: 'Rất tốt',
    location: 'KTX Khu B ĐHQG TP.HCM',
    imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80',
  },
  {
    categorySlug: 'dien-tu',
    title: 'Máy ảnh Sony Alpha A6400 kèm lens Kit 16-50mm',
    description: 'Body + Lens kit chụp nét, quay 4K lấy nét siêu nhanh. Kèm 2 pin, sạc đôi và thẻ 64GB. Rất hợp cho các bạn sinh viên chụp kỷ yếu hoặc quay sự kiện.',
    price: 150000,
    deposit: 1200000,
    condition: 'Mới 99%',
    location: 'Quận 10, TP.HCM (Gần ĐH Bách Khoa)',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
  },
  {
    categorySlug: 'trang-phuc',
    title: 'Bộ Vest Nam Hàn Quốc màu Xanh Navy (Size L) dự hội thảo/MC',
    description: 'Áo vest + quần tây form Slimfit sang trọng, đã giặt ủi sạch sẽ, thơm tho. Phù hợp bạn nam cao 1m70 - 1m78 làm MC hoặc bảo vệ khóa luận tốt nghiệp.',
    price: 45000,
    deposit: 200000,
    condition: 'Mới 99%',
    location: 'KTX Khu A ĐHQG TP.HCM',
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
  },
  {
    categorySlug: 'am-thanh',
    title: 'Loa Kéo Di Động Karaoke Bluetooth 300W kèm 2 Mic không dây',
    description: 'Loa kéo công suất lớn, âm bass mạnh mẽ, pin dùng 5-7 tiếng liên tục. Thích hợp cho CLB sinh viên dã ngoại, sinh hoạt ngoại khóa, team building.',
    price: 120000,
    deposit: 600000,
    condition: 'Rất tốt',
    location: 'Làng Đại học Thủ Đức',
    imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
  },
  {
    categorySlug: 'gia-dung',
    title: 'Bàn là hơi nước đứng Philips cầm tay cho sinh viên KTX',
    description: 'Bàn là hơi nước ủi phẳng quần áo siêu nhanh trong 2 phút, không sợ cháy vải. Rất tiện cho sinh viên trước buổi phỏng vấn xin việc hoặc thi vấn đáp.',
    price: 25000,
    deposit: 150000,
    condition: 'Tốt',
    location: 'KTX Khu B ĐHQG TP.HCM',
    imageUrl: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&auto=format&fit=crop&q=80',
  },
  {
    categorySlug: 'hoc-tap',
    title: 'Máy tính Casio fx-580VN X chuẩn phòng thi Bộ GD&ĐT',
    description: 'Máy tính bấm nhạy, giải hệ phương trình 4 ẩn và ma trận cực nhanh. Pin mới thay, đầy đủ nắp bảo vệ. Cứu cánh cho mùa thi đại cương và chuyên ngành.',
    price: 15000,
    deposit: 100000,
    condition: 'Rất tốt',
    location: 'ĐH Kinh Tế - Luật, Thủ Đức',
    imageUrl: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=800&auto=format&fit=crop&q=80',
  },
];

const LOCATION_PRESETS = [
  'KTX Khu B ĐHQG TP.HCM',
  'KTX Khu A ĐHQG TP.HCM',
  'Làng Đại học Thủ Đức',
  'Quận 10, TP.HCM (Gần ĐH Bách Khoa)',
  'Quận 1, TP.HCM (Gần ĐH KHXH&NV / Kinh Tế)',
  'Đại học Bách Khoa Hà Nội (Hai Bà Trưng)',
  'Cầu Giấy, Hà Nội (Gần ĐHQGHN / Sư Phạm)',
];

export default function PostItemPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [categories, setCategories] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [conditionStatus, setConditionStatus] = useState('Rất tốt');
  const [rentalPricePerDay, setRentalPricePerDay] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [location, setLocation] = useState('KTX Khu B ĐHQG TP.HCM');
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isPremium, setIsPremium] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setCategories(data.data);
          setCategoryId(data.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    fetchCategories();
  }, []);

  // Handle Preset Apply
  const applyPreset = (preset: typeof ITEM_PRESETS[0]) => {
    setTitle(preset.title);
    setDescription(preset.description);
    setRentalPricePerDay(preset.price.toString());
    setDepositAmount(preset.deposit.toString());
    setConditionStatus(preset.condition);
    setLocation(preset.location);
    setImages([preset.imageUrl]);

    const matchedCat = categories.find((c) => c.slug === preset.categorySlug);
    if (matchedCat) {
      setCategoryId(matchedCat.id);
    }
    setErrorMsg(null);
  };

  // Add Image URL
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImages([...images, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  // Remove Image URL
  const handleRemoveImage = (index: number) => {
    if (images.length === 1) {
      alert('Sản phẩm cần có ít nhất 1 hình ảnh');
      return;
    }
    setImages(images.filter((_, i) => i !== index));
  };

  const handlePriceChange = (val: string) => {
    setRentalPricePerDay(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0 && (!depositAmount || depositAmount === '0')) {
      // Auto-suggest deposit = 5x daily price
      setDepositAmount((num * 5).toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!user) {
      setErrorMsg('Vui lòng đăng nhập để đăng sản phẩm');
      return;
    }

    if (!title.trim() || title.trim().length < 3) {
      setErrorMsg('Tên sản phẩm phải có tối thiểu 3 ký tự');
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setErrorMsg('Mô tả chi tiết sản phẩm phải có tối thiểu 10 ký tự');
      return;
    }

    if (!categoryId) {
      setErrorMsg('Vui lòng chọn danh mục cho sản phẩm');
      return;
    }

    const price = parseFloat(rentalPricePerDay);
    if (isNaN(price) || price <= 0) {
      setErrorMsg('Giá thuê mỗi ngày phải là số dương lớn hơn 0');
      return;
    }

    const deposit = parseFloat(depositAmount);
    if (isNaN(deposit) || deposit < 0) {
      setErrorMsg('Tiền cọc yêu cầu không hợp lệ');
      return;
    }

    if (!location.trim()) {
      setErrorMsg('Vui lòng nhập vị trí/khu vực nhận trả đồ');
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          categoryId,
          conditionStatus,
          rentalPricePerDay: price,
          depositAmount: deposit,
          location: location.trim(),
          isPremium,
          images,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setSuccessMsg('Đăng sản phẩm cho thuê thành công! Đang chuyển hướng...');
        setTimeout(() => {
          router.push(`/items/${data.data.id}`);
        }, 1500);
      } else {
        setErrorMsg(data.error || 'Đăng sản phẩm thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      setErrorMsg('Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  // If checking authentication
  if (authLoading) {
    return (
      <div className="app-container" style={{ padding: '80px 16px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Đang kiểm tra thông tin tài khoản...</p>
      </div>
    );
  }

  // If not logged in: show friendly prompt
  if (!user) {
    return (
      <div className="app-container" style={{ padding: '80px 16px', maxWidth: 540, margin: '0 auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '40px 28px', borderRadius: 'var(--radius-xl)' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <Lock size={32} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: 10 }}>
            Yêu cầu Đăng nhập để Đăng tin
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: '0.95rem', lineHeight: 1.6 }}>
            Để bảo vệ cộng đồng sinh viên và đảm bảo nguồn gốc đồ cho thuê uy tín, bạn cần có tài khoản BorrowMe để đăng sản phẩm.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link href="/login?redirect=/items/post" className="btn btn-primary">
              <span>Đăng nhập ngay</span>
              <ArrowRight size={16} />
            </Link>
            <Link href="/register" className="btn btn-secondary">
              <span>Đăng ký mới</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 16px 80px', minHeight: '85vh' }}>
      <div className="app-container" style={{ maxWidth: 960, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', fontSize: '0.86rem', fontWeight: 700, marginBottom: 8 }}>
            <PlusCircle size={18} />
            <span>BorrowMe Lender Engine</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
            Đăng Tin Cho Thuê Đồ Dùng
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.96rem' }}>
            Chia sẻ đồ dùng nhàn rỗi, hỗ trợ sinh viên khác và kiếm thêm thu nhập an toàn với hệ thống giữ cọc Escrow tự động.
          </p>

          {/* Logged in User Bar */}
          <div
            style={{
              marginTop: 16,
              background: 'var(--primary-light)',
              border: '1px solid #c7d2fe',
              borderRadius: 'var(--radius-md)',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.86rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={18} color="var(--primary)" />
              <span>
                Đăng tin với tư cách: <strong style={{ color: 'var(--primary)' }}>{user.fullName}</strong>
                {user.university && ` (${user.university})`}
              </span>
            </div>
            {user.isVerified ? (
              <span className="badge badge-verified" style={{ fontSize: '0.74rem' }}>
                ✓ Sinh viên Đã xác thực
              </span>
            ) : (
              <Link href="/verify-student" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}>
                Xác thực tài khoản →
              </Link>
            )}
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div
          className="card"
          style={{
            padding: '20px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            marginBottom: 28,
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Sparkles size={18} color="var(--primary)" />
            <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              Mẫu tin đăng nhanh phổ biến cho Sinh viên (Bấm để điền mẫu):
            </strong>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ITEM_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.background = 'var(--primary-light)';
                  e.currentTarget.style.color = 'var(--primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {preset.title.split(' ')[0]} {preset.title.split(' ')[1]} ({formatVND(preset.price)}/ngày)
              </button>
            ))}
          </div>
        </div>

        {/* Form Alerts */}
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

        {/* Main Post Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }}>
            
            {/* Left Column: Core Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Product Info Card */}
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
                  <span>1. Thông tin Món đồ Cho thuê</span>
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
                      placeholder="VD: Máy chiếu Mini Full HD Epson kèm cáp HDMI & remote..."
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
                      Mô tả chi tiết, phụ kiện đi kèm & lưu ý sử dụng *
                    </label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Mô tả cụ thể về chức năng, phụ kiện đi kèm (dây sạc, túi đựng, pin, cáp nối) và yêu cầu đối với người thuê..."
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
                      Địa điểm / Khu vực nhận và trả đồ *
                    </label>
                    <div style={{ position: 'relative', marginBottom: 8 }}>
                      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                        <MapPin size={18} />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="VD: KTX Khu B ĐHQG, Tòa B3..."
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

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {LOCATION_PRESETS.slice(0, 4).map((loc, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setLocation(loc)}
                          style={{
                            fontSize: '0.76rem',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-sm)',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                          }}
                        >
                          + {loc}
                        </button>
                      ))}
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
                  <span>2. Hình ảnh Sản phẩm</span>
                </h3>

                {/* Current Images Preview */}
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

                {/* Add Image URL Input */}
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

            {/* Right Column: Pricing & Escrow Deposit Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Pricing Card */}
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
                  <span>3. Giá thuê & Tiền cọc</span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Rental Price */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                      Giá thuê mỗi ngày (VNĐ/ngày) *
                    </label>
                    <input
                      type="number"
                      required
                      min={5000}
                      step={5000}
                      placeholder="VD: 50000"
                      value={rentalPricePerDay}
                      onChange={(e) => handlePriceChange(e.target.value)}
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

                  {/* Deposit Amount */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                      Tiền cọc yêu cầu (VNĐ) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={10000}
                      placeholder="VD: 300000"
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

                  {/* Escrow note */}
                  <div
                    style={{
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px',
                      fontSize: '0.8rem',
                      color: '#065f46',
                      lineHeight: 1.5,
                    }}
                  >
                    <strong>🛡️ Cơ chế Giữ cọc Escrow:</strong>
                    <br />
                    Hệ thống sẽ tạm giữ tiền cọc của người thuê và tự động hoàn trả khi bạn xác nhận đã nhận lại đồ an toàn.
                  </div>

                  {/* Premium Listing Toggle */}
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
                        Đẩy tin lên đầu trang tìm kiếm
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

                {/* Submit Button */}
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
                    <span>Đang xử lý đăng tin...</span>
                  ) : (
                    <>
                      <PlusCircle size={20} />
                      <span>Đăng Tin Ngay</span>
                    </>
                  )}
                </button>
              </div>

              {/* Tips Card */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-lg)',
                  padding: '18px 20px',
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                  <Info size={16} color="var(--primary)" />
                  <span>Mẹo cho thuê hiệu quả:</span>
                </div>
                <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <li>Chụp ảnh thật, đủ sáng và rõ các góc cạnh.</li>
                  <li>Ghi rõ phụ kiện đi kèm để tránh thất lạc.</li>
                  <li>Đặt mức cọc tương đương 50-70% giá trị thực của món đồ.</li>
                </ul>
              </div>

            </div>

          </div>
        </form>

      </div>
    </div>
  );
}
