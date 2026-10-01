'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Package,
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Tag,
  Clock,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { formatVND, formatDateVN } from '@/lib/utils';

function MyItemsContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'HIDDEN'>('ALL');

  // Modal confirm delete
  const [deleteModalItem, setDeleteModalItem] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchMyItems = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch('/api/items?myItems=true');
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (err) {
      console.error('Failed to load my items', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchMyItems();
    }
  }, [user, fetchMyItems]);

  // Handle Toggle Item Status (ACTIVE <-> HIDDEN)
  const handleToggleStatus = async (item: any) => {
    const newStatus = item.status === 'ACTIVE' ? 'HIDDEN' : 'ACTIVE';
    try {
      setActionLoading(item.id);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await fetch(`/api/items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(
          `Đã chuyển trạng thái món đồ sang "${newStatus === 'ACTIVE' ? 'Đang cho thuê' : 'Tạm ẩn'}"!`
        );
        fetchMyItems();
      } else {
        setErrorMsg(data.error || 'Không thể cập nhật trạng thái');
      }
    } catch (err) {
      setErrorMsg('Lỗi kết nối máy chủ');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Delete Item
  const handleDeleteItem = async () => {
    if (!deleteModalItem) return;
    try {
      setActionLoading(deleteModalItem.id);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await fetch(`/api/items/${deleteModalItem.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Đã xóa món đồ "${deleteModalItem.title}" thành công!`);
        setDeleteModalItem(null);
        fetchMyItems();
      } else {
        setErrorMsg(data.error || 'Không thể xóa món đồ');
        setDeleteModalItem(null);
      }
    } catch (err) {
      setErrorMsg('Lỗi kết nối khi xóa món đồ');
      setDeleteModalItem(null);
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading) {
    return (
      <div className="app-container" style={{ padding: '80px 16px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Đang tải danh sách đồ của bạn...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-container" style={{ padding: '80px 16px', maxWidth: 540, margin: '0 auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '40px 24px', borderRadius: 'var(--radius-xl)' }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Lock size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>
            Yêu cầu Đăng nhập
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.92rem' }}>
            Vui lòng đăng nhập để xem và quản lý các sản phẩm bạn đã đăng cho thuê.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link href="/login?redirect=/my-items" className="btn btn-primary">
              <span>Đăng nhập</span>
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

  // Filtered items
  const filteredItems = items.filter((item) => {
    const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;
    if (filterStatus === 'ALL') return true;
    return item.status === filterStatus;
  });

  const totalActive = items.filter((i) => i.status === 'ACTIVE').length;
  const totalHidden = items.filter((i) => i.status === 'HIDDEN').length;
  const totalBookings = items.reduce((acc, i) => acc + (i.bookingCount || 0), 0);

  return (
    <div style={{ padding: '40px 16px 80px', minHeight: '85vh' }}>
      <div className="app-container" style={{ maxWidth: 1040, margin: '0 auto' }}>
        
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', fontSize: '0.86rem', fontWeight: 700, marginBottom: 6 }}>
              <Package size={18} />
              <span>Quản lý Tài sản Cho thuê</span>
            </div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
              Đồ Cho Thuê Của Tôi
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem' }}>
              Theo dõi tình trạng, chỉnh sửa thông tin hoặc tạm ẩn các món đồ bạn đang chia sẻ.
            </p>
          </div>

          <Link href="/items/post" className="btn btn-primary">
            <PlusCircle size={18} />
            <span>Đăng tin món đồ mới</span>
          </Link>
        </div>

        {/* Stats Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
          <div className="card" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>TỔNG SỐ ĐỒ ĐÃ ĐĂNG</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
              {items.length}
            </div>
          </div>

          <div className="card" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 600 }}>ĐANG CHO THUÊ (ACTIVE)</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent)', marginTop: 4 }}>
              {totalActive}
            </div>
          </div>

          <div className="card" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
            <span style={{ fontSize: '0.82rem', color: '#d97706', fontWeight: 600 }}>TẠM ẨN (HIDDEN)</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#d97706', marginTop: 4 }}>
              {totalHidden}
            </div>
          </div>

          <div className="card" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>TỔNG LƯỢT THUÊ ĐÃ TẠO</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>
              {totalBookings}
            </div>
          </div>
        </div>

        {/* Feedback Alerts */}
        {successMsg && (
          <div
            style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              marginBottom: 20,
              color: '#065f46',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <CheckCircle2 size={20} color="var(--accent)" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              marginBottom: 20,
              color: '#b91c1c',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <AlertCircle size={20} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div
          className="card"
          style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-lg)',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 14,
          }}
        >
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên món đồ, danh mục, khu vực..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.88rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              onClick={() => setFilterStatus('ALL')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                fontWeight: 600,
                background: filterStatus === 'ALL' ? 'var(--primary)' : '#f1f5f9',
                color: filterStatus === 'ALL' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Tất cả ({items.length})
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('ACTIVE')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                fontWeight: 600,
                background: filterStatus === 'ACTIVE' ? 'var(--accent)' : '#f1f5f9',
                color: filterStatus === 'ACTIVE' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Đang cho thuê ({totalActive})
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('HIDDEN')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                fontWeight: 600,
                background: filterStatus === 'HIDDEN' ? '#d97706' : '#f1f5f9',
                color: filterStatus === 'HIDDEN' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Tạm ẩn ({totalHidden})
            </button>
          </div>
        </div>

        {/* Items List */}
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>Đang tải danh sách món đồ...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          /* Empty State */
          <div
            className="card"
            style={{
              padding: '60px 24px',
              textAlign: 'center',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'var(--bg-muted)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Package size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
              {searchTerm || filterStatus !== 'ALL' ? 'Không tìm thấy món đồ phù hợp' : 'Bạn chưa đăng món đồ nào'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: 440, margin: '0 auto 24px' }}>
              {searchTerm || filterStatus !== 'ALL'
                ? 'Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái.'
                : 'Hãy bắt đầu đăng tin cho thuê các thiết bị học tập, máy ảnh, trang phục... để chia sẻ và kiếm thêm thu nhập.'}
            </p>
            <Link href="/items/post" className="btn btn-primary">
              <PlusCircle size={18} />
              <span>Đăng món đồ đầu tiên ngay</span>
            </Link>
          </div>
        ) : (
          /* List of items */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredItems.map((item) => {
              const coverImg =
                item.images && item.images.length > 0
                  ? item.images[0].imageUrl
                  : 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80';

              const isActive = item.status === 'ACTIVE';

              return (
                <div
                  key={item.id}
                  className="card"
                  style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 18,
                    borderLeft: `4px solid ${isActive ? 'var(--accent)' : '#d97706'}`,
                  }}
                >
                  {/* Left: Thumbnail & Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18, flex: 1, minWidth: 280 }}>
                    <div
                      style={{
                        width: 90,
                        height: 70,
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        flexShrink: 0,
                        position: 'relative',
                        background: '#f1f5f9',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={coverImg} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span
                          className={`badge ${isActive ? 'badge-success' : 'badge-warning'}`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          {isActive ? '● Đang cho thuê' : '○ Tạm ẩn'}
                        </span>

                        <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                          {item.category?.name || 'Danh mục'}
                        </span>

                        <span className="badge" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.72rem' }}>
                          {item.conditionStatus}
                        </span>

                        {item.isPremium && (
                          <span className="badge badge-premium" style={{ fontSize: '0.72rem' }}>
                            ★ Gói Ưu tiên
                          </span>
                        )}
                      </div>

                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                        <Link href={`/items/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {item.title}
                        </Link>
                      </h4>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.85rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                        <span>
                          Giá thuê: <strong style={{ color: 'var(--primary)' }}>{formatVND(item.rentalPricePerDay)}/ngày</strong>
                        </span>
                        <span>
                          Cọc: <strong style={{ color: 'var(--accent)' }}>{formatVND(item.depositAmount)}</strong>
                        </span>
                        <span>
                          Khu vực: <strong>{item.location}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    
                    {/* View Item */}
                    <Link
                      href={`/items/${item.id}`}
                      className="btn btn-secondary btn-sm"
                      title="Xem trang sản phẩm thực tế"
                    >
                      <Eye size={15} />
                      <span>Xem</span>
                    </Link>

                    {/* Edit Item */}
                    <Link
                      href={`/items/${item.id}/edit`}
                      className="btn btn-secondary btn-sm"
                      title="Chỉnh sửa thông tin món đồ"
                    >
                      <Edit size={15} />
                      <span>Sửa</span>
                    </Link>

                    {/* Toggle Status (Active / Hidden) */}
                    <button
                      type="button"
                      disabled={actionLoading === item.id}
                      onClick={() => handleToggleStatus(item)}
                      className="btn btn-secondary btn-sm"
                      title={isActive ? 'Tạm ẩn không cho thuê' : 'Bật hiển thị cho thuê'}
                    >
                      {isActive ? <EyeOff size={15} color="#d97706" /> : <Eye size={15} color="var(--accent)" />}
                      <span>{isActive ? 'Ẩn tin' : 'Hiện tin'}</span>
                    </button>

                    {/* Delete Item */}
                    <button
                      type="button"
                      disabled={actionLoading === item.id}
                      onClick={() => setDeleteModalItem(item)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#ef4444' }}
                      title="Xóa món đồ này"
                    >
                      <Trash2 size={15} />
                      <span>Xóa</span>
                    </button>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModalItem && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '16px',
            }}
          >
            <div
              className="card"
              style={{
                maxWidth: 480,
                width: '100%',
                padding: '28px',
                borderRadius: 'var(--radius-xl)',
                background: '#fff',
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: '#fef2f2',
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <Trash2 size={26} />
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, textAlign: 'center', marginBottom: 8 }}>
                Xác nhận Xóa Món Đồ?
              </h3>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', marginBottom: 20, lineHeight: 1.5 }}>
                Bạn có chắc chắn muốn xóa vĩnh viễn món đồ <strong>&ldquo;{deleteModalItem.title}&rdquo;</strong>?
                Hành động này không thể hoàn tác.
              </p>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button
                  type="button"
                  disabled={actionLoading === deleteModalItem.id}
                  onClick={() => setDeleteModalItem(null)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={actionLoading === deleteModalItem.id}
                  onClick={handleDeleteItem}
                  className="btn"
                  style={{ flex: 1, background: '#ef4444', color: '#fff' }}
                >
                  {actionLoading === deleteModalItem.id ? 'Đang xóa...' : 'Đồng ý Xóa'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function MyItemsPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '60px 0' }}>Đang tải...</div>}>
      <MyItemsContent />
    </Suspense>
  );
}
