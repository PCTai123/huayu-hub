"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Calendar,
  Clock,
  MapPin,
  Tag,
  ExternalLink,
  Link as LinkIcon,
  Trash2,
} from "lucide-react";

export type ActivityStatus = "upcoming" | "ongoing" | "ended";

export interface Activity {
  id: string;
  name: string;
  date: string;
  time: string;
  organization: string;
  topic: string;
  status: ActivityStatus;
  description?: string;
  referenceLink?: string;
  registrationLink?: string;
}

const statusConfig: Record<
  ActivityStatus,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  upcoming: {
    label: "Sắp diễn ra",
    color: "text-emerald-700",
    bgColor: "bg-emerald-100",
    borderColor: "border-emerald-200",
  },
  ongoing: {
    label: "Đang diễn ra",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
    borderColor: "border-amber-200",
  },
  ended: {
    label: "Đã kết thúc",
    color: "text-stone-600",
    bgColor: "bg-stone-100",
    borderColor: "border-stone-200",
  },
};

interface ActivityCardProps {
  activity: Activity;
  index: number;
  onDelete?: (id: string) => void;
}

export function ActivityCard({ activity, index, onDelete }: ActivityCardProps) {
  const t = useTranslations("activities");
  const status = statusConfig[activity.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -2, boxShadow: "0 12px 40px rgba(0,0,0,0.08)" }}
      className="bg-white border border-gray-300 rounded-[16px] p-5 flex flex-col gap-3 cursor-pointer transition-all shadow-sm"
    >
      {/* Top Row: Date & Status + Delete */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gray-100 text-gray-700">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-black">
              {activity.date}
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Clock className="w-3 h-3" />
              <span>{activity.time}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${status.bgColor} ${status.color} ${status.borderColor}`}
          >
            {status.label}
          </span>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onDelete(activity.id);
              }}
              className="p-1.5 rounded-lg hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors border border-gray-200"
              title={t("delete") || "Xóa"}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Activity Name */}
      <h3 className="text-base font-bold text-black leading-snug">
        {activity.name}
      </h3>

      {/* Organization & Topic */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200 text-xs text-gray-700">
          <MapPin className="w-3 h-3" />
          <span>{activity.organization}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          <Tag className="w-3 h-3" />
          <span>{activity.topic}</span>
        </div>
      </div>

      {/* Description (truncated) */}
      {activity.description && (
        <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
          {activity.description}
        </p>
      )}

      {/* Links */}
      <div className="flex gap-2 mt-1">
        {activity.referenceLink && (
          <a
            href={activity.referenceLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-50 text-xs text-gray-700 hover:bg-gray-100 transition-colors border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <LinkIcon className="w-3 h-3" />
            {t("reference")}
          </a>
        )}
        {activity.registrationLink && (
          <a
            href={activity.registrationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-xs text-red-700 hover:bg-red-100 transition-colors border border-red-200"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3 h-3" />
            {t("register")}
          </a>
        )}
      </div>
    </motion.div>
  );
}
