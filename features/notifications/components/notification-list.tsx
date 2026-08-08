"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { NotificationItem } from "./notification-item";
import { CheckCheck, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  title: string;
  content: string;
  type: "post" | "member" | "event" | "activity" | "announcement";
  isRead: boolean;
  createdAt: string;
}

interface NotificationListProps {
  notifications?: Notification[];
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
}

export function NotificationList({
  notifications = [],
  onMarkRead,
  onMarkAllRead,
}: NotificationListProps) {
  const t = useTranslations("notifications");

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-[20px] bg-white/10 backdrop-blur-md border border-white/20 shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-[16px] bg-white/10">
            <Bell className="w-5 h-5 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{t("allNotifications")}</h2>
            <p className="text-sm text-white/60">
              {unreadCount > 0
                ? t("unreadCount", { count: unreadCount })
                : t("allRead")}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <Button
            onClick={onMarkAllRead}
            className="rounded-[20px] bg-white/20 backdrop-blur-md border border-white/20 text-white hover:bg-white/30 shadow-lg transition-all duration-300"
          >
            <CheckCheck className="w-4 h-4 mr-2" strokeWidth={1.5} />
            {t("markAllRead")}
          </Button>
        )}
      </div>

      {/* List */}
      <div className="p-4 space-y-2">
        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Bell className="w-12 h-12 text-white/20 mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-white/50">{t("noNotifications")}</p>
          </motion.div>
        ) : (
          notifications.map((notification, index) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              index={index}
              onClick={() => onMarkRead?.(notification.id)}
            />
          ))
        )}
      </div>
    </motion.div>
  );
}
