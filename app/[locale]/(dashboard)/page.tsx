'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import HeroBanner from '@/features/dashboard/components/hero-banner';
import StatCards from '@/features/dashboard/components/stat-cards';
import QuickActions from '@/features/dashboard/components/quick-actions';
import Timeline from '@/features/dashboard/components/timeline';
import MiniCalendar from '@/features/dashboard/components/mini-calendar';
import RecentNotifications from '@/features/dashboard/components/recent-notifications';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <motion.div
      variants={containerVariants}
      initial={isClient ? 'hidden' : 'visible'}
      animate="visible"
      className="space-y-6"
    >
      {/* Hero Banner */}
      <motion.div variants={itemVariants}>
        <HeroBanner
          isAdmin={true}
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <QuickActions />
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants}>
        <StatCards />
      </motion.div>

      {/* Main Grid: Timeline + Calendar + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline - takes 1 column */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Timeline />
        </motion.div>

        {/* Calendar - takes 1 column */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <MiniCalendar />
        </motion.div>

        {/* Notifications - takes 1 column */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <RecentNotifications />
        </motion.div>
      </div>

      {/* Additional space for future content */}
      <motion.div
        variants={itemVariants}
        className="rounded-[20px] bg-white/50 backdrop-blur-sm p-6 border border-white/20"
      >
        <h3
          className="text-lg font-semibold text-gray-900 mb-2"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          Welcome to Huayu Hub
        </h3>
        <p className="text-sm text-gray-600">
          This is your community dashboard. Use the sidebar to navigate through different
          sections. You can manage members, create events, post announcements, and track
          activities all from here.
        </p>
      </motion.div>
    </motion.div>
  );
}
