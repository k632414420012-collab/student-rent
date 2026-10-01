'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  Building2,
  Mail,
  CreditCard,
  Upload,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  Check,
  Clock,
  Info,
  ExternalLink,
} from 'lucide-react';
import { POPULAR_UNIVERSITIES } from '@/lib/constants';

function VerifyStudentContent() {
  const router = useRouter();
  const { user, refreshUser, loading: authLoading } = useAuth();

  const [activeMethod, setActiveMethod] = useState<'email' | 'card'>('email');

  // Method 1: Edu Email
  const [studentEmail, setStudentEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Method 2: Card & ID
  const [university, setUniversity] = useState('');
  const [studentCardNumber, setStudentCardNumber] = useState('');
  const [idCardNumber, setIdCardNumber] = useState('');
  const [cardImagePreview, setCardImagePreview] = useState<string | null>(null);

  // States
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user?.university) setUniversity(user.university);
    if (user?.studentEmail) setStudentEmail(user.studentEmail);
    if (user?.studentCardNumber) setStudentCardNumber(user.studentCardNumber);
  }, [user]);

  if (authLoading) {
    return (
      <div className="app-container" style={{ padding: '80px 16px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Đang kiểm tra phiên đăng nhập...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-container" style={{ padding: '80px 16px', maxWidth: 540, margin: '0 auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
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
            <ShieldCheck size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>
            Yêu cầu Đăng nhập
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.92rem' }}>
            Vui lòng đăng nhập hoặc tạo tài khoản để thực hiện xác thực danh tính sinh viên.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link href="/login?redirect=/verify-student" className="btn btn-primary">
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

  // Handle Send OTP Simulation
  const handleSendOtp = () => {
    setErrorMsg(null);
    if (!studentEmail || !studentEmail.includes('@')) {
      setErrorMsg('Vui lòng nhập địa chỉ Email trường học hợp lệ (VD: @hcmut.edu.vn, @uit.edu.vn)');
      return;
    }
    const isEdu = studentEmail.toLowerCase().includes('.edu.vn') || studentEmail.toLowerCase().includes('.edu');
    if (!isEdu) {
      setErrorMsg('Email trường phải có đuôi .edu.vn để được xác thực tức thì');
      return;
    }
    setOtpSent(true);
    setOtpCode('123456'); // Pre-fill test OTP for seamless testing
  };

  // Handle Verification Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      let body: any;
      if (activeMethod === 'email') {
        body = {
          verificationMethod: 'EMAIL',
          studentEmail: studentEmail.trim().toLowerCase(),
          otpCode: otpCode.trim() || '123456',
          university: university.trim() || undefined,
        };
      } else {
        if (!university.trim() || !studentCardNumber.trim()) {
          setErrorMsg('Vui lòng nhập đầy đủ Tên trường đại học và Mã số sinh viên (MSSV)');
          setSubmitting(false);
          return;
        }
        body = {
          verificationMethod: 'CARD',
          university: university.trim(),
          studentCardNumber: studentCardNumber.trim(),
          idCardNumber: idCardNumber.trim() || undefined,
          studentCardImage: cardImagePreview || undefined,
        };
      }

      const res = await fetch('/api/auth/verify-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || 'Xác thực sinh viên thành công!');
        await refreshUser();
      } else {
        setErrorMsg(data.error || 'Xác thực thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (err) {
      setErrorMsg('Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '40px 16px 80px', minHeight: '85vh' }}>
      <div className="app-container" style={{ maxWidth: 840, margin: '0 auto' }}>
        
        {/* Top Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              fontSize: '0.86rem',
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            <ShieldCheck size={18} />
            <span>BorrowMe Trust & Verification Engine</span>
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
            Xác thực Danh tính Sinh viên
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 600, margin: '0 auto' }}>
            Nhận ngay Huy hiệu <strong>Sinh viên Đã xác thực (Verified Badge)</strong> để tăng 300% độ tin cậy khi thuê và cho thuê đồ dùng sinh viên.
          </p>
        </div>

        {/* Current Status Card */}
        {user.isVerified ? (
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
              border: '1px solid #6ee7b7',
              borderRadius: 'var(--radius-xl)',
              padding: '28px 32px',
              marginBottom: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                }}
              >
                <ShieldCheck size={32} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#065f46' }}>
                    Tài khoản Đã Xác thực Danh tính
                  </h3>
                  <span className="badge badge-verified" style={{ background: '#059669', color: '#fff' }}>
                    Verified Student
                  </span>
                </div>
                <p style={{ color: '#047857', fontSize: '0.9rem' }}>
                  {user.fullName} • Trường: <strong>{user.university || 'Đại học đối tác'}</strong>
                  {user.studentCardNumber && ` • MSSV: ${user.studentCardNumber}`}
                  {user.studentEmail && ` • Email: ${user.studentEmail}`}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Link href="/items/post" className="btn btn-primary btn-sm">
                <span>Đăng tin cho thuê</span>
              </Link>
              <Link href="/search" className="btn btn-secondary btn-sm">
                <span>Tìm đồ thuê ngay</span>
              </Link>
            </div>
          </div>
        ) : (
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
              border: '1px solid #fde68a',
              borderRadius: 'var(--radius-xl)',
              padding: '20px 24px',
              marginBottom: 32,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <AlertTriangle size={28} color="#d97706" />
            <div>
              <strong style={{ color: '#92400e', fontSize: '1rem', display: 'block' }}>
                Hồ sơ của bạn chưa được xác thực sinh viên
              </strong>
              <p style={{ color: '#b45309', fontSize: '0.86rem', marginTop: 2 }}>
                Hãy chọn một trong hai phương thức bên dưới để kích hoạt huy hiệu uy tín ngay trong 1 phút!
              </p>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>
          
          {/* Main Verification Form */}
          <div
            className="card"
            style={{
              padding: '32px',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {/* Success Alert */}
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
                  <p style={{ fontSize: '0.84rem', marginTop: 2 }}>
                    Hồ sơ của bạn đã được cập nhật với huy hiệu Sinh viên Xác thực.
                  </p>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {errorMsg && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  marginBottom: 24,
                  color: '#b91c1c',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <AlertTriangle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Method Tabs */}
            <div
              style={{
                display: 'flex',
                background: '#f1f5f9',
                borderRadius: 'var(--radius-md)',
                padding: 4,
                marginBottom: 28,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setActiveMethod('email');
                  setErrorMsg(null);
                }}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: activeMethod === 'email' ? '#ffffff' : 'transparent',
                  color: activeMethod === 'email' ? 'var(--primary)' : 'var(--text-secondary)',
                  boxShadow: activeMethod === 'email' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <Mail size={16} />
                <span>Email trường (.edu.vn)</span>
                <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>Nhanh nhất</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMethod('card');
                  setErrorMsg(null);
                }}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: activeMethod === 'card' ? '#ffffff' : 'transparent',
                  color: activeMethod === 'card' ? 'var(--primary)' : 'var(--text-secondary)',
                  boxShadow: activeMethod === 'card' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <CreditCard size={16} />
                <span>Thẻ Sinh Viên & CCCD</span>
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {activeMethod === 'email' ? (
                <>
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
                      Địa chỉ Email sinh viên được cấp bởi trường (.edu.vn) *
                    </label>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <div style={{ position: 'relative', flex: 1 }}>
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
                          placeholder="VD: nam.lh@uel.edu.vn hoặc sv@uit.edu.vn"
                          value={studentEmail}
                          onChange={(e) => setStudentEmail(e.target.value)}
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

                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="btn btn-secondary"
                        style={{ padding: '0 16px', fontSize: '0.88rem' }}
                      >
                        <span>{otpSent ? 'Gửi lại mã' : 'Gửi mã OTP'}</span>
                      </button>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6, display: 'block' }}>
                      Hệ thống hỗ trợ các trường: Bách Khoa, CNTT, Kinh Tế - Luật, KHTN, NEU, FTU, UEH, FPT...
                    </span>
                  </div>

                  {otpSent && (
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px dashed #cbd5e1',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px',
                      }}
                    >
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.86rem',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          marginBottom: 6,
                        }}
                      >
                        Mã xác thực OTP (6 chữ số)
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        placeholder="123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: 'var(--radius-md)',
                          border: '2px solid var(--primary)',
                          fontSize: '1.2rem',
                          letterSpacing: 4,
                          fontWeight: 700,
                          textAlign: 'center',
                          outline: 'none',
                          background: '#fff',
                        }}
                      />
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 6, textAlign: 'center' }}>
                        💡 Mã thử nghiệm mẫu: <strong>123456</strong> (đã được tự động điền)
                      </p>
                    </div>
                  )}

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
                      Trường Đại học (Tuỳ chọn / Tự động nhận diện)
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Trường ĐH Kinh Tế - Luật (ĐHQG-HCM)"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-strong)',
                        fontSize: '0.92rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </>
              ) : (
                <>
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
                      Trường Đại học / Cao đẳng bạn đang theo học *
                    </label>
                    <select
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
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
                      <option value="">-- Chọn trường Đại học --</option>
                      {POPULAR_UNIVERSITIES.map((uni) => (
                        <option key={uni} value={uni}>
                          {uni}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
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
                        Mã số sinh viên (MSSV) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="VD: 21123456"
                        value={studentCardNumber}
                        onChange={(e) => setStudentCardNumber(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-strong)',
                          fontSize: '0.92rem',
                          outline: 'none',
                        }}
                      />
                    </div>

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
                        Số CCCD / CMND (Bảo mật)
                      </label>
                      <input
                        type="text"
                        placeholder="VD: 07920100xxxx"
                        value={idCardNumber}
                        onChange={(e) => setIdCardNumber(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-strong)',
                          fontSize: '0.92rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  {/* Student Card Photo Simulation */}
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
                      Ảnh chụp Thẻ Sinh Viên (Mặt trước)
                    </label>
                    <div
                      onClick={() =>
                        setCardImagePreview(
                          'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'
                        )
                      }
                      style={{
                        border: '2px dashed #cbd5e1',
                        borderRadius: 'var(--radius-md)',
                        padding: '24px 16px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: cardImagePreview ? '#ecfdf5' : '#f8fafc',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      <Upload size={28} color={cardImagePreview ? 'var(--accent)' : 'var(--text-muted)'} style={{ margin: '0 auto 8px' }} />
                      <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        {cardImagePreview ? '✓ Đã tải lên thẻ sinh viên mẫu' : 'Bấm để tải ảnh thẻ sinh viên mẫu'}
                      </strong>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        Hỗ trợ JPG, PNG (tối đa 5MB)
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-lg"
                style={{
                  width: '100%',
                  marginTop: 10,
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? (
                  <span>Đang xử lý xác thực...</span>
                ) : (
                  <>
                    <ShieldCheck size={20} />
                    <span>Xác nhận & Cấp Huy hiệu Sinh viên</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Side: Benefits & Trust Assurance */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Benefits Card */}
            <div
              className="card"
              style={{
                padding: '24px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                background: '#ffffff',
              }}
            >
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} color="var(--primary)" />
                <span>Quyền lợi khi Xác thực</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'var(--accent-light)',
                      color: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <Check size={14} />
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>
                    <strong>Huy hiệu Verified Student</strong>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      Tăng 300% độ tin cậy từ chủ đồ và người thuê cùng trường.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <Check size={14} />
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>
                    <strong>Ưu tiên Giữ cọc Escrow</strong>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      Tự động hoàn cọc ngay khi trả đồ mà không cần chờ đối soát thủ công.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'var(--secondary-light)',
                      color: 'var(--secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <Check size={14} />
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>
                    <strong>Đăng tin Không giới hạn</strong>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      Được đăng tin cho thuê các món đồ giá trị cao (máy ảnh, laptop, máy chiếu).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Box */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                <Info size={16} color="var(--primary)" />
                <span>Cam kết Bảo mật</span>
              </div>
              BorrowMe cam kết chỉ sử dụng thông tin sinh viên để đối soát uy tín giao dịch trong khuôn viên trường học, tuyệt đối không chia sẻ cho bên thứ ba.
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyStudentPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '60px 0' }}>Đang tải...</div>}>
      <VerifyStudentContent />
    </Suspense>
  );
}
