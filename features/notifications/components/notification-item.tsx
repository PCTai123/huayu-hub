"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  FileText,
  User,
  Calendar,
  Activity,
  Megaphone,
  Clock,
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  content: string;
  type: "post" | "member" | "event" | "activity" | "announcement";
  isRead: boolean;
  createdAt: string;
}

interface NotificationItemProps {
  notification: Notification;
  index?: number;
  onClick?: () => void;
}

export function NotificationItem({
  notification,
  index = 0,
  onClick,
}: NotificationItemProps) {
  const t = useTranslations("notifications");

  const getTypeIcon = (type: Notification["type"]) => {
    switch (type) {
      case "post":
        return <FileText className="w-4 h-4" strokeWidth={1.5} />;
      case "member":
        return <User className="w-4 h-4" strokeWidth={1.5} />;
      case "event":
        return <Calendar className="w-4 h-4" strokeWidth={1.5} />;
      case "activity":
        return <Activity className="w-4 h-4" strokeWidth={1.5} />;
      case "announcement":
        return <Megaphone className="w-4 h-4" strokeWidth={1.5} />;
    }
  };

  const getTypeColor = (type: Notification["type"]) => {
    switch (type) {
      case "post":
        return "bg-blue-500/20 text-blue-300";
      case "member":
        return "bg-green-500/20 text-green-300";
      case "event":
        return "bg-purple-500/20 text-purple-300";
      case "activity":
        return "bg-orange-500/20 text-orange-300";
      case "announcement":
        return "bg-red-500/20 text-red-300";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ x: 4 }}
      onClick={onClick}
      className={`relative flex items-start gap-3 p-3 rounded-[16px] cursor-pointer transition-all duration-200 ${
        notification.isRead
          ? "bg-white/5 hover:bg-white/10"
          : "bg-white/10 hover:bg-white/15 border border-white/10"
      }`}
    >
      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-400" />
      )}

      {/* Icon */}
      <div
        className={`p-2 rounded-xl shrink-0 ${getTypeColor(notification.type)}`}
      >
        {getTypeIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-white truncate">
          {notification.title}
        </h4>
        <p className="text-xs text-white/70 line-clamp-2 mt-0.5">
          {notification.content}
        </p>
        <div className="flex items-center gap-1 mt-1.5 text-xs text-white/50">
          <Clock className="w-3 h-3" strokeWidth={1.5} />
          <span>{notification.createdAt}</span>
        </div>
      </div>
    </motion.div>
  );
}
