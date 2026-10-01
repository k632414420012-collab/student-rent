'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  ShieldCheck,
  Package,
  Users,
  AlertTriangle,
  Settings,
  Layers,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  TrendingUp,
  DollarSign,
  Search,
  Eye,
  Trash2,
  Lock,
  Unlock,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  PlusCircle,
  Edit,
  Info,
} from 'lucide-react';
import { formatVND, formatDateVN } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'verifications' | 'users' | 'disputes' | 'categories' | 'configs'>('overview');

  // Stats State
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Items State
  const [items, setItems] = useState<any[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemSearch, setItemSearch] = useState('');
  const [itemFilterStatus, setItemFilterStatus] = useState('');

  // Verifications State
  const [verifications, setVerifications] = useState<any[]>([]);
  const [verificationsLoading, setVerificationsLoading] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Users State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  // Disputes State
  const [disputes, setDisputes] = useState<any[]>([]);
  const [disputesLoading, setDisputesLoading] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [deductedAmount, setDeductedAmount] = useState('');
  const [adminNote, setAdminNote] = useState('');

  // Categories State
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatDepositRate, setNewCatDepositRate] = useState('0.5');

  // Configs State
  const [configs, setConfigs] = useState<any>({
    serviceFeeRate: '8',
    freeCancelHours: '24',
    escrowAutoRefundDays: '3',
  });
  const [configsLoading, setConfigsLoading] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  // Action Loading Indicator
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // 1. Fetch Stats
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to load stats', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // 2. Fetch Items
  const fetchItems = useCallback(async () => {
    try {
      setItemsLoading(true);
      const params = new URLSearchParams();
      if (itemFilterStatus) params.set('status', itemFilterStatus);
      if (itemSearch) params.set('q', itemSearch);
      const res = await fetch(`/api/admin/items?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (err) {
      console.error('Failed to load items', err);
    } finally {
      setItemsLoading(false);
    }
  }, [itemFilterStatus, itemSearch]);

  // 3. Fetch Verifications
  const fetchVerifications = useCallback(async () => {
    try {
      setVerificationsLoading(true);
      const res = await fetch('/api/admin/verifications');
      const data = await res.json();
      if (data.success) {
        setVerifications(data.data);
      }
    } catch (err) {
      console.error('Failed to load verifications', err);
    } finally {
      setVerificationsLoading(false);
    }
  }, []);

  // 4. Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const params = new URLSearchParams();
      if (userSearch) params.set('q', userSearch);
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setUsersList(data.data);
      }
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setUsersLoading(false);
    }
  }, [userSearch]);

  // 5. Fetch Disputes
  const fetchDisputes = useCallback(async () => {
    try {
      setDisputesLoading(true);
      const res = await fetch('/api/disputes');
      const data = await res.json();
      if (data.success) {
        setDisputes(data.data);
      }
    } catch (err) {
      console.error('Failed to load disputes', err);
    } finally {
      setDisputesLoading(false);
    }
  }, []);

  // 6. Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // 7. Fetch Configs
  const fetchConfigs = useCallback(async () => {
    try {
      setConfigsLoading(true);
      const res = await fetch('/api/admin/configs');
      const data = await res.json();
      if (data.success) {
        setConfigs(data.data);
      }
    } catch (err) {
      console.error('Failed to load configs', err);
    } finally {
      setConfigsLoading(false);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === 'items') fetchItems();
    if (activeTab === 'verifications') fetchVerifications();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'disputes') fetchDisputes();
    if (activeTab === 'categories') fetchCategories();
    if (activeTab === 'configs') fetchConfigs();
  }, [activeTab, fetchItems, fetchVerifications, fetchUsers, fetchDisputes, fetchCategories, fetchConfigs]);

  // Item Actions
  const handleItemAction = async (itemId: string, action: string, isPremium?: boolean) => {
    try {
      setActionLoading(itemId);
      const res = await fetch('/api/admin/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, action, isPremium }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchItems();
        fetchStats();
      } else {
        alert(data.error || 'Thao tác thất bại');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setActionLoading(null);
    }
  };

  // Verification Actions
  const handleVerificationAction = async (requestId: string, action: 'APPROVE' | 'REJECT', note?: string) => {
    try {
      setActionLoading(requestId);
      const res = await fetch('/api/admin/verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action, adminNote: note }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setRejectModalOpen(false);
        fetchVerifications();
        fetchStats();
      } else {
        alert(data.error || 'Duyệt thất bại');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setActionLoading(null);
    }
  };

  // User Actions
  const handleUserRoleChange = async (userId: string, newRole: string) => {
    try {
      setActionLoading(userId);
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchUsers();
      } else {
        alert(data.error || 'Cập nhật quyền thất bại');
      }
    } catch (err) {
      alert('Lỗi kết nối');
    } finally {
      setActionLoading(null);
    }
  };

  // Dispute Resolve Action
  const handleResolveDispute = async () => {
    if (!selectedDispute) return;
    try {
      setActionLoading(selectedDispute.id);
      const res = await fetch(`/api/disputes/${selectedDispute.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deductedAmount: parseFloat(deductedAmount || '0'),
          adminNote,
          resolvedById: user?.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setResolveModalOpen(false);
        fetchDisputes();
        fetchStats();
      } else {
        alert(data.error || 'Phân xử thất bại');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setActionLoading(null);
    }
  };

  // Category Actions
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || !newCatSlug) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCatName,
          slug: newCatSlug,
          minDepositRate: parseFloat(newCatDepositRate),
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setNewCatName('');
        setNewCatSlug('');
        fetchCategories();
      } else {
        alert(data.error || 'Không thể tạo danh mục');
      }
    } catch (err) {
      alert('Lỗi kết nối');
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    try {
      const res = await fetch(`/api/categories?id=${catId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchCategories();
      } else {
        alert(data.error || 'Không thể xóa danh mục');
      }
    } catch (err) {
      alert('Lỗi kết nối');
    }
  };

  // Save Configs
  const handleSaveConfigs = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingConfig(true);
      await fetch('/api/admin/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'serviceFeeRate', value: configs.serviceFeeRate }),
      });
      await fetch('/api/admin/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'freeCancelHours', value: configs.freeCancelHours }),
      });
      await fetch('/api/admin/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'escrowAutoRefundDays', value: configs.escrowAutoRefundDays }),
      });
      alert('Lưu cấu hình hệ thống thành công!');
    } catch (err) {
      alert('Lỗi khi lưu cấu hình');
    } finally {
      setSavingConfig(false);
    }
  };

  // ===== ROLE GUARD: Admin only =====
  if (!user) {
    return (
      <div className="app-container" style={{ padding: '80px 16px', maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '40px 24px' }}>
          <ShieldCheck size={48} color="var(--primary)" style={{ margin: '0 auto 16px', display: 'block' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>Bạn chưa đăng nhập</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.92rem' }}>
            Vui lòng đăng nhập bằng tài khoản Admin để truy cập trang quản trị.
          </p>
          <Link href="/login?redirect=/admin" className="btn btn-primary">Đăng nhập</Link>
        </div>
      </div>
    );
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="app-container" style={{ padding: '80px 16px', maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '40px 24px', border: '1px solid #fecaca' }}>
          <div
            style={{
              width: 60, height: 60, borderRadius: '50%',
              background: '#fef2f2', color: '#ef4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Lock size={28} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8, color: '#dc2626' }}>
            Không có quyền truy cập
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.92rem' }}>
            Trang này chỉ dành cho quản trị viên hệ thống. Tài khoản của bạn không có quyền Admin.
          </p>
          <Link href="/" className="btn btn-secondary">Quay về Trang chủ</Link>
        </div>
      </div>
    );
  }
  // ===================================

  return (
    <div style={{ padding: '32px 0 80px', background: 'var(--bg-main)' }}>
      <div className="app-container">
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-primary" style={{ background: '#312e81', color: '#c7d2fe' }}>
                <ShieldCheck size={13} /> Admin Portal
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hệ thống Quản trị BorrowMe</span>
            </div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              Bảng Điều Khiển Quản Trị Hệ Thống
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/" className="btn btn-secondary btn-sm">
              <span>Trang chủ sinh viên</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                fetchStats();
                if (activeTab === 'items') fetchItems();
                if (activeTab === 'verifications') fetchVerifications();
                if (activeTab === 'users') fetchUsers();
                if (activeTab === 'disputes') fetchDisputes();
              }}
              className="btn btn-secondary btn-sm"
              title="Làm mới dữ liệu"
            >
              <RefreshCw size={14} />
              <span>Làm mới</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '12px',
            marginBottom: '28px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {[
            { id: 'overview', label: 'Tổng quan & Thống kê', icon: LayoutDashboard },
            { id: 'items', label: 'Kiểm duyệt tin đăng', icon: Package },
            { id: 'verifications', label: 'Duyệt xác thực SV', icon: ShieldCheck, badge: stats?.metrics?.pendingVerificationsCount },
            { id: 'users', label: 'Quản lý người dùng', icon: Users },
            { id: 'disputes', label: 'Xử lý tranh chấp & Cọc', icon: AlertTriangle, badge: stats?.metrics?.openDisputesCount },
            { id: 'categories', label: 'Danh mục sản phẩm', icon: Layers },
            { id: 'configs', label: 'Biểu phí & Cấu hình', icon: Settings },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 700 : 500,
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? 'var(--primary)' : '#fff',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  boxShadow: isActive ? '0 4px 12px var(--primary-glow)' : 'var(--shadow-sm)',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={16} />
                <span>{t.label}</span>
                {Boolean(t.badge && t.badge > 0) && (
                  <span
                    style={{
                      background: isActive ? '#fff' : '#ef4444',
                      color: isActive ? '#ef4444' : '#fff',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: '10px',
                    }}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            {statsLoading ? (
              <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                Đang tổng hợp số liệu thống kê...
              </div>
            ) : (
              <>
                {/* Metrics Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                  <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '8px' }}>
                      <span>DOANH THU PHÍ SÀN (8%)</span>
                      <DollarSign size={16} color="var(--primary)" />
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>
                      {formatVND(stats?.metrics?.totalPlatformRevenue || 0)}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Tổng volume: {formatVND(stats?.metrics?.totalRentalVolume || 0)}
                    </div>
                  </div>

                  <div className="card" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '8px' }}>
                      <span>TIỀN CỌC ĐANG GIỮ (ESCROW)</span>
                      <ShieldCheck size={16} color="#10b981" />
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', marginBottom: '4px' }}>
                      {formatVND(stats?.metrics?.currentEscrowHolding || 0)}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>
                      Được bảo vệ an toàn 100%
                    </div>
                  </div>

                  <div className="card" style={{ padding: '20px', borderLeft: '4px solid #0284c7' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '8px' }}>
                      <span>TỔNG ĐƠN THUÊ</span>
                      <TrendingUp size={16} color="#0284c7" />
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {stats?.metrics?.totalBookings || 0}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Tỷ lệ hoàn tất: <strong style={{ color: '#059669' }}>{stats?.metrics?.successRate || 100}%</strong>
                    </div>
                  </div>

                  <div className="card" style={{ padding: '20px', borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '8px' }}>
                      <span>NGƯỜI DÙNG SINH VIÊN</span>
                      <Users size={16} color="#f59e0b" />
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {stats?.metrics?.totalUsers || 0}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#d97706' }}>
                      Đã xác thực: <strong>{stats?.metrics?.verifiedUsersCount || 0}</strong> SV
                    </div>
                  </div>
                </div>

                {/* 2-Column Split: Top Rented Items + Recent Orders */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', alignItems: 'start' }}>
                  {/* Top Items */}
                  <div className="card">
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={18} color="var(--primary)" />
                      <span>Món đồ được thuê nhiều nhất</span>
                    </h3>

                    {stats?.topItems && stats.topItems.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {stats.topItems.map((item: any, idx: number) => (
                          <div
                            key={item.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '12px',
                              background: '#f8fafc',
                              borderRadius: '10px',
                              fontSize: '0.88rem',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>
                                {idx + 1}
                              </span>
                              <div>
                                <Link href={`/items/${item.id}`} style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                  {item.title}
                                </Link>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  {item.categoryName} • Chủ: {item.lenderName}
                                </div>
                              </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                                {item.bookingCount} lượt thuê
                              </span>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                {formatVND(item.rentalPricePerDay)}/ngày
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Chưa có dữ liệu đặt đồ</p>
                    )}
                  </div>

                  {/* Recent Bookings */}
                  <div className="card">
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={18} color="var(--primary)" />
                      <span>Đơn thuê mới nhất</span>
                    </h3>

                    {stats?.recentBookings && stats.recentBookings.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {stats.recentBookings.slice(0, 5).map((b: any) => (
                          <div
                            key={b.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '10px 12px',
                              borderRadius: '8px',
                              border: '1px solid var(--border-subtle)',
                              fontSize: '0.85rem',
                            }}
                          >
                            <div>
                              <strong style={{ color: 'var(--primary)' }}>#{b.bookingCode}</strong>
                              <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>• {b.renter?.fullName}</span>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                {b.item?.title}
                              </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 700 }}>{formatVND(b.totalAmount)}</div>
                              <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                                {b.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Chưa có đơn thuê</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: ITEMS MODERATION */}
        {activeTab === 'items' && (
          <div className="card">
            {/* Filter & Search Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                Kiểm duyệt & Quản lý tin đăng ({items.length})
              </h3>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={itemFilterStatus}
                  onChange={(e) => setItemFilterStatus(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.85rem', background: '#fff' }}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="ACTIVE">Đang hiển thị (ACTIVE)</option>
                  <option value="HIDDEN">Tạm ẩn (HIDDEN)</option>
                  <option value="BANNED">Bị khóa (BANNED)</option>
                </select>

                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Tìm tên đồ, địa điểm..."
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    style={{ padding: '8px 12px 8px 30px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}
                  />
                  <Search size={14} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-muted)' }} />
                </div>
              </div>
            </div>

            {/* Items Table */}
            {itemsLoading ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải tin đăng...</div>
            ) : items.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px 0' }}>Không tìm thấy tin đăng phù hợp</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '10px 12px' }}>Món đồ</th>
                      <th style={{ padding: '10px 12px' }}>Danh mục</th>
                      <th style={{ padding: '10px 12px' }}>Chủ đồ</th>
                      <th style={{ padding: '10px 12px' }}>Giá thuê / Cọc</th>
                      <th style={{ padding: '10px 12px' }}>Trạng thái</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>Thao tác kiểm duyệt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it) => (
                      <tr key={it.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            <Link href={`/items/${it.id}`} target="_blank" style={{ color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              {it.title} <ExternalLink size={12} style={{ color: 'var(--text-muted)' }} />
                            </Link>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {it.location} • Tình trạng: {it.conditionStatus}
                          </div>
                        </td>

                        <td style={{ padding: '12px' }}>
                          <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                            {it.category?.name}
                          </span>
                        </td>

                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: 600 }}>{it.lender?.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{it.lender?.university || it.lender?.phone}</div>
                        </td>

                        <td style={{ padding: '12px' }}>
                          <strong style={{ color: 'var(--primary)' }}>{formatVND(it.rentalPricePerDay)}</strong>/ngày
                          <div style={{ fontSize: '0.75rem', color: '#059669' }}>Cọc: {formatVND(it.depositAmount)}</div>
                        </td>

                        <td style={{ padding: '12px' }}>
                          <span
                            className="badge"
                            style={{
                              fontSize: '0.75rem',
                              background: it.status === 'ACTIVE' ? '#dcfce7' : it.status === 'BANNED' ? '#fee2e2' : '#f1f5f9',
                              color: it.status === 'ACTIVE' ? '#15803d' : it.status === 'BANNED' ? '#b91c1c' : '#64748b',
                            }}
                          >
                            {it.status === 'ACTIVE' ? 'Đang hoạt động' : it.status === 'BANNED' ? 'Đã khóa vi phạm' : 'Tạm ẩn'}
                          </span>
                          {it.isPremium && (
                            <div style={{ marginTop: '4px' }}>
                              <span className="badge badge-premium" style={{ fontSize: '0.68rem' }}>
                                <Sparkles size={10} /> Ưu tiên
                              </span>
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            {it.status === 'BANNED' ? (
                              <button
                                type="button"
                                onClick={() => handleItemAction(it.id, 'ACTIVATE')}
                                disabled={actionLoading === it.id}
                                className="btn btn-secondary btn-sm"
                                style={{ color: '#059669', fontSize: '0.75rem', padding: '4px 8px' }}
                                title="Mở khóa tin"
                              >
                                <Unlock size={13} />
                                <span>Mở khóa</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleItemAction(it.id, 'BAN')}
                                disabled={actionLoading === it.id}
                                className="btn btn-secondary btn-sm"
                                style={{ color: '#dc2626', fontSize: '0.75rem', padding: '4px 8px' }}
                                title="Khóa tin vi phạm quy định"
                              >
                                <Lock size={13} />
                                <span>Khóa tin</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleItemAction(it.id, 'TOGGLE_PREMIUM')}
                              disabled={actionLoading === it.id}
                              className="btn btn-secondary btn-sm"
                              style={{ color: '#d97706', fontSize: '0.75rem', padding: '4px 8px' }}
                              title="Bật/Tắt ghim ưu tiên"
                            >
                              <Sparkles size={13} />
                              <span>{it.isPremium ? 'Bỏ ưu tiên' : 'Ưu tiên'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('Xác nhận xóa hoàn toàn tin đăng này?')) {
                                  handleItemAction(it.id, 'DELETE');
                                }
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ color: '#ef4444', padding: '4px 8px' }}
                              title="Xóa vĩnh viễn"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STUDENT VERIFICATIONS */}
        {activeTab === 'verifications' && (
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>
              Danh sách yêu cầu xác thực thẻ sinh viên ({verifications.length})
            </h3>

            {verificationsLoading ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải yêu cầu xác thực...</div>
            ) : verifications.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px 0' }}>Không có yêu cầu xác thực nào</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '10px 12px' }}>Sinh viên</th>
                      <th style={{ padding: '10px 12px' }}>Trường ĐH / MSSV</th>
                      <th style={{ padding: '10px 12px' }}>Ảnh thẻ sinh viên</th>
                      <th style={{ padding: '10px 12px' }}>Thời gian gửi</th>
                      <th style={{ padding: '10px 12px' }}>Trạng thái</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>Quyết định duyệt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifications.map((req) => (
                      <tr key={req.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '12px' }}>
                          <strong>{req.user?.fullName}</strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{req.studentEmail || req.user?.email}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{req.user?.phone}</div>
                        </td>

                        <td style={{ padding: '12px' }}>
                          <strong style={{ color: 'var(--primary)' }}>{req.university}</strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>MSSV: {req.studentCardNumber}</div>
                        </td>

                        <td style={{ padding: '12px' }}>
                          {req.studentCardImage ? (
                            <a href={req.studentCardImage} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--accent)', fontWeight: 600 }}>
                              <ExternalLink size={14} /> Xem ảnh thẻ SV
                            </a>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Không có ảnh</span>
                          )}
                        </td>

                        <td style={{ padding: '12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          {formatDateVN(req.createdAt)}
                        </td>

                        <td style={{ padding: '12px' }}>
                          <span
                            className="badge"
                            style={{
                              fontSize: '0.75rem',
                              background: req.status === 'APPROVED' ? '#dcfce7' : req.status === 'REJECTED' ? '#fee2e2' : '#fef3c7',
                              color: req.status === 'APPROVED' ? '#15803d' : req.status === 'REJECTED' ? '#b91c1c' : '#b45309',
                            }}
                          >
                            {req.status === 'APPROVED' ? 'Đã duyệt' : req.status === 'REJECTED' ? 'Đã từ chối' : 'Chờ duyệt'}
                          </span>
                        </td>

                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          {req.status === 'PENDING' ? (
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => handleVerificationAction(req.id, 'APPROVE')}
                                disabled={actionLoading === req.id}
                                className="btn btn-primary btn-sm"
                                style={{ background: '#10b981', borderColor: '#10b981', fontSize: '0.78rem', padding: '5px 10px' }}
                              >
                                <Check size={14} />
                                <span>Duyệt SV</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedReqId(req.id);
                                  setRejectReason('');
                                  setRejectModalOpen(true);
                                }}
                                disabled={actionLoading === req.id}
                                className="btn btn-secondary btn-sm"
                                style={{ color: '#dc2626', borderColor: '#fca5a5', fontSize: '0.78rem', padding: '5px 10px' }}
                              >
                                <X size={14} />
                                <span>Từ chối</span>
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{req.adminNote || 'Đã xử lý'}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: USERS MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                Quản lý người dùng hệ thống ({usersList.length})
              </h3>

              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Tìm theo tên, email, trường..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{ padding: '8px 12px 8px 30px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}
                />
                <Search size={14} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-muted)' }} />
              </div>
            </div>

            {usersLoading ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải danh sách người dùng...</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '10px 12px' }}>Họ và tên</th>
                      <th style={{ padding: '10px 12px' }}>Email & SĐT</th>
                      <th style={{ padding: '10px 12px' }}>Trường ĐH</th>
                      <th style={{ padding: '10px 12px' }}>Vai trò</th>
                      <th style={{ padding: '10px 12px' }}>Xác thực SV</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>Phân quyền / Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: 700 }}>{u.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Đồ đăng: {u._count?.items || 0} • Đơn thuê: {u._count?.bookings || 0}
                          </div>
                        </td>

                        <td style={{ padding: '12px' }}>
                          <div>{u.email}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.phone || 'Chưa cập nhật'}</div>
                        </td>

                        <td style={{ padding: '12px', color: 'var(--primary)', fontWeight: 600 }}>
                          {u.university || 'Chưa cập nhật'}
                        </td>

                        <td style={{ padding: '12px' }}>
                          <span className={`badge ${u.role === 'ADMIN' ? 'badge-premium' : 'badge-primary'}`} style={{ fontSize: '0.75rem' }}>
                            {u.role}
                          </span>
                        </td>

                        <td style={{ padding: '12px' }}>
                          {u.isVerified ? (
                            <span className="badge badge-verified" style={{ fontSize: '0.72rem' }}>
                              <ShieldCheck size={12} /> Đã xác thực
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Chưa xác thực</span>
                          )}
                        </td>

                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <select
                            value={u.role}
                            onChange={(e) => handleUserRoleChange(u.id, e.target.value)}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-subtle)',
                              fontSize: '0.8rem',
                              background: '#fff',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="RENTER">RENTER (Người thuê)</option>
                            <option value="LENDER">LENDER (Chủ đồ)</option>
                            <option value="ADMIN">ADMIN (Quản trị viên)</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: DISPUTES & ESCROW SETTLEMENT */}
        {activeTab === 'disputes' && (
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>
              Xử lý tranh chấp & Khấu trừ tiền cọc Escrow ({disputes.length})
            </h3>

            {disputesLoading ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải danh sách khiếu nại...</div>
            ) : disputes.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px 0' }}>Không có tranh chấp nào cần xử lý</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '10px 12px' }}>Đơn hàng / Món đồ</th>
                      <th style={{ padding: '10px 12px' }}>Bên khiếu nại & Người thuê</th>
                      <th style={{ padding: '10px 12px' }}>Lý do tranh chấp</th>
                      <th style={{ padding: '10px 12px' }}>Tiền cọc Escrow</th>
                      <th style={{ padding: '10px 12px' }}>Trạng thái</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>Thẩm định & Phân xử</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disputes.map((d) => (
                      <tr key={d.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '12px' }}>
                          <strong style={{ color: 'var(--primary)' }}>#{d.booking?.bookingCode}</strong>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{d.booking?.item?.title}</div>
                        </td>

                        <td style={{ padding: '12px' }}>
                          <div>Người tạo: <strong>{d.raisedBy?.fullName}</strong></div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Người thuê: {d.booking?.renter?.fullName}</div>
                        </td>

                        <td style={{ padding: '12px', maxWidth: '280px' }}>
                          <div style={{ color: '#b91c1c', fontWeight: 600 }}>{d.reason}</div>
                        </td>

                        <td style={{ padding: '12px' }}>
                          <strong style={{ color: '#059669' }}>{formatVND(d.booking?.depositFee || 0)}</strong>
                          {d.status === 'RESOLVED' && (
                            <div style={{ fontSize: '0.75rem', color: '#b91c1c' }}>
                              Đã trừ: {formatVND(d.deductedAmount)}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '12px' }}>
                          <span
                            className="badge"
                            style={{
                              fontSize: '0.75rem',
                              background: d.status === 'RESOLVED' ? '#dcfce7' : '#fee2e2',
                              color: d.status === 'RESOLVED' ? '#15803d' : '#b91c1c',
                            }}
                          >
                            {d.status === 'RESOLVED' ? 'Đã phân xử xong' : 'Đang mở (Cọc đóng băng)'}
                          </span>
                        </td>

                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          {d.status === 'OPEN' ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDispute(d);
                                setDeductedAmount(String(d.deductedAmount || d.booking?.depositFee || 0));
                                setAdminNote('');
                                setResolveModalOpen(true);
                              }}
                              className="btn btn-primary btn-sm"
                              style={{ background: '#b91c1c', borderColor: '#b91c1c', fontSize: '0.78rem' }}
                            >
                              <ShieldCheck size={14} />
                              <span>Phân xử cọc</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{d.adminNote || 'Đã kết luận'}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: CATEGORIES */}
        {activeTab === 'categories' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px', alignItems: 'start' }}>
            {/* Categories Table */}
            <div className="card">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>
                Danh sách danh mục sản phẩm ({categories.length})
              </h3>

              {categoriesLoading ? (
                <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải danh mục...</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '10px 12px' }}>Tên danh mục</th>
                      <th style={{ padding: '10px 12px' }}>Slug định danh</th>
                      <th style={{ padding: '10px 12px' }}>Cọc tối thiểu</th>
                      <th style={{ padding: '10px 12px' }}>Số sản phẩm</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '12px', fontWeight: 700 }}>{cat.name}</td>
                        <td style={{ padding: '12px', color: 'var(--text-muted)' }}><code>{cat.slug}</code></td>
                        <td style={{ padding: '12px', color: 'var(--accent)', fontWeight: 600 }}>
                          {(cat.minDepositRate * 100).toFixed(0)}%
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span className="badge badge-primary">{cat._count?.items || 0} món</span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#ef4444', padding: '4px 8px' }}
                            title="Xóa danh mục rỗng"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Create Category Form */}
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusCircle size={18} color="var(--primary)" />
                <span>Thêm danh mục mới</span>
              </h3>

              <form onSubmit={handleCreateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Tên danh mục *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Dụng cụ cắm trại"
                    value={newCatName}
                    onChange={(e) => {
                      setNewCatName(e.target.value);
                      if (!newCatSlug) {
                        setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                      }
                    }}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Slug đường dẫn *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: dung-cu-cam-trai"
                    value={newCatSlug}
                    onChange={(e) => setNewCatSlug(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Tỷ lệ cọc tối thiểu (0.5 = 50%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={newCatDepositRate}
                    onChange={(e) => setNewCatDepositRate(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '6px' }}>
                  <span>Tạo danh mục</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 7: SYSTEM CONFIGS & PRICING */}
        {activeTab === 'configs' && (
          <div className="card" style={{ maxWidth: '640px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
              Cấu hình biểu phí & Chính sách hoàn hủy
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Thiết lập tỷ lệ phí sàn tự động và khung thời gian hủy đơn miễn phí theo PRD.
            </p>

            <form onSubmit={handleSaveConfigs} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px' }}>
                  Tỷ lệ phí dịch vụ sàn giao dịch (%)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={configs.serviceFeeRate}
                    onChange={(e) => setConfigs({ ...configs, serviceFeeRate: e.target.value })}
                    style={{ width: '120px', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.9rem' }}
                  />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>% trên mỗi đơn thuê thành công (Mặc định: 8%)</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px' }}>
                  Thời hạn hủy đơn miễn phí trước khi nhận đồ (Giờ)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    min="1"
                    max="72"
                    value={configs.freeCancelHours}
                    onChange={(e) => setConfigs({ ...configs, freeCancelHours: e.target.value })}
                    style={{ width: '120px', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.9rem' }}
                  />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>giờ trước thời gian nhận đồ được hoàn cọc 100% (Mặc định: 24h)</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px' }}>
                  Thời gian giải ngân tiền cọc Escrow tự động (Ngày)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={configs.escrowAutoRefundDays}
                    onChange={(e) => setConfigs({ ...configs, escrowAutoRefundDays: e.target.value })}
                    style={{ width: '120px', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.9rem' }}
                  />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>ngày sau khi hoàn tất nếu không có khiếu nại (Mặc định: 3 ngày)</span>
                </div>
              </div>

              <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="btn btn-primary"
                  style={{ minWidth: '160px' }}
                >
                  <span>{savingConfig ? 'Đang lưu...' : 'Lưu cấu hình hệ thống'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL: Reject Verification */}
        {rejectModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '28px', boxShadow: 'var(--shadow-xl)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', marginBottom: '12px' }}>
                <XCircle size={22} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Từ chối yêu cầu xác thực sinh viên</h3>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Lý do từ chối (Gửi thông báo tới sinh viên) *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="VD: Ảnh thẻ sinh viên bị mờ, không rõ MSSV hoặc họ tên không khớp..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setRejectModalOpen(false)} className="btn btn-secondary btn-sm">
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={() => selectedReqId && handleVerificationAction(selectedReqId, 'REJECT', rejectReason)}
                  className="btn btn-primary btn-sm"
                  style={{ background: '#dc2626', borderColor: '#dc2626' }}
                >
                  <span>Xác nhận từ chối</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Resolve Dispute */}
        {resolveModalOpen && selectedDispute && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '28px', boxShadow: 'var(--shadow-xl)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c', marginBottom: '12px' }}>
                <AlertTriangle size={22} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  Phân xử tranh chấp đơn #{selectedDispute.booking?.bookingCode}
                </h3>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>
                <div><strong>Món đồ:</strong> {selectedDispute.booking?.item?.title}</div>
                <div><strong>Lý do khiếu nại:</strong> {selectedDispute.reason}</div>
                <div><strong>Tiền cọc đang giữ trong Escrow:</strong> <strong style={{ color: '#059669' }}>{formatVND(selectedDispute.booking?.depositFee)}</strong></div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Số tiền cọc khấu trừ bồi thường cho Chủ đồ (VNĐ) *
                </label>
                <input
                  type="number"
                  min="0"
                  max={selectedDispute.booking?.depositFee}
                  value={deductedAmount}
                  onChange={(e) => setDeductedAmount(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.9rem' }}
                />
                <div style={{ fontSize: '0.78rem', color: '#059669', marginTop: '4px' }}>
                  Số tiền hoàn trả còn lại cho Người thuê: <strong>{formatVND(Math.max(0, (selectedDispute.booking?.depositFee || 0) - parseFloat(deductedAmount || '0')))}</strong>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Kết luận & Ghi chú của Admin *
                </label>
                <textarea
                  rows={2}
                  placeholder="Ghi rõ căn cứ phân xử (VD: Khấu trừ 200k tiền trễ hạn 1 ngày, hoàn phần còn lại)..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setResolveModalOpen(false)} className="btn btn-secondary btn-sm">
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleResolveDispute}
                  className="btn btn-primary btn-sm"
                  style={{ background: '#b91c1c', borderColor: '#b91c1c' }}
                >
                  <ShieldCheck size={14} />
                  <span>Xác nhận phân xử & Giải ngân Escrow</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
