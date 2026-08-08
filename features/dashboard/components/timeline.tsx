'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserPlus, FileText, CalendarDays, CheckCircle, MessageSquare, Megaphone, Heart, ClipboardList
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  getRecentActivities,
  subscribeToActivityLog,
  formatRelativeTime,
  getActivityColor,
  type MemberActivity,
  type ActivityType
} from '@/lib/activity-log';
import { getNotifications } from '@/lib/announcement-store';
import { getPosts } from '@/lib/news-feed-store';
import { getActivities } from '@/lib/activity-store';

const iconMap: Record<ActivityType, React.ElementType> = {
  register: UserPlus,
  post: FileText,
  comment: MessageSquare,
  like: Heart,
  join_activity: CalendarDays,
  task_assigned: ClipboardList,
  task_completed: CheckCircle,
  announcement: Megaphone,
};

interface TimelineItem {
  id: string;
  type: ActivityType;
  title: string;
  time: string;
  route: string;
}

export default function Timeline() {
  const t = useTranslations('dashboard.timeline');
  const locale = useLocale();
  const router = useRouter();
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);

  useEffect(() => {
    const updateTimeline = () => {
      /* Get recent member activities from activity log */
      const memberActivities = getRecentActivities(8);

      /* Also collect recent announcements, posts, and activities as timeline events */
      const announcements = getNotifications().slice(0, 3).map((n) => ({
        id: `notif-${n.id}`,
        type: 'announcement' as ActivityType,
        title: n.title,
        time: n.time,
        route: '/announcements',
      }));

      const posts = getPosts().slice(0, 3).map((p: any) => ({
        id: `post-${p.id}`,
        type: 'post' as ActivityType,
        title: `${p.author?.name || 'Thanh vien'} dang bai: "${p.title || p.content?.substring(0, 40) || ''}"`,
        time: p.createdAt ? formatRelativeTime(p.createdAt) : '',
        route: '/news',
      }));

      const activities = getActivities().slice(0, 2).map((a: any) => ({
        id: `act-${a.id}`,
        type: 'join_activity' as ActivityType,
        title: `Hoat dong: ${a.name}`,
        time: a.date || '',
        route: '/calendar',
      }));

      /* Convert member activities to timeline format */
      const memberTimeline: TimelineItem[] = memberActivities.map((ma: MemberActivity) => ({
        id: ma.id,
        type: ma.type,
        title: ma.title,
        time: formatRelativeTime(ma.timestamp),
        route: ma.route,
      }));

      /* Merge all, sort by recency (member activities first since they have timestamps) */
      const all = [...memberTimeline, ...announcements, ...posts, ...activities];
      setTimelineItems(all.slice(0, 8));
    };

    updateTimeline();
    const unsub = subscribeToActivityLog(updateTimeline);
    return unsub;
  }, []);

  return (
    <div className="rounded-[20px] bg-white p-5 shadow-sm border border-gray-100/50">
      <h3
        className="text-lg font-semibold text-gray-900 mb-4"
        style={{ fontFamily: 'Poppins, sans-serif' }}
      >
        {t('title')}
      </h3>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gray-200" />

        <div className="space-y-4">
          {timelineItems.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Chua co hoat dong gan day</p>
          ) : (
            timelineItems.map((activity, index) => {
              const Icon = iconMap[activity.type] || CheckCircle;
              const color = getActivityColor(activity.type);

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.08 }}
                  className="flex items-start gap-3 relative cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors"
                  onClick={() => router.push(`/${locale}${activity.route}`)}
                >
                  <div
                    className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow-sm"
                    style={{ backgroundColor: `${color}12` }}
                  >
                    <Icon size={18} strokeWidth={1.5} style={{ color }} />
                  </div>

                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-sm text-gray-800 leading-snug">{activity.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
