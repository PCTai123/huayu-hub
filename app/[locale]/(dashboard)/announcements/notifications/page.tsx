"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { NotificationList } from "@/features/notifications/components/notification-list";
import { Bell } from "lucide-react";

const mockNotifications = [
  {
    id: "1",
    title: "New post in General",
    content: "John posted a new update about the upcoming event.",
    type: "post" as const,
    isRead: false,
    createdAt: "5 minutes ago",
  },
  {
    id: "2",
    title: "New member joined",
    content: "Jane Doe has joined the team.",
    type: "member" as const,
    isRead: false,
    createdAt: "1 hour ago",
  },
  {
    id: "3",
    title: "Event reminder",
    content: "Team meeting tomorrow at 10 AM.",
    type: "event" as const,
    isRead: true,
    createdAt: "3 hours ago",
  },
  {
    id: "4",
    title: "Activity completed",
    content: "The project milestone has been completed.",
    type: "activity" as const,
    isRead: true,
    createdAt: "1 day ago",
  },
  {
    id: "5",
    title: "New announcement",
    content: "Important update regarding company policies.",
    type: "announcement" as const,
    isRead: false,
    createdAt: "2 days ago",
  },
];

export default function NotificationsPage() {
  const t = useTranslations("notifications");
  const [notifications, setNotifications] = useState(mockNotifications);

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-4"
      >
        <div className="p-3 rounded-[20px] bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
          <Bell className="w-8 h-8 text-white" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">{t("title")}</h1>
          <p className="text-white/60 mt-1">{t("subtitle")}</p>
        </div>
      </motion.div>

      {/* Notification List */}
      <NotificationList
        notifications={notifications}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
      />
    </div>
  );
}
