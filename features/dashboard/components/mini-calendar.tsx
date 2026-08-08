'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getTasks } from '@/lib/task-service';
import { getBirthdayEvents } from '@/lib/birthday-service';
import { getActivities } from '@/lib/activity-store';

interface CalendarEventDate {
  day: number;
  month: number;
  year: number;
}

export default function MiniCalendar() {
  const t = useTranslations('dashboard.calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [direction, setDirection] = useState(0);
  const [eventDays, setEventDays] = useState<Set<number>>(new Set());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  /* Fetch real event data: tasks, birthdays, activities */
  useEffect(() => {
    const fetchEvents = async () => {
      const days = new Set<number>();

      /* Tasks by due_date */
      try {
        const tasks = await getTasks();
        tasks.forEach((task) => {
          const d = new Date(task.due_date);
          if (d.getMonth() === month && d.getFullYear() === year) {
            days.add(d.getDate());
          }
        });
      } catch {}

      /* Birthdays by event_date */
      try {
        const birthdays = await getBirthdayEvents();
        birthdays.forEach((b) => {
          const d = new Date(b.event_date);
          if (d.getMonth() === month && d.getFullYear() === year) {
            days.add(d.getDate());
          }
        });
      } catch {}

      /* Activities by date */
      try {
        const activities = getActivities();
        activities.forEach((a) => {
          const parts = a.date.split('-').map(Number);
          if (parts.length >= 3 && parts[1] - 1 === month && parts[0] === year) {
            days.add(parts[2]);
          }
        });
      } catch {}

      setEventDays(days);
    };

    fetchEvents();
  }, [month, year]);

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const handlePrevMonth = () => {
    setDirection(-1);
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setDirection(1);
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const renderDays = () => {
    const days: React.ReactNode[] = [];

    /* Previous month days */
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push(
        <div key={`prev-${i}`} className="h-9 flex items-center justify-center text-sm text-gray-300">
          {daysInPrevMonth - i}
        </div>
      );
    }

    /* Current month days */
    for (let day = 1; day <= daysInMonth; day++) {
      const hasEvent = eventDays.has(day);
      const todayCheck = isToday(day);

      days.push(
        <motion.div
          key={day}
          whileHover={{ scale: 1.1 }}
          className={`relative h-9 flex items-center justify-center text-sm font-medium rounded-lg cursor-pointer transition-colors ${
            todayCheck
              ? 'bg-[#C62828] text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {day}
          {hasEvent && !todayCheck && (
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C62828]" />
          )}
        </motion.div>
      );
    }

    /* Next month days */
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push(
        <div key={`next-${i}`} className="h-9 flex items-center justify-center text-sm text-gray-300">
          {i}
        </div>
      );
    }

    return days;
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -50 : 50,
      opacity: 0,
    }),
  };

  return (
    <div className="rounded-[20px] bg-white p-5 shadow-sm border border-gray-100/50">
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-lg font-semibold text-gray-900"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          {t('title')}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={18} className="text-gray-500" />
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight size={18} className="text-gray-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-xs font-medium text-gray-400 uppercase"
          >
            {day}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={`${year}-${month}`}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2 }}
          className="grid grid-cols-7 gap-1"
        >
          {renderDays()}
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#C62828]" />
          <span>{t('has_event')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#C62828]" />
          <span>{t('today')}</span>
        </div>
      </div>
    </div>
  );
}
