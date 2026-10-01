import Link from 'next/link';
import { ShieldCheck, Zap, Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="app-container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 34,
                  height: 34,
                  borderRadius: '10px',
                  background: 'var(--gradient-primary)',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px var(--primary-glow)',
                }}
              >
                <Sparkles size={18} />
              </span>
              <span>
                Borrow<span style={{ color: '#a78bfa' }}>Me</span>
              </span>
            </div>
            <p className="footer-desc">
              Nền tảng cho thuê đồ dùng sinh viên tự động hóa với lịch trống thời gian thực,
              thanh toán QR động và quản lý cọc an toàn (Escrow).
            </p>
          </div>

          <div>
            <h4 className="footer-col-title">Khám phá</h4>
            <ul className="footer-col-links">
              <li><Link href="/search?category=dien-tu">Thiết bị Điện tử</Link></li>
              <li><Link href="/search?category=trang-phuc">Trang phục Sự kiện</Link></li>
              <li><Link href="/search?category=gia-dung">Đồ gia dụng & KTX</Link></li>
              <li><Link href="/search?category=am-thanh">Thiết bị Âm thanh</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-col-title">Chức năng lõi</h4>
            <ul className="footer-col-links">
              <li><Link href="/#availability">Lịch trống thời gian thực</Link></li>
              <li><Link href="/#escrow">Cọc tiền tự động (Escrow)</Link></li>
              <li><Link href="/#vietqr">Thanh toán VietQR động</Link></li>
              <li><Link href="/#protection">Gói bảo vệ giao dịch</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-col-title">Hệ thống</h4>
            <ul className="footer-col-links">
              <li><Link href="/admin/dashboard">Admin Dashboard</Link></li>
              <li><Link href="/my-orders">Quản lý Đơn hàng</Link></li>
              <li><Link href="/verify-student">Xác thực Sinh viên</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} BorrowMe. Thiết kế dành riêng cho cộng đồng sinh viên.</p>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#34d399',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              <ShieldCheck size={15} /> Bảo vệ cọc Escrow 100%
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(245, 158, 11, 0.12)',
                color: '#fbbf24',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              <Zap size={15} /> Tự động đối soát QR 3s
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
