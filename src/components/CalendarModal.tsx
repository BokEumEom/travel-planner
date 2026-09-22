import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { DayPlan } from '../types';
import { useI18n } from '../lib/i18n';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  days: DayPlan[];
  activeDayId: string;
  onSelectDay: (dayId: string) => void;
  onAddNewDay: (dateString: string) => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  days,
  activeDayId,
  onSelectDay,
  onAddNewDay,
}) => {
  const { t, language } = useI18n();

  const activeDay = days.find((d) => d.id === activeDayId) || days[0];
  const activeDate = activeDay ? new Date(activeDay.date) : new Date(2026, 6, 3);

  const [currentYear, setCurrentYear] = useState(() => activeDate.getFullYear() || 2026);
  const [currentMonth, setCurrentMonth] = useState(() => (activeDate.getMonth() !== undefined ? activeDate.getMonth() : 6)); // 0-indexed, 6 = July

  if (!isOpen) return null;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = language === 'ko' 
    ? ['일', '월', '화', '수', '목', '금', '토']
    : ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Build days matrix
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthTotalDays = new Date(currentYear, currentMonth, 0).getDate();

  const calendarDays: Array<{
    dayNumber: number;
    monthOffset: -1 | 0 | 1;
    dateString: string;
    hasPlan: boolean;
    dayPlanId?: string;
    isSelected: boolean;
  }> = [];

  // Previous month filler days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthTotalDays - i;
    const m = currentMonth === 0 ? 12 : currentMonth;
    const y = currentMonth === 0 ? currentYear - 1 : currentYear;
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const plan = days.find((d) => d.date === dateStr);
    calendarDays.push({
      dayNumber: day,
      monthOffset: -1,
      dateString: dateStr,
      hasPlan: Boolean(plan),
      dayPlanId: plan?.id,
      isSelected: plan?.id === activeDayId,
    });
  }

  // Current month days
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const m = currentMonth + 1;
    const dateStr = `${currentYear}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const plan = days.find((d) => d.date === dateStr);
    calendarDays.push({
      dayNumber: day,
      monthOffset: 0,
      dateString: dateStr,
      hasPlan: Boolean(plan),
      dayPlanId: plan?.id,
      isSelected: plan?.id === activeDayId || dateStr === activeDay?.date,
    });
  }

  // Next month filler days to complete grid (multiples of 7)
  const remaining = 7 - (calendarDays.length % 7);
  if (remaining < 7) {
    for (let day = 1; day <= remaining; day++) {
      const m = currentMonth === 11 ? 1 : currentMonth + 2;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const plan = days.find((d) => d.date === dateStr);
      calendarDays.push({
        dayNumber: day,
        monthOffset: 1,
        dateString: dateStr,
        hasPlan: Boolean(plan),
        dayPlanId: plan?.id,
        isSelected: plan?.id === activeDayId,
      });
    }
  }

  const handleDayClick = (item: typeof calendarDays[0]) => {
    if (item.dayPlanId) {
      onSelectDay(item.dayPlanId);
      onClose();
    } else {
      // Create new plan for this day
      onAddNewDay(item.dateString);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[2px] p-4">
      <div 
        id="calendar-modal-container"
        className="w-full max-w-[340px] bg-white rounded-2xl shadow-2xl border border-neutral-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Calendar Header matching Frame 10 */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-neutral-400" />
            <h3 className="font-semibold text-neutral-900 text-base">
              {language === 'ko' ? `${currentYear}년 ${currentMonth + 1}월` : `${monthNames[currentMonth]} ${currentYear}`}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              id="calendar-prev-month-btn"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-600 transition-colors"
              title={t('prevMonth')}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              id="calendar-next-month-btn"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-600 transition-colors"
              title={t('nextMonth')}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              id="calendar-close-btn"
              onClick={onClose}
              className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-700 transition-colors ml-1"
              title={t('close')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="px-4 pt-3 pb-1 grid grid-cols-7 text-center">
          {daysOfWeek.map((day) => (
            <span key={day} className="text-[11px] font-semibold text-neutral-400 tracking-wider">
              {day}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="px-3 pb-4 pt-1 grid grid-cols-7 gap-y-1 text-center">
          {calendarDays.map((item, idx) => {
            const isCurrentMonth = item.monthOffset === 0;

            return (
              <button
                key={idx}
                id={`calendar-day-${item.dateString}`}
                onClick={() => handleDayClick(item)}
                className={`group relative h-9 w-9 mx-auto flex flex-col items-center justify-center rounded-lg text-sm transition-all ${
                  item.isSelected
                    ? 'bg-emerald-600 text-white font-bold shadow-sm'
                    : isCurrentMonth
                    ? 'text-neutral-800 hover:bg-neutral-100 font-medium'
                    : 'text-neutral-300 hover:text-neutral-500 hover:bg-neutral-50'
                }`}
              >
                <span>{item.dayNumber}</span>
                {/* Plan Indicator Dot (as seen in frame 10) */}
                {item.hasPlan && (
                  <span
                    className={`absolute bottom-1 w-1 h-1 rounded-full ${
                      item.isSelected ? 'bg-white' : 'bg-emerald-600'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Days List Footer */}
        <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{t('plannedDaysCount', { count: days.length })}</span>
          </div>
          <button
            id="calendar-add-day-btn"
            onClick={() => {
              const lastDay = days[days.length - 1];
              const nextDate = new Date(lastDay ? lastDay.date : '2026-07-06');
              nextDate.setDate(nextDate.getDate() + 1);
              const nextStr = nextDate.toISOString().split('T')[0];
              onAddNewDay(nextStr);
              onClose();
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-white border border-neutral-200 hover:border-neutral-300 rounded-md text-neutral-700 font-medium shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('addDay')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
