'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Calendar,
  Lock,
  Mail,
  User,
  Phone,
  GraduationCap,
  Building2,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Info,
  Check,
} from 'lucide-react';
import { POPULAR_UNIVERSITIES } from '@/lib/constants';

function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();

  const [activeTab, setActiveTab] = useState<'edu' | 'standard'>('edu');
  const [role, setRole] = useState<'RENTER' | 'LENDER'>('RENTER');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [university, setUniversity] = useState('');
  const [studentCardNumber, setStudentCardNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !password) {
      setError('Vui lòng điền đầy đủ Họ và tên, Email và Mật khẩu');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có độ dài tối thiểu 6 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (activeTab === 'edu') {
      const isEdu = email.toLowerCase().includes('.edu.vn') || email.toLowerCase().includes('.edu');
      if (!isEdu) {
        setError('Để đăng ký chế độ Sinh viên xác thực tức thì, vui lòng sử dụng Email trường học kết thúc bằng .edu.vn');
        return;
      }
    }

    setLoading(true);

    const payload: any = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      phone: phone ? phone.trim() : undefined,
      role,
      university: university.trim() || undefined,
      studentCardNumber: studentCardNumber.trim() || undefined,
      studentEmail: activeTab === 'edu' ? email.trim().toLowerCase() : undefined,
    };

    const res = await register(payload);
    setLoading(false);

    if (res.success) {
      setSuccessMessage(res.message || 'Đăng ký tài khoản thành công!');
      setTimeout(() => {
        router.push(role === 'LENDER' ? '/items/post' : '/search');
      }, 1500);
    } else {
      setError(res.error || 'Đăng ký thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div style={{ minHeight: '85vh', padding: '40px 16px', display: 'flex', alignItems: 'center' }}>
      <div className="app-container" style={{ maxWidth: 580, margin: '0 auto', width: '100%' }}>
        
        {/* Branding Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: 10,
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
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
            Tạo tài khoản BorrowMe
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Tham gia cộng đồng sinh viên chia sẻ và cho thuê đồ dùng thông minh
          </p>
        </div>

        {/* Register Card */}
        <div
          className="card"
          style={{
            padding: '32px 28px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {/* Success Banner */}
          {successMessage && (
            <div
              style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginBottom: 20,
                color: '#065f46',
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <CheckCircle size={22} color="var(--accent)" />
              <div>
                <strong>{successMessage}</strong>
                <p style={{ fontSize: '0.82rem', marginTop: 2 }}>Đang chuyển hướng đến trang chủ...</p>
              </div>
            </div>
          )}

          {/* Error Banner */}
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

          {/* Tab Selector */}
          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              borderRadius: 'var(--radius-md)',
              padding: 4,
              marginBottom: 24,
            }}
          >
            <button
              type="button"
              onClick={() => {
                setActiveTab('edu');
                setError(null);
              }}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.86rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                background: activeTab === 'edu' ? '#ffffff' : 'transparent',
                color: activeTab === 'edu' ? 'var(--primary)' : 'var(--text-secondary)',
                boxShadow: activeTab === 'edu' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all var(--transition-fast)',
              }}
            >
              <GraduationCap size={16} />
              <span>Email Trường (.edu.vn)</span>
              <span
                style={{
                  background: 'var(--accent-light)',
                  color: 'var(--accent)',
                  fontSize: '0.7rem',
                  padding: '2px 6px',
                  borderRadius: 10,
                  fontWeight: 700,
                }}
              >
                Xác thực ngay
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('standard');
                setError(null);
              }}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.86rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                background: activeTab === 'standard' ? '#ffffff' : 'transparent',
                color: activeTab === 'standard' ? 'var(--primary)' : 'var(--text-secondary)',
                boxShadow: activeTab === 'standard' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all var(--transition-fast)',
              }}
            >
              <User size={16} />
              <span>Email cá nhân (Gmail)</span>
            </button>
          </div>

          {/* Verification Badge Highlight */}
          {activeTab === 'edu' && (
            <div
              style={{
                background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
                border: '1px solid #c7d2fe',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <ShieldCheck size={26} color="var(--primary)" />
              <div style={{ fontSize: '0.85rem' }}>
                <strong style={{ color: 'var(--primary)', display: 'block' }}>
                  Xác thực Sinh viên Tự động
                </strong>
                <span style={{ color: '#4338ca' }}>
                  Tài khoản đăng ký bằng email trường sẽ được gắn huy hiệu <strong>Sinh viên Xác thực (Verified)</strong> tự động.
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Role Selection */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: 8,
                }}
              >
                Mục đích chính của bạn:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div
                  onClick={() => setRole('RENTER')}
                  style={{
                    border: `2px solid ${role === 'RENTER' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                    background: role === 'RENTER' ? 'var(--primary-light)' : '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.9rem', color: role === 'RENTER' ? 'var(--primary)' : 'var(--text-primary)' }}>
                      🎒 Người đi thuê
                    </strong>
                    {role === 'RENTER' && <Check size={16} color="var(--primary)" />}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Tìm đồ học tập, máy ảnh, vest...
                  </span>
                </div>

                <div
                  onClick={() => setRole('LENDER')}
                  style={{
                    border: `2px solid ${role === 'LENDER' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                    background: role === 'LENDER' ? 'var(--primary-light)' : '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.9rem', color: role === 'LENDER' ? 'var(--primary)' : 'var(--text-primary)' }}>
                      📦 Người cho thuê
                    </strong>
                    {role === 'LENDER' && <Check size={16} color="var(--primary)" />}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Đăng tin cho thuê kiếm thêm thu nhập
                  </span>
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: 6,
                }}
              >
                Họ và tên đầy đủ *
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <User size={18} />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 42px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-strong)',
                    fontSize: '0.92rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: 6,
                }}
              >
                {activeTab === 'edu' ? 'Email trường (.edu.vn) *' : 'Email cá nhân (Gmail, Outlook...) *'}
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  required
                  placeholder={
                    activeTab === 'edu'
                      ? 'nguyenvana@hcmut.edu.vn hoặc sv@uit.edu.vn'
                      : 'nguyenvana@gmail.com'
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 42px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-strong)',
                    fontSize: '0.92rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* University & Student ID (Conditional / Optional) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: 6,
                  }}
                >
                  Trường Đại học {activeTab === 'edu' && '(Tự động nhận diện)'}
                </label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <Building2 size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="VD: ĐH Bách Khoa TP.HCM"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-strong)',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: 6,
                  }}
                >
                  Mã số Sinh viên (MSSV)
                </label>
                <input
                  type="text"
                  placeholder="VD: 2112345"
                  value={studentCardNumber}
                  onChange={(e) => setStudentCardNumber(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-strong)',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: 6,
                }}
              >
                Số điện thoại liên hệ (Zalo)
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <Phone size={18} />
                </span>
                <input
                  type="tel"
                  placeholder="0912 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 42px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-strong)',
                    fontSize: '0.92rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Password Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: 6,
                  }}
                >
                  Mật khẩu (tối thiểu 6 ký tự) *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Mật khẩu..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 36px 10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-strong)',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}
                >
                  Xác nhận mật khẩu *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Nhập lại mật khẩu..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-strong)',
                    fontSize: '0.88rem',
                    outline: 'none',
                    marginTop: 6,
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                marginTop: 10,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <span>Đang khởi tạo tài khoản...</span>
              ) : (
                <>
                  <span>Hoàn tất Đăng ký</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer Card */}
          <div
            style={{
              marginTop: 24,
              textAlign: 'center',
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
            }}
          >
            Đã có tài khoản BorrowMe?{' '}
            <Link
              href="/login"
              style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline' }}
            >
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '60px 0' }}>Đang tải...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
