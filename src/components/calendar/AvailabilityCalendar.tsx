'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Lock, Calendar as CalendarIcon, Info } from 'lucide-react';
import { formatVND } from '@/lib/utils';

interface AvailabilityEntry {
  date: string; // ISO String
  status: 'AVAILABLE' | 'BOOKED' | 'UNAVAILABLE';
}

interface AvailabilityCalendarProps {
  itemId: string;
  availabilities: AvailabilityEntry[];
  rentalPricePerDay: number;
  depositAmount: number;
  mode?: 'renter' | 'lender'; // renter = pick date range; lender = toggle availability
  onRangeSelect?: (startDate: Date | null, endDate: Date | null, totalRental: number, totalDeposit: number) => void;
  onLenderUpdate?: (updatedDates: string[], newStatus: 'AVAILABLE' | 'UNAVAILABLE') => void;
}

export default function AvailabilityCalendar({
  itemId,
  availabilities = [],
  rentalPricePerDay,
  depositAmount,
  mode = 'renter',
  onRangeSelect,
  onLenderUpdate,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Map availability list for quick lookup: YYYY-MM-DD -> status
  const availabilityMap = useMemo(() => {
    const map = new Map<string, 'AVAILABLE' | 'BOOKED' | 'UNAVAILABLE'>();
    availabilities.forEach((item) => {
      const d = new Date(item.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      map.set(key, item.status);
    });
    return map;
  }, [availabilities]);

  // Generate calendar grid for current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon ...
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];

    // Padding before 1st day of month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dayNumber: null, date: null, status: 'EMPTY' });
    }

    // Days in current month
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      dateObj.setHours(0, 0, 0, 0);
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      let status = availabilityMap.get(key) || 'AVAILABLE'; // Default to AVAILABLE if in future
      const isPast = dateObj < today;

      if (isPast) {
        status = 'UNAVAILABLE';
      }

      days.push({
        dayNumber: day,
        date: dateObj,
        status: isPast ? 'PAST' : status,
        dateKey: key,
      });
    }

    return days;
  }, [currentMonth, availabilityMap]);

  // Handle month navigation
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Helper check if date is in selected range
  const isDateInRange = (d: Date) => {
    if (!startDate) return false;
    if (startDate && endDate) {
      return d >= startDate && d <= endDate;
    }
    if (startDate && hoverDate && !endDate) {
      const minD = startDate < hoverDate ? startDate : hoverDate;
      const maxD = startDate < hoverDate ? hoverDate : startDate;
      return d >= minD && d <= maxD;
    }
    return false;
  };

  // Handle date selection for Renter
  const handleDateClick = (cell: any) => {
    if (cell.status === 'EMPTY' || cell.status === 'PAST' || cell.status === 'BOOKED' || cell.status === 'UNAVAILABLE') {
      return;
    }

    const clickedDate = cell.date;

    if (mode === 'lender') {
      // Toggle availability in lender mode
      const newStatus = cell.status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';
      if (onLenderUpdate) {
        onLenderUpdate([clickedDate.toISOString()], newStatus);
      }
      return;
    }

    // Renter Range Selection Logic
    if (!startDate || (startDate && endDate)) {
      setStartDate(clickedDate);
      setEndDate(null);
      if (onRangeSelect) onRangeSelect(clickedDate, null, 0, depositAmount);
    } else if (startDate && !endDate) {
      if (clickedDate < startDate) {
        setStartDate(clickedDate);
        setEndDate(null);
        if (onRangeSelect) onRangeSelect(clickedDate, null, 0, depositAmount);
      } else {
        // Check if any date in between is BOOKED or UNAVAILABLE
        let hasConflict = false;
        let curr = new Date(startDate);
        while (curr <= clickedDate) {
          const key = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`;
          const stat = availabilityMap.get(key) || 'AVAILABLE';
          if (stat === 'BOOKED' || stat === 'UNAVAILABLE') {
            hasConflict = true;
            break;
          }
          curr.setDate(curr.getDate() + 1);
        }

        if (hasConflict) {
          alert('Khoảng ngày bạn chọn chứa ngày đã được đặt hoặc chủ đồ đã khóa. Vui lòng chọn khoảng ngày trống khác.');
          return;
        }

        setEndDate(clickedDate);
        const diffTime = Math.abs(clickedDate.getTime() - startDate.getTime());
        const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        const totalRental = totalDays * rentalPricePerDay;

        if (onRangeSelect) {
          onRangeSelect(startDate, clickedDate, totalRental, depositAmount);
        }
      }
    }
  };

  // Calculate rental summary
  const selectedDaysCount = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [startDate, endDate]);

  const totalRentalCost = selectedDaysCount * rentalPricePerDay;

  return (
    <div style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
      {/* Calendar Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: '10px',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CalendarIcon size={18} />
          </span>
          <h3 style={{ fontSize: '1.12rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            Lịch Trống Thời Gian Thực
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={prevMonth}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#ffffff',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            title="Tháng trước"
          >
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', minWidth: '124px', textAlign: 'center', color: 'var(--text-primary)' }}>
            Tháng {currentMonth.getMonth() + 1}, {currentMonth.getFullYear()}
          </span>
          <button
            onClick={nextMonth}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#ffffff',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            title="Tháng sau"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '18px', fontSize: '0.8rem', padding: '10px 14px', background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: 600 }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#10b981' }} />
          Sẵn sàng cho thuê
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#e11d48', fontWeight: 600 }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#f43f5e' }} />
          Đã có người đặt
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontWeight: 600 }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#cbd5e1' }} />
          Chủ đồ khóa lịch
        </span>
      </div>

      {/* Weekday Names */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', marginBottom: '10px', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
        <div>CN</div>
        <div>T2</div>
        <div>T3</div>
        <div>T4</div>
        <div>T5</div>
        <div>T6</div>
        <div>T7</div>
      </div>

      {/* Calendar Days Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
        {calendarDays.map((cell, index) => {
          if (cell.status === 'EMPTY' || !cell.date) {
            return <div key={`empty-${index}`} style={{ height: 42 }} />;
          }

          const isStart = startDate && cell.date.getTime() === startDate.getTime();
          const isEnd = endDate && cell.date.getTime() === endDate.getTime();
          const inRange = isDateInRange(cell.date);
          const isBooked = cell.status === 'BOOKED';
          const isUnavailable = cell.status === 'UNAVAILABLE' || cell.status === 'PAST';

          let bg = '#ffffff';
          let border = '1px solid var(--border-subtle)';
          let color = 'var(--text-primary)';
          let cursor = 'pointer';
          let boxShadow = 'none';

          if (isBooked) {
            bg = '#fff1f2';
            border = '1px solid #fecdd3';
            color = '#e11d48';
            cursor = 'not-allowed';
          } else if (isUnavailable) {
            bg = 'var(--bg-muted)';
            color = 'var(--text-muted)';
            border = '1px solid var(--border-subtle)';
            cursor = 'not-allowed';
          } else if (isStart || isEnd) {
            bg = 'var(--gradient-primary)';
            border = '1px solid var(--primary)';
            color = '#ffffff';
            boxShadow = '0 4px 12px var(--primary-glow)';
          } else if (inRange) {
            bg = 'var(--primary-light)';
            border = '1px solid var(--primary-border)';
            color = 'var(--primary)';
          }

          return (
            <button
              key={cell.dateKey}
              type="button"
              onClick={() => handleDateClick(cell)}
              onMouseEnter={() => !endDate && setHoverDate(cell.date)}
              style={{
                height: 42,
                borderRadius: '10px',
                background: bg,
                border,
                color,
                fontWeight: isStart || isEnd || inRange ? 700 : 500,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                cursor,
                boxShadow,
              }}
            >
              {cell.dayNumber}
              {isBooked && (
                <Lock size={10} style={{ position: 'absolute', bottom: 3, right: 3, opacity: 0.8 }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Dynamic Cost Calculator Preview (Self-service Booking Engine) */}
      {mode === 'renter' && (
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
          {startDate && endDate ? (
            <div style={{ background: 'var(--primary-light)', padding: '18px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-border)', boxShadow: '0 4px 12px rgba(112, 101, 240, 0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Khoảng ngày thuê:</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                  {startDate.toLocaleDateString('vi-VN')} ➔ {endDate.toLocaleDateString('vi-VN')} ({selectedDaysCount} ngày)
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Tiền thuê ({selectedDaysCount} × {formatVND(rentalPricePerDay)}):</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatVND(totalRentalCost)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Tiền cọc an toàn (Escrow hoàn lại 100%):</span>
                <span style={{ fontWeight: 700, color: '#059669' }}>{formatVND(depositAmount)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px dashed var(--primary-border)', fontSize: '1.08rem', fontWeight: 800 }}>
                <span style={{ color: 'var(--text-primary)' }}>Tổng thanh toán quét QR:</span>
                <span style={{ color: 'var(--primary)' }}>{formatVND(totalRentalCost + depositAmount)}</span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              <Info size={16} style={{ color: 'var(--primary)' }} />
              <span>Kéo/chọn ngày bắt đầu và ngày kết thúc trên lịch để tự động tính phí thuê & tiền cọc.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
