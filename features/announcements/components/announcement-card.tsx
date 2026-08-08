"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Calendar, User } from "lucide-react";

interface AnnouncementCardProps {
  id: string;
  title: string;
  content: string;
  date: string;
  author: {
    name: string;
    avatar?: string;
  };
  index?: number;
}

export function AnnouncementCard({
  title,
  content,
  date,
  author,
  index = 0,
}: AnnouncementCardProps) {
  const t = useTranslations("announcements");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="relative overflow-hidden rounded-[20px] bg-white border border-gray-200 shadow-lg p-6 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex flex-col gap-4">
        {/* Title - red bg white text badge */}
        <div className="inline-block">
          <span className="inline-block px-4 py-2 rounded-lg bg-[#C62828] text-white text-sm font-bold">
            {title}
          </span>
        </div>

        {/* Content */}
        <p className="text-sm text-black leading-relaxed line-clamp-3">
          {content}
        </p>

        {/* Footer: Date & Author */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar className="w-4 h-4" strokeWidth={1.5} />
            <span>{date}</span>
          </div>

          <div className="flex items-center gap-2">
            {author.avatar ? (
              <Image
                src={author.avatar}
                alt={author.name}
                width={28}
                height={28}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" strokeWidth={1.5} />
              </div>
            )}
            <span className="text-xs text-gray-800 font-medium">
              {author.name}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
