'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, ClipboardList, Megaphone, UserPlus, CalendarPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

interface QuickAction {
  label: string;
  icon: React.ElementType;
  color: string;
  href: string;
}

const actions: QuickAction[] = [
  { label: 'create_task', icon: ClipboardList, color: '#C62828', href: '/calendar' },
  { label: 'post_announcement', icon: Megaphone, color: '#D4A843', href: '/announcements' },
  { label: 'add_member', icon: UserPlus, color: '#4A7C59', href: '/org-chart' },
  { label: 'create_activity', icon: CalendarPlus, color: '#2E6B8A', href: '/activities' },
];

export default function QuickActions() {
  const t = useTranslations('dashboard.quick_actions');
  const router = useRouter();

  const handleAction = (href: string, label: string) => {
    // Navigate to the page with create action
    const createParam = label === 'post_announcement' ? '?create=true' : '';
    router.push(href + createParam);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map((action, index) => {
        const Icon = action.icon;

        return (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAction(action.href, action.label)}
            className="flex items-center gap-3 px-4 py-3.5 rounded-[18px] text-left transition-colors"
            style={{
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${action.color}15` }}
            >
              <Plus size={18} strokeWidth={1.5} style={{ color: action.color }} />
            </div>
            <span className="text-sm font-medium text-gray-800 leading-tight">
              {t(action.label)}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
