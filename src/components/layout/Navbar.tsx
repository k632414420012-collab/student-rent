'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  PlusCircle,
  Search,
  Calendar,
  Bell,
  User,
  LogOut,
  GraduationCap,
  ChevronDown,
  UserCheck,
  Settings,
  Sparkles,
  Package,
  LayoutDashboard,
} from 'lucide-react';

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="navbar">
      <div className="app-container">
        <div className="navbar-inner">
          
          {/* Logo / Brand */}
          <Link href="/" className="navbar-brand">
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: 'var(--gradient-primary)',
                color: '#fff',
                boxShadow: '0 4px 10px var(--primary-glow)',
              }}
            >
              <Calendar size={20} />
            </span>
            <span>
              Borrow<span style={{ color: 'var(--primary)' }}>Me</span>
            </span>
            <span className="brand-badge">Student Rent</span>
          </Link>

          {/* Navigation Links */}
          <nav>
            <ul className="navbar-links">
              <li>
                <Link href="/search" className="nav-link">
                  <Search size={17} />
                  <span>Tìm đồ thuê</span>
                </Link>
              </li>
              <li>
                <Link href="/my-orders" className="nav-link">
                  <Calendar size={17} />
                  <span>Đơn của tôi</span>
                </Link>
              </li>
              <li>
                <Link href="/verify-student" className="nav-link">
                  <GraduationCap size={17} />
                  <span>Xác thực SV</span>
                  {user?.isVerified && (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        display: 'inline-block',
                      }}
                    />
                  )}
                </Link>
              </li>
              <li>
                <Link href="/notifications" className="nav-link">
                  <Bell size={17} />
                  <span>Thông báo</span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* User / Auth Actions */}
          <div className="navbar-actions">
            <Link href="/items/post" className="btn btn-secondary btn-sm btn-pill" style={{ fontWeight: 600 }}>
              <PlusCircle size={16} style={{ color: 'var(--primary)' }} />
              <span>Đăng tin cho thuê</span>
            </Link>

            {loading ? (
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'var(--bg-muted)',
                }}
              />
            ) : user ? (
              /* User Dropdown */
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '4px 10px 4px 6px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onMouseLeave={(e) => {
                    if (!dropdownOpen) e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: 'var(--gradient-primary)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                    }}
                  >
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>

                  <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          maxWidth: 110,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: 'inline-block',
                        }}
                      >
                        {user.fullName.split(' ').pop()}
                      </span>
                      {user.isVerified && (
                        <span title="Sinh viên Đã xác thực" style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <ShieldCheck size={14} color="var(--accent)" />
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronDown size={14} color="var(--text-muted)" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      width: 240,
                      background: '#ffffff',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-xl)',
                      border: '1px solid var(--border-subtle)',
                      padding: '8px',
                      zIndex: 100,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                  >
                    {/* User Card inside dropdown */}
                    <div
                      style={{
                        padding: '10px 12px',
                        borderBottom: '1px solid var(--border-subtle)',
                        marginBottom: 4,
                      }}
                    >
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>
                        {user.fullName}
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                        {user.email}
                      </span>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <span
                          className={`badge ${
                            user.isVerified ? 'badge-verified' : 'badge-warning'
                          }`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          {user.isVerified ? '✓ Sinh viên Xác thực' : 'Chưa xác thực SV'}
                        </span>
                        
                        <span
                          className="badge badge-primary"
                          style={{ fontSize: '0.72rem' }}
                        >
                          {user.role}
                        </span>
                      </div>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.86rem',
                        color: 'var(--text-primary)',
                        transition: 'background var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-muted)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <User size={16} />
                      <span>Hồ sơ & Tài khoản</span>
                    </Link>

                    <Link
                      href="/verify-student"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.86rem',
                        color: 'var(--text-primary)',
                        transition: 'background var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-muted)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <ShieldCheck size={16} color="var(--primary)" />
                      <span>Xác thực danh tính SV</span>
                    </Link>

                    <Link
                      href="/my-items"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.86rem',
                        color: 'var(--text-primary)',
                        transition: 'background var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-muted)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Package size={16} color="var(--primary)" />
                      <span>Đồ cho thuê của tôi</span>
                    </Link>

                    <Link
                      href="/my-orders"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.86rem',
                        color: 'var(--text-primary)',
                        transition: 'background var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-muted)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Calendar size={16} />
                      <span>Đơn thuê của tôi</span>
                    </Link>

                    {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.86rem',
                        color: '#312e81',
                        fontWeight: 600,
                        background: 'rgba(79, 70, 229, 0.08)',
                        transition: 'background var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(79, 70, 229, 0.15)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(79, 70, 229, 0.08)')}
                    >
                      <LayoutDashboard size={16} color="var(--primary)" />
                      <span>Quản trị hệ thống (Admin)</span>
                    </Link>
                    )}

                    <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />

                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.86rem',
                        color: '#ef4444',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <LogOut size={16} />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Guest Login / Register */
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Link href="/login" className="btn btn-secondary btn-sm btn-pill" style={{ fontWeight: 600 }}>
                  <User size={15} style={{ color: 'var(--primary)' }} />
                  <span>Đăng nhập</span>
                </Link>
                <Link href="/register" className="btn btn-primary btn-sm btn-pill" style={{ fontWeight: 600 }}>
                  <span>Đăng ký</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
