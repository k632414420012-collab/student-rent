'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  QrCode,
  ShieldCheck,
  CheckCircle,
  Copy,
  Clock,
  ArrowRight,
  Sparkles,
  Info,
  Laptop,
  Check,
  Zap,
} from 'lucide-react';
import { formatVND } from '@/lib/utils';

function CheckoutContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const itemId = params.id as string;
  const startStr = searchParams.get('start') || '';
  const endStr = searchParams.get('end') || '';
  const withProtection = searchParams.get('protect') === 'true';

  const [bookingData, setBookingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [simulating, setSimulating] = useState(false);

  // Initialize or fetch booking
  useEffect(() => {
    async function initBooking() {
      if (!itemId || !startStr || !endStr) return;

      try {
        setLoading(true);
        // Call create booking API
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemId,
            startDate: startStr,
            endDate: endStr,
            withProtectionPlan: withProtection,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setBookingData(data.data);
        } else {
          alert(data.error || 'Lỗi khi tạo phiên thanh toán');
          router.push(`/items/${itemId}`);
        }
      } catch (err) {
        console.error('Error creating checkout booking', err);
      } finally {
        setLoading(false);
      }
    }

    initBooking();
  }, [itemId, startStr, endStr, withProtection, router]);

  // Real-time Webhook Polling: Check if booking becomes CONFIRMED every 3 seconds
  useEffect(() => {
    if (!bookingData?.bookingId || isConfirmed) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingData.bookingId}`);
        const data = await res.json();
        if (data.success && data.data.status === 'CONFIRMED') {
          setIsConfirmed(true);
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Status check error', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [bookingData?.bookingId, isConfirmed]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Simulated Webhook Trigger for Local Testing
  const handleSimulatePayment = async () => {
    if (!bookingData?.bookingCode) return;
    try {
      setSimulating(true);
      const res = await fetch('/api/payments/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingCode: bookingData.bookingCode,
          amount: bookingData.totalAmount,
          referenceCode: `SIMULATED-${Date.now()}`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsConfirmed(true);
      } else {
        alert(data.error || 'Lỗi mô phỏng thanh toán');
      }
    } catch (err) {
      alert('Lỗi kết nối');
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>Đang sinh mã VietQR động cho đơn hàng...</div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Không thể khởi tạo đơn hàng</h2>
        <Link href="/search" className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0 80px', background: 'var(--bg-main)' }}>
      <div className="app-container" style={{ maxWidth: '900px' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          <Link href="/">Trang chủ</Link>
          <span>/</span>
          <Link href={`/items/${itemId}`}>Chi tiết món đồ</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Thanh toán VietQR động</span>
        </div>

        {isConfirmed ? (
          /* Payment Success View */
          <div className="card" style={{ padding: '48px 32px', textAlign: 'center', border: '2px solid #10b981' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--accent-light)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle size={44} />
            </div>

            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Thanh Toán Thành Công & Đã Khóa Lịch!
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '560px', margin: '0 auto 24px' }}>
              Đơn thuê <strong>#{bookingData.bookingCode}</strong> đã được hệ thống đối soát tự động thành công.
              Tiền cọc <strong style={{ color: '#059669' }}>{formatVND(bookingData.depositFee)}</strong> đã được đưa vào tài khoản Escrow an toàn.
            </p>

            <div style={{ display: 'inline-flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link href="/my-orders?tab=renter" className="btn btn-primary btn-lg">
                <span>Xem Đơn Hàng Của Tôi</span>
                <ArrowRight size={18} />
              </Link>
              <Link href="/" className="btn btn-secondary btn-lg">
                <span>Về Trang Chủ</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Active Payment View */
          <div>
            <div style={{ marginBottom: '28px', textAlign: 'center' }}>
              <span className="badge badge-primary" style={{ marginBottom: '8px' }}>
                <Zap size={13} /> Đối soát thanh toán tự động
              </span>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                Quét Mã VietQR Để Chốt Đơn
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Mã QR đã được điền sẵn số tiền và nội dung chuyển khoản. Hệ thống tự động kích hoạt đơn ngay khi nhận được tiền.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
              {/* Left Column: QR Code Visual & Polling status */}
              <div className="card" style={{ textAlign: 'center', padding: '28px' }}>
                <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', display: 'inline-block', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-md)', marginBottom: '16px' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bookingData.qr.qrUrl}
                    alt="VietQR Code"
                    style={{ width: '260px', height: '260px', objectFit: 'contain', margin: '0 auto' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '20px' }}>
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1.5s infinite' }} />
                  <span>Đang chờ chuyển khoản từ ứng dụng ngân hàng...</span>
                </div>

                {/* Local Simulation Button */}
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={simulating}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', borderColor: 'var(--primary)', color: 'var(--primary)', background: 'var(--primary-light)' }}
                  title="Nhấn để kích hoạt Webhook mô phỏng tiền đã về tài khoản ngân hàng"
                >
                  <Zap size={15} />
                  <span>{simulating ? 'Đang kích hoạt webhook...' : '⚡ Mô Phỏng Quét QR Thành Công (Test Webhook)'}</span>
                </button>
              </div>

              {/* Right Column: Banking Information & Order Summary */}
              <div>
                {/* Banking Transfer Details */}
                <div className="card" style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
                    Thông tin chuyển khoản thủ công
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Ngân hàng:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{bookingData.qr.bankName}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Số tài khoản:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <code style={{ background: 'var(--bg-muted)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                          {bookingData.qr.accountNo}
                        </code>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(bookingData.qr.accountNo, 'accountNo')}
                          style={{ padding: '4px', color: copiedField === 'accountNo' ? '#059669' : 'var(--text-muted)' }}
                          title="Sao chép"
                        >
                          {copiedField === 'accountNo' ? <Check size={15} /> : <Copy size={15} />}
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Chủ tài khoản:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{bookingData.qr.accountName}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Số tiền chuyển khoản:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>
                          {formatVND(bookingData.totalAmount)}
                        </strong>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(String(bookingData.totalAmount), 'amount')}
                          style={{ padding: '4px', color: copiedField === 'amount' ? '#059669' : 'var(--text-muted)' }}
                          title="Sao chép"
                        >
                          {copiedField === 'amount' ? <Check size={15} /> : <Copy size={15} />}
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fffbeb', padding: '8px 12px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#92400e' }}>Nội dung chuyển khoản (Bắt buộc):</div>
                        <strong style={{ color: '#b45309', fontSize: '1rem' }}>{bookingData.qr.memo}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(bookingData.qr.memo, 'memo')}
                        style={{ padding: '6px', color: copiedField === 'memo' ? '#059669' : '#b45309' }}
                        title="Sao chép"
                      >
                        {copiedField === 'memo' ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown Summary */}
                <div className="card">
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
                    Chi tiết khoản thanh toán
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Phí thuê đồ ({bookingData.totalDays} ngày):</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatVND(bookingData.rentalFee)}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Tiền cọc Escrow (Hoàn lại 100%):</span>
                      <span style={{ fontWeight: 600, color: '#059669' }}>{formatVND(bookingData.depositFee)}</span>
                    </div>

                    {bookingData.protectionFee > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Gói bảo vệ giao dịch:</span>
                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{formatVND(bookingData.protectionFee)}</span>
                      </div>
                    )}

                    <div style={{ paddingTop: '10px', marginTop: '6px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      <span>Tổng cộng:</span>
                      <span style={{ color: 'var(--primary)' }}>{formatVND(bookingData.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ padding: '80px 0', textAlign: 'center' }}>Đang tải trang thanh toán...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
