'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Calendar,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  UserCheck,
  Building2,
  HelpCircle,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const { login, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, show logged in banner
  if (user) {
    return (
      <div className="app-container" style={{ padding: '60px 16px', maxWidth: 540, margin: '0 auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '40px 28px' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'var(--accent-light)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <CheckCircle2 size={36} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>
            Bạn đã đăng nhập!
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.95rem' }}>
            Xin chào <strong style={{ color: 'var(--primary)' }}>{user.fullName}</strong> ({user.email}).
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link href="/search" className="btn btn-primary">
              <span>Khám phá đồ thuê</span>
              <ArrowRight size={16} />
            </Link>
            <Link href="/profile" className="btn btn-secondary">
              <span>Hồ sơ cá nhân</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ Email và Mật khẩu');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      router.push(redirectUrl);
    } else {
      setError(res.error || 'Đăng nhập không thành công');
    }
  };

  const setDemoCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', padding: '40px 16px' }}>
      <div className="app-container" style={{ maxWidth: 480, margin: '0 auto', width: '100%' }}>
        
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: 12,
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'var(--gradient-primary)',
                color: '#fff',
                boxShadow: '0 4px 12px var(--primary-glow)',
              }}
            >
              <Calendar size={22} />
            </span>
            <span>
              Borrow<span style={{ color: 'var(--primary)' }}>Me</span>
            </span>
          </Link>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
            Đăng nhập tài khoản
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Nền tảng Cho thuê Đồ dùng Sinh viên Tự động hóa
          </p>
        </div>

        {/* Login Card */}
        <div
          className="card"
          style={{
            padding: '32px 28px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                marginBottom: 20,
                color: '#b91c1c',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Lock size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Email Field */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: 6,
                }}
              >
                Email hoặc Email trường (.edu.vn)
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none',
                  }}
                >
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  required
                  placeholder="vidu: sv@uit.edu.vn hoặc ban@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 42px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-strong)',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'border-color var(--transition-fast)',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}
                >
                  Mật khẩu
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none',
                  }}
                >
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 42px 11px 42px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-strong)',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'border-color var(--transition-fast)',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    padding: 4,
                  }}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                marginTop: 8,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <span>Đang xử lý...</span>
              ) : (
                <>
                  <span>Đăng nhập</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              margin: '24px 0 20px',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
            }}
          >
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
            <span style={{ padding: '0 12px', fontWeight: 500 }}>HOẶC ĐĂNG NHẬP NHANH (TEST)</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          </div>

          {/* Quick Demo Test Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              type="button"
              onClick={() => setDemoCredentials('renter.sv@uit.edu.vn', 'borrowme123')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontSize: '0.82rem',
                textAlign: 'left',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.background = 'var(--primary-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.background = '#f8fafc';
              }}
            >
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>🎓 Sinh viên Đi thuê (UIT):</strong>
                <span style={{ display: 'block', color: 'var(--text-muted)' }}>renter.sv@uit.edu.vn</span>
              </div>
              <span className="badge badge-verified" style={{ fontSize: '0.72rem' }}>Đã xác thực</span>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials('lender.sv@hcmut.edu.vn', 'borrowme123')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontSize: '0.82rem',
                textAlign: 'left',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.background = 'var(--primary-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.background = '#f8fafc';
              }}
            >
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>📦 Sinh viên Cho thuê (Bách Khoa):</strong>
                <span style={{ display: 'block', color: 'var(--text-muted)' }}>lender.sv@hcmut.edu.vn</span>
              </div>
              <span className="badge badge-verified" style={{ fontSize: '0.72rem' }}>Chủ đồ Uy tín</span>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials('admin@borrowme.vn', 'admin123')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontSize: '0.82rem',
                textAlign: 'left',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.background = 'var(--primary-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.background = '#f8fafc';
              }}
            >
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>🛡️ Quản trị viên (Admin):</strong>
                <span style={{ display: 'block', color: 'var(--text-muted)' }}>admin@borrowme.vn</span>
              </div>
              <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>Quản trị</span>
            </button>
          </div>

          {/* Footer Card Navigation */}
          <div
            style={{
              marginTop: 24,
              textAlign: 'center',
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
            }}
          >
            Chưa có tài khoản?{' '}
            <Link
              href="/register"
              style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline' }}
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>

        {/* Security / Verification Assurance */}
        <div
          style={{
            marginTop: 24,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            color: 'var(--text-muted)',
            fontSize: '0.82rem',
          }}
        >
          <ShieldCheck size={16} color="var(--accent)" />
          <span>Bảo mật dữ liệu sinh viên & giao dịch an toàn với BorrowMe Escrow</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '60px 0' }}>Đang tải...</div>}>
      <LoginForm />
    </Suspense>
  );
}
