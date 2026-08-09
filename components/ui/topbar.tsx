'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Bell,
  ChevronDown,
  Check,
  Globe,
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { getNotifications, getUnreadCount, markAllNotificationsAsRead, subscribeToNotifications, type NotificationItem } from '@/lib/announcement-store';
import { useAuthContext } from '@/features/auth/providers/auth-provider';
import { checkAndCreateBirthdayNotifications, getSupabaseNotifications } from '@/lib/birthday-service';

interface TopbarProps {
  onMenuToggle: () => void;
}

const languages = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  position?: string;
}

function loadUserProfile(): UserProfile {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('huayu-hub-profile');
      if (saved) {
        const p = JSON.parse(saved);
        return {
          name: p.name || 'Admin User',
          email: p.email || 'admin@huayuhub.com',
          avatar: p.avatar,
          position: p.position || 'Super Admin',
        };
      }
    } catch (e) {
      // ignore
    }
  }
  return { name: 'Admin User', email: 'admin@huayuhub.com', position: 'Super Admin' };
}

export default function Topbar({ onMenuToggle }: TopbarProps) {
  const t = useTranslations('topbar');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuthContext();
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: 'Admin User', email: 'admin@huayuhub.com', position: 'Super Admin' });
  const [notificationList, setNotificationList] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const langRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUserProfile(loadUserProfile());
    setNotificationList(getNotifications());
    setUnreadCount(getUnreadCount());

    const unsubAnnouncements = subscribeToNotifications(() => {
      setNotificationList(getNotifications());
      setUnreadCount(getUnreadCount());
    });

    // Check for upcoming birthday notifications (7 days, 1 day before)
    // and merge Supabase notifications with local store
    const checkBirthdays = async () => {
      try {
        await checkAndCreateBirthdayNotifications();
        const supabaseNotifs = await getSupabaseNotifications();
        if (supabaseNotifs.length > 0) {
          // Merge Supabase notifications with local ones (avoid duplicates)
          const localNotifs = getNotifications();
          const localIds = new Set(localNotifs.map((n) => n.id));
          const merged = [
            ...supabaseNotifs.filter((n: any) => !localIds.has(n.id)),
            ...localNotifs,
          ];
          setNotificationList(merged);
          setUnreadCount(merged.filter((n: any) => n.unread).length);
        }
      } catch (e) {
        // Silently fail - birthday check is non-critical
      }
    };

    checkBirthdays();
    // Re-check every 30 minutes
    const interval = setInterval(checkBirthdays, 30 * 60 * 1000);

    return () => {
      unsubAnnouncements();
      clearInterval(interval);
    };
  }, []);

  const handleNotifClick = () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen) {
      // When opening dropdown, mark all as read
      markAllNotificationsAsRead();
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${langCode}`);
    router.push(newPath);
    setLangOpen(false);
  };

  return (
    <header
      className="fixed top-0 right-0 left-0 z-30 h-16 flex items-center justify-between px-4 md:px-6"
      style={{
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Left: Hamburger */}
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-xl hover:bg-white/50 transition-colors"
          aria-label={t('toggle_menu')}
        >
          <Menu size={22} strokeWidth={1.5} className="text-gray-700" />
        </button>
      </div>

      {/* Right: Language + Notifications + User */}
      <div className="flex items-center gap-2">
        {/* Language Switcher */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-white/50 transition-colors"
          >
            <Globe size={18} strokeWidth={1.5} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700 uppercase hidden sm:inline">
              {locale}
            </span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          <AnimatePresence>
            {langOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-44 rounded-xl overflow-hidden shadow-lg border border-white/30"
                style={{
                  backdropFilter: 'blur(12px)',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                }}
              >
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[#C62828]/5 transition-colors ${
                      locale === lang.code ? 'text-[#C62828] font-medium' : 'text-gray-700'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                    {locale === lang.code && <Check size={14} className="ml-auto" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleNotifClick}
            className="relative p-2 rounded-xl hover:bg-white/50 transition-colors"
          >
            <Bell size={20} strokeWidth={1.5} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#C62828] text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-xl overflow-hidden shadow-lg border border-white/30 bg-white"
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-800">{t('notifications')}</h3>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notificationList.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-gray-400">
                      {t('noNotifications') || 'Không có thông báo mới'}
                    </div>
                  ) : (
                    notificationList.map((notif) => (
                      <div
                        key={notif.id}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-[#C62828]/5 transition-colors cursor-pointer border-b border-gray-100"
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            notif.unread ? 'bg-[#C62828]' : 'bg-gray-300'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 truncate">{notif.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{notif.message}</p>
                          <p className="text-xs text-gray-300 mt-0.5">{notif.time}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserOpen(!userOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-white/50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#C62828] to-[#C62828]/70 text-white text-sm font-medium">
              {userProfile.avatar ? (
                <img src={userProfile.avatar} alt={userProfile.name} className="w-full h-full object-cover" />
              ) : (
                <span>{userProfile.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-800 leading-tight">{userProfile.name}</p>
              <p className="text-xs text-gray-400 leading-tight">{userProfile.position || 'Super Admin'}</p>
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden md:block" />
          </button>

          <AnimatePresence>
            {userOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-xl overflow-hidden shadow-lg border border-white/30"
                style={{
                  backdropFilter: 'blur(12px)',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                }}
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800">{userProfile.name}</p>
                  <p className="text-xs text-gray-400">{userProfile.email}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => { router.push(`/${locale}/profile`); setUserOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#C62828]/5 transition-colors"
                  >
                    {t('profile')}
                  </button>
                  <button
                    onClick={() => { router.push(`/${locale}/settings`); setUserOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#C62828]/5 transition-colors"
                  >
                    {t('settings')}
                  </button>
                  <button
                    onClick={async () => {
                      setUserOpen(false);
                      try {
                        await logout();
                      } catch {
                        // ignore logout errors
                      }
                      // Clear demo auth cookie
                      document.cookie = 'huayu-hub-demo-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                      router.push(`/${locale}/login`);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#C62828]/5 transition-colors"
                  >
                    {t('logout')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
