'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  RotateCcw,
  Calendar as CalendarIcon,
  MapPin,
  Tag,
  Sparkles,
  ShieldCheck,
  Check,
  DollarSign,
  ArrowUpDown,
  X,
  Layers,
} from 'lucide-react';
import { formatVND } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: { items: number };
}

interface ItemFiltersProps {
  categories: Category[];
}

const CONDITION_OPTIONS = [
  { label: 'Tất cả', value: '' },
  { label: 'Mới 99%', value: 'Mới 99%' },
  { label: 'Rất tốt', value: 'Rất tốt' },
  { label: 'Tốt', value: 'Tốt' },
  { label: 'Khá', value: 'Khá' },
];

const PRICE_BRACKETS = [
  { label: '< 50k', min: '', max: '50000' },
  { label: '50k - 100k', min: '50000', max: '100000' },
  { label: '100k - 200k', min: '100000', max: '200000' },
  { label: '> 200k', min: '200000', max: '' },
];

const CAMPUS_PRESETS = [
  'KTX Khu A',
  'KTX Khu B',
  'Làng ĐH Thủ Đức',
  'Bách Khoa',
  'Quận 10',
  'Cầu Giấy',
];

export default function ItemFilters({ categories }: ItemFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get('verifiedOnly') === 'true');
  const [premiumOnly, setPremiumOnly] = useState(searchParams.get('premium') === 'true');

  // Sync state if search params change externally
  useEffect(() => {
    setKeyword(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('category') || '');
    setCondition(searchParams.get('condition') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setLocation(searchParams.get('location') || '');
    setStartDate(searchParams.get('startDate') || '');
    setEndDate(searchParams.get('endDate') || '');
    setSortBy(searchParams.get('sortBy') || 'newest');
    setVerifiedOnly(searchParams.get('verifiedOnly') === 'true');
    setPremiumOnly(searchParams.get('premium') === 'true');
  }, [searchParams]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('q', keyword.trim());
    if (selectedCategory) params.set('category', selectedCategory);
    if (condition) params.set('condition', condition);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (location.trim()) params.set('location', location.trim());
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (sortBy && sortBy !== 'newest') params.set('sortBy', sortBy);
    if (verifiedOnly) params.set('verifiedOnly', 'true');
    if (premiumOnly) params.set('premium', 'true');

    router.push(`/search?${params.toString()}`);
  };

  const handlePriceBracketClick = (bracket: { min: string; max: string }) => {
    if (minPrice === bracket.min && maxPrice === bracket.max) {
      setMinPrice('');
      setMaxPrice('');
    } else {
      setMinPrice(bracket.min);
      setMaxPrice(bracket.max);
    }
  };

  const handleCampusClick = (campus: string) => {
    if (location === campus) {
      setLocation('');
    } else {
      setLocation(campus);
    }
  };

  const resetFilters = () => {
    setKeyword('');
    setSelectedCategory('');
    setCondition('');
    setMinPrice('');
    setMaxPrice('');
    setLocation('');
    setStartDate('');
    setEndDate('');
    setSortBy('newest');
    setVerifiedOnly(false);
    setPremiumOnly(false);
    router.push('/search');
  };

  const hasActiveFilters =
    keyword ||
    selectedCategory ||
    condition ||
    minPrice ||
    maxPrice ||
    location ||
    startDate ||
    endDate ||
    verifiedOnly ||
    premiumOnly ||
    (sortBy && sortBy !== 'newest');

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '14px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
          <Filter size={18} style={{ color: 'var(--primary)' }} />
          <span>Bộ Lọc Tìm Kiếm</span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            type="button"
            style={{
              fontSize: '0.8rem',
              color: 'var(--accent)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              fontWeight: 600,
              background: 'rgba(2, 132, 199, 0.08)',
              padding: '4px 8px',
              borderRadius: '6px',
              border: 'none',
            }}
          >
            <RotateCcw size={12} />
            <span>Đặt lại</span>
          </button>
        )}
      </div>

      {/* 1. Keyword Search Input */}
      <div style={{ marginBottom: '20px' }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '6px',
            color: 'var(--text-primary)',
          }}
        >
          <Search size={14} style={{ color: 'var(--primary)' }} />
          <span>Từ khóa tìm kiếm</span>
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Tên đồ dùng, mô tả..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            style={{
              width: '100%',
              padding: '9px 32px 9px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.88rem',
              outline: 'none',
            }}
          />
          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword('')}
              style={{
                position: 'absolute',
                right: 8,
                top: 9,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Category Selector */}
      <div style={{ marginBottom: '20px' }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '6px',
            color: 'var(--text-primary)',
          }}
        >
          <Layers size={14} style={{ color: 'var(--primary)' }} />
          <span>Danh mục sản phẩm</span>
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            width: '100%',
            padding: '9px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.88rem',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          <option value="">Tất cả danh mục ({categories.reduce((acc, c) => acc + (c._count?.items || 0), 0)})</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name} {cat._count ? `(${cat._count.items})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Item Condition Filter (Tình trạng sản phẩm) */}
      <div style={{ marginBottom: '20px' }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '8px',
            color: 'var(--text-primary)',
          }}
        >
          <Tag size={14} style={{ color: 'var(--primary)' }} />
          <span>Tình trạng sản phẩm</span>
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {CONDITION_OPTIONS.map((opt) => {
            const isSelected = condition === opt.value;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => setCondition(opt.value)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'rgba(79, 70, 229, 0.1)' : 'var(--bg-surface)',
                  color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Price Range Filter (Khoảng giá thuê) */}
      <div style={{ marginBottom: '20px' }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '8px',
            color: 'var(--text-primary)',
          }}
        >
          <DollarSign size={14} style={{ color: 'var(--primary)' }} />
          <span>Giá thuê / ngày (VNĐ)</span>
        </label>

        {/* Quick price presets */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
          {PRICE_BRACKETS.map((bracket) => {
            const isSelected = minPrice === bracket.min && maxPrice === bracket.max;
            return (
              <button
                key={bracket.label}
                type="button"
                onClick={() => handlePriceBracketClick(bracket)}
                style={{
                  padding: '5px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'rgba(79, 70, 229, 0.1)' : '#f8fafc',
                  color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                }}
              >
                {bracket.label}
              </button>
            );
          })}
        </div>

        {/* Custom Min / Max inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Từ (đ)</span>
            <input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 8px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.82rem',
              }}
            />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Đến (đ)</span>
            <input
              type="number"
              placeholder="500.000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 8px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.82rem',
              }}
            />
          </div>
        </div>
      </div>

      {/* 5. Location / Campus Filter */}
      <div style={{ marginBottom: '20px' }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '8px',
            color: 'var(--text-primary)',
          }}
        >
          <MapPin size={14} style={{ color: 'var(--primary)' }} />
          <span>Khu vực / KTX sinh viên</span>
        </label>

        {/* Quick campus shortcuts */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '8px' }}>
          {CAMPUS_PRESETS.map((campus) => {
            const isSelected = location === campus;
            return (
              <button
                key={campus}
                type="button"
                onClick={() => handleCampusClick(campus)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'rgba(2, 132, 199, 0.1)' : '#f8fafc',
                  color: isSelected ? 'var(--accent)' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease',
                }}
              >
                {campus}
              </button>
            );
          })}
        </div>

        <input
          type="text"
          placeholder="Nhập tên trường, quận, KTX..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 10px',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.82rem',
          }}
        />
      </div>

      {/* 6. Availability Date Range (Check-in / Check-out) */}
      <div style={{ marginBottom: '20px' }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '6px',
            color: 'var(--text-primary)',
          }}
        >
          <CalendarIcon size={14} style={{ color: 'var(--primary)' }} />
          <span>Lịch trống cần thuê</span>
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Từ ngày</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 6px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.78rem',
              }}
            />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Đến ngày</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 6px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.78rem',
              }}
            />
          </div>
        </div>
      </div>

      {/* 7. Sort By Dropdown */}
      <div style={{ marginBottom: '20px' }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '6px',
            color: 'var(--text-primary)',
          }}
        >
          <ArrowUpDown size={14} style={{ color: 'var(--primary)' }} />
          <span>Sắp xếp theo</span>
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 10px',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.85rem',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          <option value="newest">Mới đăng gần đây</option>
          <option value="priceAsc">Giá thuê: Thấp đến Cao</option>
          <option value="priceDesc">Giá thuê: Cao đến Thấp</option>
          <option value="topRated">Đánh giá cao nhất (Rating ⭐)</option>
          <option value="popular">Được thuê nhiều nhất</option>
        </select>
      </div>

      {/* 8. Trust & Quality Toggles */}
      <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Verified Lender Checkbox */}
        <label
          htmlFor="verifiedOnly"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.83rem',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '6px 8px',
            borderRadius: '6px',
            background: verifiedOnly ? 'rgba(2, 132, 199, 0.08)' : 'transparent',
            transition: 'background 0.15s ease',
          }}
        >
          <input
            type="checkbox"
            id="verifiedOnly"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: 'var(--accent)', cursor: 'pointer' }}
          />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: verifiedOnly ? 600 : 400 }}>
            <ShieldCheck size={14} style={{ color: 'var(--accent)' }} />
            <span>Chủ đồ đã xác thực SV</span>
          </span>
        </label>

        {/* Premium Only Checkbox */}
        <label
          htmlFor="premiumOnly"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.83rem',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '6px 8px',
            borderRadius: '6px',
            background: premiumOnly ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
            transition: 'background 0.15s ease',
          }}
        >
          <input
            type="checkbox"
            id="premiumOnly"
            checked={premiumOnly}
            onChange={(e) => setPremiumOnly(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: '#f59e0b', cursor: 'pointer' }}
          />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: premiumOnly ? 600 : 400 }}>
            <Sparkles size={14} style={{ color: '#d97706' }} />
            <span>Chỉ xem tin ưu tiên (Premium)</span>
          </span>
        </label>
      </div>

      {/* 9. Apply Action Button */}
      <button
        type="button"
        onClick={applyFilters}
        className="btn btn-primary btn-pill"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px',
          fontWeight: 700,
        }}
      >
        <Search size={16} />
        <span>Áp Dụng Bộ Lọc</span>
      </button>
    </div>
  );
}
