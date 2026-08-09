'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Newspaper,
  CalendarDays,
  Network,
  Users,
  Megaphone,
  FolderOpen,
  Building2,
  ChevronLeft,
  ChevronRight,
  Activity,
  ClipboardList,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

const menuItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Organization Info', href: '/organization', icon: Building2 },
  { label: 'Org Chart', href: '/org-chart', icon: Network },
  { label: 'News Feed', href: '/news', icon: Newspaper },
  { label: 'Activities', href: '/activities', icon: Activity },
  { label: 'Announcements', href: '/announcements', icon: Megaphone },
  { label: 'Documents', href: '/documents', icon: FolderOpen },
  { label: 'Tasks', href: '/tasks', icon: ClipboardList },
  { label: 'Calendar', href: '/calendar', icon: CalendarDays },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ isOpen, onToggle, mobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations('sidebar');
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => {
      setIsMobile(typeof window !== 'undefined' && window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (mobileOpen && onCloseMobile) {
      onCloseMobile();
    }
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggle = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      if (onCloseMobile) {
        onCloseMobile();
      }
    } else {
      onToggle();
    }
  }, [onToggle, onCloseMobile]);

  const desktopWidth = isOpen ? 260 : 64;
  const sidebarWidth = isMounted && isMobile ? (mobileOpen ? 260 : 0) : desktopWidth;
  const showFull = isOpen || mobileOpen;

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={onCloseMobile}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarWidth,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed top-0 left-0 h-screen z-50 flex flex-col overflow-hidden"
        style={{ backgroundColor: '#F6F1E8' }}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-[#C62828]/10 shrink-0">
          <AnimatePresence mode="wait">
            {showFull ? (
              <motion.div
                key="full-logo"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: '#C62828', fontFamily: 'Poppins, sans-serif' }}
                >
                  H
                </div>
                <span
                  className="text-lg font-semibold tracking-tight"
                  style={{ color: '#C62828', fontFamily: 'Poppins, sans-serif' }}
                >
                  Huayu Hub
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="mini-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold mx-auto"
                style={{ backgroundColor: '#C62828', fontFamily: 'Poppins, sans-serif' }}
              >
                H
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Toggle button (desktop only) */}
        <button
          onClick={handleToggle}
          className="absolute top-24 -right-3 w-7 h-7 rounded-full bg-white shadow-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:text-[#C62828] hover:border-[#C62828] transition-all duration-200 z-50 hidden md:flex"
          aria-label={isOpen ? t('collapse') : t('expand')}
        >
          {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`));

            return (
              <Link key={item.href} href={item.href} className="group block relative">
                <motion.div
                  whileHover={{ x: 2 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-[#C62828]/10 text-[#C62828]'
                      : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
                  }`}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                      style={{ backgroundColor: '#C62828' }}
                    />
                  )}

                  <Icon
                    size={20}
                    strokeWidth={1.5}
                    className="shrink-0"
                  />

                  <AnimatePresence mode="wait">
                    {showFull && (
                      <motion.span
                        key={item.label}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.2 }}
                        className="text-sm font-medium whitespace-nowrap"
                      >
                        {t(item.label.toLowerCase().replace(/\s+/g, '_'))}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="shrink-0 p-4 border-t border-[#C62828]/10">
          <AnimatePresence mode="wait">
            {showFull ? (
              <motion.div
                key="bottom-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-1"
              >
                <p className="text-xs font-semibold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Huayu Hub
                </p>
                <p className="text-[10px] text-gray-500 leading-tight">
                  {t('slogan')}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="bottom-mini"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-6 h-6 rounded-full mx-auto"
                style={{ backgroundColor: '#C62828' }}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </>
  );
}
