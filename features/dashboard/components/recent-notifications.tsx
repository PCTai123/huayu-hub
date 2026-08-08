'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserPlus, FileText, CalendarDays, Megaphone, CheckCircle, Cake, ClipboardList
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  getNotifications,
  subscribeToNotifications,
  type NotificationItem
} from '@/lib/announcement-store';
import { checkAndCreateBirthdayNotifications, getSupabaseNotifications } from '@/lib/birthday-service';

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
function detectType(notif: NotificationItem): string {
  const text = (notif.title + ' ' + notif.message).toLowerCase();
  if (text.includes('sinh nhat') || text.includes('birthday')) return 'birthday';
  if (text.includes('task') || text.includes('nhiem vu')) return 'task';
  if (text.includes('post') || text.includes('bai viet')) return 'post';
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
    const fetchAndMerge = async () => {
      /* Get local notifications (same source as Topbar) */
      const localNotifs = getNotifications();

      /* Also check and create birthday notifications */
      try {
        await checkAndCreateBirthdayNotifications();
      } catch {}

      /* Get Supabase notifications (birthday reminders, task notifications) */
      let supabaseNotifs: any[] = [];
      try {
        supabaseNotifs = await getSupabaseNotifications();
      } catch {}

      /* Merge: Supabase first (if not duplicate), then local */
      const localIds = new Set(localNotifs.map((n) => n.id));
      const merged: DisplayNotification[] = [
        ...supabaseNotifs
          .filter((n: any) => !localIds.has(n.id))
          .map((n: any) => ({
            id: n.id,
            type: detectType(n),
            title: n.title,
            time: n.time,
            unread: n.unread,
            route: '/calendar',
          })),
        ...localNotifs.map((n) => ({
          id: n.id,
          type: detectType(n),
          title: n.title,
          time: n.time,
          unread: n.unread,
          route: '/announcements',
        })),
      ];

      setNotifications(merged.slice(0, 8));
    };

    fetchAndMerge();

    /* Subscribe to notification changes (syncs with Topbar) */
    const unsub = subscribeToNotifications(() => {
      fetchAndMerge();
    });

    /* Re-check every 5 minutes for new birthday/task notifications */
    const interval = setInterval(fetchAndMerge, 5 * 60 * 1000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="rounded-[20px] bg-white p-5 shadow-sm border border-gray-100/50">
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-lg font-semibold text-gray-900"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
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
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${color}12` }}
                >
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
