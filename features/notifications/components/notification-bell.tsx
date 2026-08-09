"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Bell, CheckCheck } from "lucide-react";
import { NotificationItem } from "./notification-item";

interface Notification {
  id: string;
  title: string;
  content: string;
  type: "post" | "member" | "event" | "activity" | "announcement";
  isRead: boolean;
  createdAt: string;
}

interface NotificationBellProps {
  notifications?: Notification[];
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
}

export function NotificationBell({
  notifications = [],
  onMarkRead,
  onMarkAllRead,
}: NotificationBellProps) {
  const t = useTranslations("notifications");
  const [isOpen, setIsOpen] = useState(false);
  const [hasRealtime, setHasRealtime] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 rounded-[20px] bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-300"
      >
        <Bell className="w-5 h-5 text-white" strokeWidth={1.5} />

        {/* Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full bg-red-500 flex items-center justify-center px-1"
            >
              <span className="text-xs font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Realtime indicator */}
        {hasRealtime && (
          <motion.div
            className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-black"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute right-0 top-full mt-3 w-[calc(100vw-2rem)] max-w-[380px] max-h-[500px] overflow-hidden rounded-[20px] bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-base font-bold text-white">
                {t("notifications")}
              </h3>
              {unreadCount > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onMarkAllRead}
                  className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors px-3 py-1.5 rounded-full bg-white/10"
                >
                  <CheckCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {t("markAllRead")}
                </motion.button>
              )}
            </div>

            {/* List */}
            <div className="overflow-y-auto max-h-[420px] p-2 space-y-1">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-white/50 text-sm">
                  {t("noNotifications")}
                </div>
              ) : (
                notifications.map((notification, index) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    index={index}
                    onClick={() => {
                      onMarkRead?.(notification.id);
                      setIsOpen(false);
                    }}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
