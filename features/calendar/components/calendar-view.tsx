"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Cake,
  AlertCircle,
  Activity,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: "activity" | "deadline" | "birthday" | "task";
  task?: {
    id: string;
    assigned_to: string | null;
    team: string;
    status: string;
    priority: string;
    [key: string]: unknown;
  };
  time?: string;
  description?: string;
  person?: {
    name: string;
    age?: number;
    team?: string;
  };
}

interface CalendarViewProps {
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

type ViewMode = "month" | "week" | "day" | "agenda";

export function CalendarView({ events = [], onEventClick }: CalendarViewProps) {
  const t = useTranslations("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Vietnamese timezone
  const vietnameseDate = (date: Date) => {
    return new Date(date.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear()
    );
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Previous month padding
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate]);

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handleDateHover = (date: Date | null, e: React.MouseEvent) => {
    if (date) {
      setHoveredDate(date);
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    } else {
      setHoveredDate(null);
    }
  };

  const getEventColor = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "activity":
        return "bg-blue-500";
      case "deadline":
        return "bg-red-500";
      case "birthday":
        return "bg-yellow-500";
      case "task":
        return "bg-[#C62828]";
    }
  };

  const getEventIcon = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "activity":
        return <Activity className="w-3 h-3 text-blue-400" />;
      case "deadline":
        return <AlertCircle className="w-3 h-3 text-red-400" />;
      case "birthday":
        return <Cake className="w-3 h-3 text-yellow-400" />;
      case "task":
        return <ClipboardList className="w-3 h-3 text-[#C62828]" />;
    }
  };

  const weekDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-[20px] bg-white border border-gray-200 shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b border-gray-200 gap-4 bg-white">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigateMonth(-1)}
            variant="outline"
            className="rounded-[20px] border-gray-300 text-gray-700 hover:bg-gray-100 p-2"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </Button>

          <div className="text-center min-w-[200px]">
            <h2 className="text-xl font-bold text-gray-900">
              {currentDate.toLocaleString("vi-VN", {
                month: "long",
                year: "numeric",
              })}
            </h2>
          </div>

          <Button
            onClick={() => navigateMonth(1)}
            variant="outline"
            className="rounded-[20px] border-gray-300 text-gray-700 hover:bg-gray-100 p-2"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Switch */}
          <div className="flex rounded-[20px] bg-gray-100 border border-gray-200 overflow-hidden">
            {(["month", "week", "day", "agenda"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                  viewMode === mode
                    ? "bg-amber-500 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {t(mode)}
              </button>
            ))}
          </div>

          <Button
            onClick={goToToday}
            className="rounded-[20px] bg-amber-500 text-white hover:bg-amber-600 shadow-lg transition-all duration-300"
          >
            {t("today")}
          </Button>
        </div>
      </div>

      {/* Month View */}
      {viewMode === "month" && (
        <div className="p-6">
          {/* Week Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-bold text-gray-700 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.01 }}
                className={`min-h-[80px] p-2 rounded-xl transition-all duration-200 cursor-pointer border ${
                  date
                    ? isToday(date)
                      ? "bg-amber-50 border-amber-300 ring-2 ring-amber-200"
                      : "bg-white border-gray-100 hover:border-amber-300 hover:bg-amber-50"
                    : "bg-transparent border-transparent"
                }`}
                onClick={() => date && onEventClick?.(getEventsForDate(date)[0])}
                onMouseEnter={(e) =>
                  date && handleDateHover(date, e as unknown as React.MouseEvent)
                }
                onMouseLeave={() => setHoveredDate(null)}
              >
                {date && (
                  <>
                    <span
                      className={`text-sm font-bold ${
                        isToday(date)
                          ? "text-amber-700"
                          : "text-gray-900"
                      }`}
                    >
                      {date.getDate()}
                    </span>

                    {/* Event Dots */}
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {getEventsForDate(date)
                        .slice(0, 3)
                        .map((event, i) => (
                          <motion.div
                            key={event.id}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`w-2 h-2 rounded-full ${getEventColor(
                              event.type
                            )}`}
                          />
                        ))}
                      {getEventsForDate(date).length > 3 && (
                        <span className="text-xs text-white/60">
                          +{getEventsForDate(date).length - 3}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredDate && getEventsForDate(hoveredDate).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed z-50 rounded-[20px] bg-white border border-gray-200 shadow-2xl p-4 min-w-[250px] pointer-events-none"
            style={{
              left: tooltipPosition.x + 20,
              top: tooltipPosition.y - 20,
            }}
          >
            {getEventsForDate(hoveredDate).map((event) => (
              <div key={event.id} className="flex items-start gap-2 mb-2 last:mb-0">
                {getEventIcon(event.type)}
                <div>
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  {event.person && (
                    <p className="text-xs text-gray-600">
                      {event.person.name}
                      {event.person.age !== undefined && ` - ${event.person.age} ${t("yearsOld")}`}
                      {event.person.team && ` - ${event.person.team}`}
                    </p>
                  )}
                  {event.time && (
                    <p className="text-xs text-gray-400">{event.time}</p>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
