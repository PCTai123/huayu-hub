"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Clock, CalendarDays, Activity, AlertCircle, Cake, MapPin, ClipboardList } from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  type: "activity" | "deadline" | "birthday" | "task";
  time?: string;
  date?: Date | string;
  description?: string;
  location?: string;
}

interface CalendarEventCardProps {
  event: CalendarEvent;
  index?: number;
  onClick?: (event: CalendarEvent) => void;
}

function formatDateDisplay(date: Date | string | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function CalendarEventCard({
  event,
  index = 0,
  onClick,
}: CalendarEventCardProps) {
  const t = useTranslations("calendar");

  const getTypeConfig = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "activity":
        return {
          icon: <Activity className="w-4 h-4 strokeWidth={1.5}" />,
          bg: "bg-blue-100",
          text: "text-blue-700",
          border: "border-blue-200",
          badge: "bg-blue-100 text-blue-700 border border-blue-200",
        };
      case "deadline":
        return {
          icon: <AlertCircle className="w-4 h-4 strokeWidth={1.5}" />,
          bg: "bg-red-100",
          text: "text-red-700",
          border: "border-red-200",
          badge: "bg-red-100 text-red-700 border border-red-200",
        };
      case "birthday":
        return {
          icon: <Cake className="w-4 h-4 strokeWidth={1.5}" />,
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          border: "border-yellow-200",
          badge: "bg-yellow-100 text-yellow-700 border border-yellow-200",
        };
      case "task":
        return {
          icon: <ClipboardList className="w-4 h-4 strokeWidth={1.5}" />,
          bg: "bg-red-100",
          text: "text-[#C62828]",
          border: "border-red-200",
          badge: "bg-[#C62828]/10 text-[#C62828] border border-[#C62828]/20",
        };
    }
  };

  const config = getTypeConfig(event.type);
  const formattedDate = formatDateDisplay(event.date);
  const isAllDay = !event.time || event.time === "All day";
  const leftColumnLabel = isAllDay ? formattedDate : event.time;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, x: 5 }}
      onClick={() => onClick?.(event)}
      className={`relative overflow-hidden rounded-[16px] bg-white border border-gray-300 shadow-sm p-4 cursor-pointer hover:shadow-md transition-all duration-300`}
    >
      <div className="flex items-start gap-4">
        {/* Time/Date Column */}
        <div className="flex flex-col items-center min-w-[64px]">
          <div className={`p-2 rounded-xl ${config.bg}`}>
            {isAllDay ? (
              <CalendarDays className={`w-4 h-4 ${config.text}`} strokeWidth={1.5} />
            ) : (
              <Clock className={`w-4 h-4 ${config.text}`} strokeWidth={1.5} />
            )}
          </div>
          <span className="text-xs font-medium text-black mt-2 text-center break-words">
            {leftColumnLabel || ""}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.badge}`}>
              {t(event.type)}
            </span>
          </div>

          <h3 className="text-base font-bold text-black mb-1">{event.title}</h3>

          {/* Date row - always show if available */}
          {formattedDate && (
            <p className="text-sm text-gray-600 mb-1">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="w-3 h-3" strokeWidth={1.5} />
                {formattedDate}
              </span>
            </p>
          )}

          {/* Time row - only show if not "All day" */}
          {!isAllDay && event.time && (
            <p className="text-sm text-gray-600 mb-1">
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" strokeWidth={1.5} />
                {event.time}
              </span>
            </p>
          )}

          {event.description && (
            <p className="text-sm text-gray-700 line-clamp-2">
              {event.description}
            </p>
          )}

          {event.location && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-600">
              <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>{event.location}</span>
            </div>
          )}
        </div>

        {/* Type Icon */}
        <div className={`p-2 rounded-xl ${config.bg}`}>
          <div className={config.text}>{config.icon}</div>
        </div>
      </div>
    </motion.div>
  );
}
