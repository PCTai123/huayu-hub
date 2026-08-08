'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, CheckCircle, BadgeCheck, Pencil, Hand } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useMemberStore } from '@/lib/member-service';
import { getActivities } from '@/lib/activity-store';

interface UserProfile {
  name: string;
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
          avatar: p.avatar,
          position: p.position || 'Super Admin',
        };
      }
    } catch (e) {
      // ignore
    }
  }
  return { name: 'Admin User', position: 'Super Admin' };
}

interface HeroBannerProps {
  isAdmin?: boolean;
}

export default function HeroBanner({
  isAdmin = false,
}: HeroBannerProps) {
  const t = useTranslations('dashboard.hero');
  const locale = useLocale();
  const router = useRouter();
  const { members } = useMemberStore();
  const [activitiesCount, setActivitiesCount] = useState(12);
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: 'Admin User', position: 'Super Admin' });

  useEffect(() => {
    setActivitiesCount(getActivities().length);
    setUserProfile(loadUserProfile());
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-[20px] p-6 md:p-8"
      style={{
        background: 'linear-gradient(135deg, #F6F1E8 0%, #E8D5A3 50%, #D4B896 100%)',
      }}
    >
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/4" />

      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Left: User Avatar + Hi Name */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg bg-gray-100"
            >
              {userProfile.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#C62828', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                  {userProfile.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center">
              <BadgeCheck size={16} className="text-[#C62828]" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1
                className="text-2xl md:text-3xl font-bold text-black"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Hi, {userProfile.name}
              </h1>
              <Hand className="w-6 h-6 text-amber-500" />
            </div>
            <p className="text-sm md:text-base text-gray-700 mt-1">
              {userProfile.position}
            </p>
          </div>
        </div>

        {/* Right: Stats */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-white/40">
              <Users size={20} strokeWidth={1.5} className="text-[#C62828]" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-black">{members.length}</p>
              <p className="text-xs text-gray-600">{t('members')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-white/40">
              <Calendar size={20} strokeWidth={1.5} className="text-[#C62828]" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-black">{activitiesCount}</p>
              <p className="text-xs text-gray-600">{t('events')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-white/40">
              <CheckCircle size={20} strokeWidth={1.5} className="text-[#C62828]" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-black">{activitiesCount}</p>
              <p className="text-xs text-gray-600">{t('tasks')}</p>
            </div>
          </div>

          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(`/${locale}/profile`)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: '#C62828' }}
            >
              <Pencil size={16} strokeWidth={1.5} />
              {t('edit_profile')}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
