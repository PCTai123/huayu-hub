'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckSquare, Calendar, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { getActivities } from '@/lib/activity-store';
import { useMemberStore } from '@/lib/member-service';
import { getPosts } from '@/lib/news-feed-store';
import { getTasks } from '@/lib/task-service';
import { getBirthdayEvents } from '@/lib/birthday-service';

export default function StatCards() {
  const t = useTranslations('dashboard.stats');
  const locale = useLocale();
  const router = useRouter();
  const { members } = useMemberStore();
  const [postCount, setPostCount] = useState(0);
  const [activityCount, setActivityCount] = useState(0);
  const [monthTaskCount, setMonthTaskCount] = useState(0);
  const [monthEventCount, setMonthEventCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPostCount(getPosts().length);
    setActivityCount(getActivities().length);

    /* Fetch real task count for current month */
    getTasks().then((tasks) => {
      const now = new Date();
      const month = now.getMonth();
      const year = now.getFullYear();
      const count = tasks.filter((task) => {
        const d = new Date(task.due_date);
        return d.getMonth() === month && d.getFullYear() === year;
      }).length;
      setMonthTaskCount(count);
    }).catch(() => {});

    /* Fetch birthday + activity events for current month */
    getBirthdayEvents().then((birthdays) => {
      const now = new Date();
      const month = now.getMonth();
      const year = now.getFullYear();
      const bdayCount = birthdays.filter((b) => {
        const d = new Date(b.event_date);
        return d.getMonth() === month && d.getFullYear() === year;
      }).length;
      const acts = getActivities();
      const actCount = acts.filter((a) => {
        const parts = a.date.split('-').map(Number);
        if (parts.length < 3) return false;
        return parts[1] - 1 === month && parts[0] === year;
      }).length;
      setMonthEventCount(bdayCount + actCount);
    }).catch(() => {});
  }, []);

  const stats: { label: string; value: number; change: number; icon: React.ElementType; route: string }[] = [
    { label: 'total_members', value: members.length, change: 12, icon: Users, route: 'members' },
    { label: 'active_tasks', value: monthTaskCount, change: -5, icon: CheckSquare, route: 'calendar' },
    { label: 'month_events', value: monthEventCount, change: 3, icon: Calendar, route: 'calendar' },
    { label: 'new_posts', value: postCount, change: 24, icon: FileText, route: 'news' },
  ];

  if (!mounted) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="relative p-5 rounded-[20px] bg-white shadow-sm border border-gray-100/50">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-gray-100">
                <Users size={22} strokeWidth={1.5} className="text-gray-300" />
              </div>
              <div className="h-5 w-12 bg-gray-100 rounded-lg" />
            </div>
            <div className="h-8 w-12 bg-gray-100 rounded" />
            <div className="h-4 w-24 bg-gray-100 rounded mt-1" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const isPositive = stat.change >= 0;

        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="relative p-5 rounded-[20px] bg-white shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-200 cursor-pointer"
            onClick={() => router.push(`/${locale}/${stat.route}`)}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="p-2.5 rounded-xl"
                style={{ backgroundColor: 'rgba(198, 40, 40, 0.08)' }}
              >
                <Icon size={22} strokeWidth={1.5} className="text-[#C62828]" />
              </div>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                  isPositive
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {isPositive ? (
                  <TrendingUp size={12} />
                ) : (
                  <TrendingDown size={12} />
                )}
                <span>{isPositive ? '+' : ''}{stat.change}%</span>
              </div>
            </div>

            <p className="text-2xl md:text-3xl font-bold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {stat.value}
            </p>
            <p className="text-sm text-gray-500 mt-1">{t(stat.label)}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
