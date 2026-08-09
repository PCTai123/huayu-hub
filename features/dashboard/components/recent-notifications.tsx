'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserPlus, FileText, CalendarDays, Megaphone, CheckCircle, Cake, ClipboardList
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { fetchNotificationsFromSupabase, subscribeToNotifications } from '@/lib/announcement-store';
import { checkAndCreateBirthdayNotifications } from '@/lib/birthday-service';

const iconMap: Record<string, React.ElementType> = {
  member: UserPlus,
  post: FileText,
  event: CalendarDays,
  announcement: Megaphone,
  task: CheckCircle,
  birthday: Cake,
  task_assigned: ClipboardList,
};

const colorMap: Record<string, string> = {
  member: '#4A7C59',
  post: '#2E6B8A',
  event: '#D4A843',
  announcement: '#C62828',
  task: '#6B5B95',
  birthday: '#F59E0B',
  task_assigned: '#C62828',
};

/* Detect notification type from title/message content */
function detectType(title: string, message: string): string {
  const text = (title + ' ' + message).toLowerCase();
  if (text.includes('sinh nhat') || text.includes('birthday')) return 'birthday';
  if (text.includes('task') || text.includes('nhiem vu')) return 'task';
  if (text.includes('bai viet') || text.includes('post')) return 'post';
  if (text.includes('event') || text.includes('hoat dong')) return 'event';
  if (text.includes('member') || text.includes('thanh vien')) return 'member';
  return 'announcement';
}

interface DisplayNotification {
  id: string;
  type: string;
  title: string;
  time: string;
  unread: boolean;
  route: string;
}

export default function RecentNotifications() {
  const t = useTranslations('dashboard.notifications');
  const locale = useLocale();
  const router = useRouter();
  const [notifications, setNotifications] = useState<DisplayNotification[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        await checkAndCreateBirthdayNotifications();
      } catch {}

      const notifs = await fetchNotificationsFromSupabase();
      const mapped: DisplayNotification[] = notifs.slice(0, 8).map((n) => {
        const type = detectType(n.title, n.message);
        return {
          id: n.id,
          type,
          title: n.title,
          time: n.time,
          unread: n.unread,
          route: type === 'post' ? '/news' : type === 'birthday' ? '/calendar' : '/announcements',
        };
      });
      setNotifications(mapped);
    };

    load();

    /* Subscribe + poll every 5 min */
    const unsub = subscribeToNotifications(() => load());
    const interval = setInterval(load, 5 * 60 * 1000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="rounded-[20px] bg-white p-5 shadow-sm border border-gray-100/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {t('title')}
        </h3>
        <button
          onClick={() => router.push(`/${locale}/announcements`)}
          className="text-xs font-medium text-[#C62828] hover:underline"
        >
          {t('view_all')}
        </button>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Chua co thong bao</p>
        ) : (
          notifications.map((notification, index) => {
            const Icon = iconMap[notification.type] || Megaphone;
            const color = colorMap[notification.type] || '#C62828';

            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
                whileHover={{ x: 2 }}
                onClick={() => router.push(`/${locale}${notification.route}`)}
                className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  notification.unread ? 'bg-[#C62828]/5' : 'hover:bg-gray-50'
                }`}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}12` }}>
                  <Icon size={18} strokeWidth={1.5} style={{ color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-800 leading-snug truncate">{notification.title}</p>
                    {notification.unread && (
                      <span className="w-2 h-2 rounded-full bg-[#C62828] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
