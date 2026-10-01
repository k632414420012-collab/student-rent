'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  GraduationCap,
  Building2,
  Calendar,
  LogOut,
  ArrowRight,
  Sparkles,
  Repeat,
  PlusCircle,
  Package,
  ShoppingBag,
  Bell,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { formatDateVN } from '@/lib/utils';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, logout, switchRole } = useAuth();
  const [switching, setSwitching] = useState(false);
  const [roleMessage, setRoleMessage] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="app-container" style={{ padding: '80px 16px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Đang tải thông tin tài khoản...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-container" style={{ padding: '80px 16px', maxWidth: 520, margin: '0 auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <User size={48} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 8 }}>
            Bạn chưa đăng nhập
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.92rem' }}>
            Vui lòng đăng nhập để xem thông tin cá nhân và quản lý đơn thuê.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link href="/login?redirect=/profile" className="btn btn-primary">
              <span>Đăng nhập</span>
              <ArrowRight size={16} />
            </Link>
            <Link href="/register" className="btn btn-secondary">
              <span>Đăng ký</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleRoleToggle = async () => {
    const targetRole = user.role === 'LENDER' ? 'RENTER' : 'LENDER';
    setSwitching(true);
    setRoleMessage(null);
    const ok = await switchRole(targetRole);
    setSwitching(false);
    if (ok) {
      setRoleMessage(`Đã chuyển vai trò sang ${targetRole === 'LENDER' ? 'Người cho thuê (Lender)' : 'Người đi thuê (Renter)'}!`);
      setTimeout(() => setRoleMessage(null), 3000);
    }
  };

  return (
    <div style={{ padding: '40px 16px 80px', minHeight: '85vh' }}>
      <div className="app-container" style={{ maxWidth: 860, margin: '0 auto' }}>
        
        {/* Role switch alert */}
        {roleMessage && (
          <div
            style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              marginBottom: 20,
              color: '#065f46',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <CheckCircle2 size={18} color="var(--accent)" />
            <span>{roleMessage}</span>
          </div>
        )}

        {/* Profile Card Header */}
        <div
          className="card"
          style={{
            padding: '32px',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
            marginBottom: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'var(--gradient-primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                fontWeight: 800,
                boxShadow: '0 8px 16px var(--primary-glow)',
              }}
            >
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {user.fullName}
                </h1>
                
                {user.isVerified ? (
                  <span className="badge badge-verified" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <ShieldCheck size={14} />
                    <span>Sinh viên Xác thực</span>
                  </span>
                ) : (
                  <Link
                    href="/verify-student"
                    className="badge badge-warning"
                    style={{ textDecoration: 'none' }}
                  >
                    <span>Chưa xác thực SV (Bấm để xác thực)</span>
                  </Link>
                )}

                <span
                  className="badge"
                  style={{
                    background: user.role === 'ADMIN' ? '#fee2e2' : user.role === 'LENDER' ? '#e0e7ff' : '#f1f5f9',
                    color: user.role === 'ADMIN' ? '#b91c1c' : user.role === 'LENDER' ? '#4338ca' : '#475569',
                  }}
                >
                  {user.role === 'ADMIN'
                    ? 'Quản trị viên (Admin)'
                    : user.role === 'LENDER'
                    ? 'Người cho thuê (Lender)'
                    : 'Người đi thuê (Renter)'}
                </span>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {user.email} {user.phone && `• SĐT: ${user.phone}`}
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={handleRoleToggle}
              disabled={switching}
              className="btn btn-secondary btn-sm"
              title="Chuyển đổi giao diện giữa Người thuê và Người cho thuê"
            >
              <Repeat size={16} />
              <span>Chuyển sang {user.role === 'LENDER' ? 'Renter' : 'Lender'}</span>
            </button>

            <button
              onClick={logout}
              className="btn btn-secondary btn-sm"
              style={{ color: '#ef4444' }}
            >
              <LogOut size={16} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* Main Grid Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          
          {/* Student & Academic Info */}
          <div
            className="card"
            style={{
              padding: '28px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <GraduationCap size={20} color="var(--primary)" />
                <span>Thông tin Sinh viên & Trường</span>
              </h3>

              {!user.isVerified && (
                <Link href="/verify-student" style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>
                  Xác thực ngay →
                </Link>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                  Trường Đại học / Học viện
                </span>
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {user.university || 'Chưa cập nhật trường học'}
                </strong>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                  Email trường học (.edu.vn)
                </span>
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {user.studentEmail || (user.email.includes('.edu') ? user.email : 'Chưa liên kết email trường')}
                </strong>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                  Mã số Sinh viên (MSSV)
                </span>
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {user.studentCardNumber || 'Chưa có thông tin MSSV'}
                </strong>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                  Trạng thái Xác minh
                </span>
                {user.isVerified ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent)', fontWeight: 700, fontSize: '0.9rem' }}>
                    <ShieldCheck size={18} />
                    <span>Đã xác thực ({user.verifiedAt ? formatDateVN(user.verifiedAt) : 'Hợp lệ'})</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#d97706', fontWeight: 600, fontSize: '0.88rem' }}>
                    <AlertTriangle size={16} />
                    <span>Chưa xác thực</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Shortcuts & Navigation */}
          <div
            className="card"
            style={{
              padding: '28px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <Sparkles size={20} color="var(--primary)" />
                <span>Hoạt động & Lối tắt nhanh</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link
                  href="/my-orders?tab=renter"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ShoppingBag size={18} color="var(--primary)" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Đơn hàng tôi đi thuê
                    </span>
                  </div>
                  <ArrowRight size={16} color="var(--text-muted)" />
                </Link>

                <Link
                  href="/my-items"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Package size={18} color="var(--secondary)" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Danh sách đồ tôi cho thuê
                    </span>
                  </div>
                  <ArrowRight size={16} color="var(--text-muted)" />
                </Link>

                <Link
                  href="/notifications"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Bell size={18} color="#f59e0b" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Thông báo & Nhắc lịch
                    </span>
                  </div>
                  <ArrowRight size={16} color="var(--text-muted)" />
                </Link>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <Link href="/items/post" className="btn btn-primary" style={{ width: '100%' }}>
                <PlusCircle size={18} />
                <span>Đăng tin cho thuê món đồ mới</span>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
