'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { formatDateVN } from '@/lib/utils';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggeringCron, setTriggeringCron] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleTriggerReminders = async () => {
    try {
      setTriggeringCron(true);
      const res = await fetch('/api/cron/reminders', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(`Đã kích hoạt quét lịch tự động thành công! Đã gửi ${data.triggeredCount} thông báo mới.`);
        fetchNotifications();
      }
    } catch (err) {
      alert('Lỗi khi kích hoạt nhắc lịch');
    } finally {
      setTriggeringCron(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'PAYMENT':
        return <ShieldCheck size={20} style={{ color: '#059669' }} />;
      case 'BOOKING':
        return <CheckCircle size={20} style={{ color: 'var(--primary)' }} />;
      case 'REMINDER':
        return <Clock size={20} style={{ color: '#d97706' }} />;
      case 'DISPUTE':
        return <AlertTriangle size={20} style={{ color: '#dc2626' }} />;
      default:
        return <Bell size={20} style={{ color: 'var(--primary)' }} />;
    }
  };

  return (
    <div style={{ padding: '40px 0 80px', background: 'var(--bg-main)' }}>
      <div className="app-container" style={{ maxWidth: '800px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              Trung Tâm Thông Báo
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Thông báo thời gian thực về thanh toán, nhắc lịch nhận/trả đồ và bảo vệ cọc Escrow.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={handleTriggerReminders}
              disabled={triggeringCron}
              className="btn btn-secondary btn-sm"
              title="Quét các đơn sắp đến hạn nhận/trả để gửi nhắc lịch"
            >
              <Zap size={15} style={{ color: '#d97706' }} />
              <span>{triggeringCron ? 'Đang quét...' : '⚡ Quét Nhắc Lịch (Cron)'}</span>
            </button>

            <button
              type="button"
              onClick={markAllAsRead}
              className="btn btn-secondary btn-sm"
            >
              <span>Đánh dấu đã đọc</span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            Đang tải thông báo...
          </div>
        ) : notifications.length === 0 ? (
          <div className="card" style={{ padding: '64px 24px', textAlign: 'center' }}>
            <Bell size={44} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>
              Bạn chưa có thông báo nào
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Các cập nhật đơn hàng, đối soát QR và nhắc lịch hẹn sẽ hiển thị tại đây.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="card"
                style={{
                  padding: '20px',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  borderLeft: notif.isRead ? '1px solid var(--border-subtle)' : '4px solid var(--primary)',
                  background: notif.isRead ? '#fff' : '#f8faff',
                }}
              >
                <div style={{ padding: '8px', background: 'var(--bg-muted)', borderRadius: '10px' }}>
                  {getIcon(notif.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {notif.title}
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {formatDateVN(notif.createdAt)}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: notif.linkUrl ? '10px' : 0 }}>
                    {notif.content}
                  </p>

                  {notif.linkUrl && (
                    <Link
                      href={notif.linkUrl}
                      style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <span>Xem chi tiết</span>
                      <ArrowRight size={13} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
