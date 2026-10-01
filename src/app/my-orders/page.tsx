'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Calendar,
  ShieldCheck,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  QrCode,
  ArrowRight,
  User,
  MapPin,
  RefreshCw,
  Send,
  Sparkles,
  Info,
  DollarSign,
} from 'lucide-react';
import { formatVND, formatDateVN } from '@/lib/utils';

function MyOrdersContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'lender' ? 'lender' : 'renter';

  const [activeTab, setActiveTab] = useState<'renter' | 'lender'>(initialTab);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Dispute Modal State
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeBookingId, setDisputeBookingId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeAmount, setDisputeAmount] = useState('');

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/bookings?role=${activeTab}`);
      const data = await res.json();
      if (data.success) {
        setBookings(data.data);
      }
    } catch (err) {
      console.error('Failed to load bookings', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Execute Lifecycle Action (Handover / Return & Refund / Cancel)
  const handleLifecycleAction = async (bookingId: string, action: 'HANDOVER' | 'RETURN_AND_REFUND' | 'CANCEL') => {
    const actionNames: Record<string, string> = {
      HANDOVER: 'xác nhận đã giao đồ cho người thuê',
      RETURN_AND_REFUND: 'xác nhận nhận lại đồ nguyên vẹn và kích hoạt HOÀN CỌC ESCROW 100%',
      CANCEL: 'hủy đơn thuê này',
    };

    if (!confirm(`Bạn có chắc chắn muốn ${actionNames[action]}?`)) return;

    try {
      setActionLoading(bookingId);
      const res = await fetch(`/api/bookings/${bookingId}/lifecycle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchBookings();
      } else {
        alert(data.error || 'Thao tác không thành công');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setActionLoading(null);
    }
  };

  // Open Dispute Modal
  const openDisputeModal = (bookingId: string, defaultDeposit: number) => {
    setDisputeBookingId(bookingId);
    setDisputeAmount(String(defaultDeposit));
    setDisputeReason('');
    setDisputeModalOpen(true);
  };

  // Submit Dispute Claim
  const submitDispute = async () => {
    if (!disputeBookingId || !disputeReason) {
      alert('Vui lòng nhập lý do khiếu nại.');
      return;
    }

    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: disputeBookingId,
          reason: disputeReason,
          deductedAmount: parseFloat(disputeAmount || '0'),
          evidenceUrls: [],
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setDisputeModalOpen(false);
        fetchBookings();
      } else {
        alert(data.error || 'Không thể tạo khiếu nại');
      }
    } catch (err) {
      alert('Lỗi kết nối');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return <span className="badge badge-warning"><Clock size={12} /> Chờ thanh toán VietQR</span>;
      case 'CONFIRMED':
        return <span className="badge badge-primary"><CheckCircle size={12} /> Đã xác nhận & Khóa lịch</span>;
      case 'ACTIVE':
        return <span className="badge badge-success"><Sparkles size={12} /> Đang thuê đồ</span>;
      case 'COMPLETED':
        return <span className="badge badge-success" style={{ background: '#dcfce7', color: '#15803d' }}><ShieldCheck size={12} /> Hoàn tất (Đã hoàn cọc)</span>;
      case 'DISPUTED':
        return <span className="badge" style={{ background: '#fee2e2', color: '#b91c1c' }}><AlertTriangle size={12} /> Đang tranh chấp cọc</span>;
      case 'CANCELLED':
        return <span className="badge" style={{ background: '#f1f5f9', color: '#64748b' }}><XCircle size={12} /> Đã hủy đơn</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div style={{ padding: '40px 0 80px', background: 'var(--bg-main)' }}>
      <div className="app-container">
        {/* Header & Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              Quản Lý Đơn Thuê & Escrow
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Theo dõi tiến trình 5 trạng thái, thanh toán QR, xác nhận giao nhận và hoàn tiền cọc tự động.
            </p>
          </div>

          {/* Role Tabs */}
          <div style={{ display: 'flex', background: '#e2e8f0', padding: '4px', borderRadius: '12px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('renter')}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: 'none',
                background: activeTab === 'renter' ? '#fff' : 'transparent',
                color: activeTab === 'renter' ? 'var(--primary)' : 'var(--text-secondary)',
                boxShadow: activeTab === 'renter' ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
              }}
            >
              Đơn tôi đi thuê (Renter)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('lender')}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: 'none',
                background: activeTab === 'lender' ? '#fff' : 'transparent',
                color: activeTab === 'lender' ? 'var(--primary)' : 'var(--text-secondary)',
                boxShadow: activeTab === 'lender' ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
              }}
            >
              Đơn tôi cho thuê (Lender)
            </button>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontWeight: 600 }}>Đang tải danh sách đơn hàng...</div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="card" style={{ padding: '64px 24px', textAlign: 'center' }}>
            <Calendar size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
              {activeTab === 'renter' ? 'Bạn chưa có đơn thuê đồ nào' : 'Bạn chưa có đơn cho thuê nào'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
              {activeTab === 'renter'
                ? 'Tìm đồ dùng sinh viên ngay trên hệ thống và chốt đơn tự động qua VietQR!'
                : 'Đăng tin cho thuê các món đồ của bạn để kiếm thêm thu nhập an toàn.'}
            </p>
            <Link href={activeTab === 'renter' ? '/search' : '/items/post'} className="btn btn-primary btn-sm">
              {activeTab === 'renter' ? 'Khám phá đồ thuê ngay' : 'Đăng tin cho thuê'}
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {bookings.map((b) => (
              <div key={b.id} className="card" style={{ padding: '24px' }}>
                {/* Top Row: Code, Status & Date */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>
                      #{b.bookingCode}
                    </strong>
                    {getStatusBadge(b.status)}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Tạo lúc: {formatDateVN(b.createdAt)}
                  </div>
                </div>

                {/* Middle Row: Item info & Financial breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>
                      <Link href={`/items/${b.item.id}`} style={{ color: 'inherit' }}>
                        {b.item.title}
                      </Link>
                    </h3>

                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} style={{ color: 'var(--primary)' }} />
                        <strong>{formatDateVN(b.startDate)}</strong> ➔ <strong>{formatDateVN(b.endDate)}</strong> ({b.totalDays} ngày)
                      </span>
                      <span>•</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={14} /> {b.item.location}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {activeTab === 'renter' ? (
                        <span>Chủ đồ: <strong>{b.item.lender.fullName}</strong> ({b.item.lender.phone || 'qua tin nhắn'})</span>
                      ) : (
                        <span>Người thuê: <strong>{b.renter.fullName}</strong> ({b.renter.phone || 'qua tin nhắn'})</span>
                      )}
                    </div>
                  </div>

                  {/* Financial Breakdown */}
                  <div style={{ background: 'var(--bg-muted)', padding: '14px', borderRadius: '12px', fontSize: '0.88rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Tiền thuê ({b.totalDays} ngày):</span>
                      <strong>{formatVND(b.rentalFee)}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#059669' }}>Cọc giữ qua Escrow:</span>
                      <strong style={{ color: '#059669' }}>{formatVND(b.depositFee)}</strong>
                    </div>

                    {b.protectionFee > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>Gói bảo vệ:</span>
                        <strong>{formatVND(b.protectionFee)}</strong>
                      </div>
                    )}

                    <div style={{ paddingTop: '8px', marginTop: '6px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                      <span>Tổng thanh toán:</span>
                      <span style={{ color: 'var(--primary)', fontSize: '1rem' }}>{formatVND(b.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
                  {/* Renter Actions */}
                  {activeTab === 'renter' && (
                    <>
                      {b.status === 'PENDING_PAYMENT' && (
                        <Link
                          href={`/checkout/${b.item.id}?start=${b.startDate.split('T')[0]}&end=${b.endDate.split('T')[0]}&protect=${b.protectionFee > 0}`}
                          className="btn btn-primary btn-sm"
                        >
                          <QrCode size={15} />
                          <span>Quét mã VietQR thanh toán ngay</span>
                        </Link>
                      )}

                      {b.status === 'CONFIRMED' && (
                        <button
                          type="button"
                          disabled={actionLoading === b.id}
                          onClick={() => handleLifecycleAction(b.id, 'CANCEL')}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                        >
                          <span>Hủy đơn (Hoàn cọc 100% trước 24h)</span>
                        </button>
                      )}

                      {b.status === 'ACTIVE' && (
                        <button
                          type="button"
                          onClick={() => openDisputeModal(b.id, b.depositFee)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#b91c1c' }}
                        >
                          <AlertTriangle size={14} />
                          <span>Báo cáo sự cố / Khiếu nại</span>
                        </button>
                      )}
                    </>
                  )}

                  {/* Lender Actions */}
                  {activeTab === 'lender' && (
                    <>
                      {b.status === 'CONFIRMED' && (
                        <button
                          type="button"
                          disabled={actionLoading === b.id}
                          onClick={() => handleLifecycleAction(b.id, 'HANDOVER')}
                          className="btn btn-primary btn-sm"
                        >
                          <CheckCircle size={15} />
                          <span>Xác nhận đã giao đồ cho người thuê</span>
                        </button>
                      )}

                      {b.status === 'ACTIVE' && (
                        <>
                          <button
                            type="button"
                            onClick={() => openDisputeModal(b.id, b.depositFee)}
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#b91c1c' }}
                          >
                            <AlertTriangle size={14} />
                            <span>Báo cáo đồ hư hại / Trễ hạn (Trừ cọc)</span>
                          </button>

                          <button
                            type="button"
                            disabled={actionLoading === b.id}
                            onClick={() => handleLifecycleAction(b.id, 'RETURN_AND_REFUND')}
                            className="btn btn-accent btn-sm"
                            style={{ background: '#10b981', color: '#fff' }}
                            title="Xác nhận người thuê đã trả đồ nguyên vẹn để hệ thống tự động hoàn 100% tiền cọc"
                          >
                            <ShieldCheck size={16} />
                            <span>Xác nhận nhận lại đồ & Hoàn cọc 100%</span>
                          </button>
                        </>
                      )}
                    </>
                  )}

                  <Link href={`/items/${b.item.id}`} className="btn btn-secondary btn-sm">
                    <span>Xem món đồ</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dispute Modal */}
        {disputeModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '32px', boxShadow: 'var(--shadow-xl)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c', marginBottom: '12px' }}>
                <AlertTriangle size={24} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Gửi Khiếu Nại & Yêu Cầu Trừ Cọc</h3>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px' }}>
                Tiền cọc trong Escrow sẽ được tạm đóng băng. Admin sẽ thẩm định bằng chứng và quyết định mức bồi thường chính xác.
              </p>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Lý do khiếu nại (Hư hỏng / Trả trễ hạn / Mất phụ kiện) *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Mô tả cụ thể tình trạng hư hại hoặc số giờ trễ hạn..."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Số tiền cọc đề xuất khấu trừ bồi thường (VNĐ)
                </label>
                <input
                  type="number"
                  value={disputeAmount}
                  onChange={(e) => setDisputeAmount(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setDisputeModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={submitDispute}
                  className="btn btn-primary btn-sm"
                  style={{ background: '#b91c1c', borderColor: '#b91c1c' }}
                >
                  <span>Gửi Khiếu Nại Lên Admin</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyOrdersPage() {
  return (
    <Suspense fallback={<div style={{ padding: '80px 0', textAlign: 'center' }}>Đang tải danh sách đơn...</div>}>
      <MyOrdersContent />
    </Suspense>
  );
}
