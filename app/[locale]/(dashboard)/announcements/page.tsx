"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { AnnouncementCard } from "@/features/announcements/components/announcement-card";
import { CreateAnnouncementDialog } from "@/features/announcements/components/create-announcement-dialog";
import { Megaphone } from "lucide-react";
import { getAnnouncements, addAnnouncement, subscribeToAnnouncements, type Announcement } from "@/lib/announcement-store";

export default function AnnouncementsPage() {
  const t = useTranslations("announcements");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    setAnnouncements(getAnnouncements());
    return subscribeToAnnouncements(() => {
      setAnnouncements(getAnnouncements());
    });
  }, []);

  const handleCreateAnnouncement = (data: { title: string; content: string }) => {
    addAnnouncement({
      title: data.title,
      content: data.content,
      authorName: "Admin User",
      authorAvatar: undefined,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-[20px] bg-[#C62828] shadow-lg">
            <Megaphone className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black">{t("title")}</h1>
            <p className="text-gray-600 mt-1">{t("subtitle")}</p>
          </div>
        </div>

        <CreateAnnouncementDialog
          onSubmit={handleCreateAnnouncement}
          isAdmin={true}
        />
      </motion.div>

      {/* Announcements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {announcements.map((announcement, index) => (
          <AnnouncementCard
            key={announcement.id}
            id={announcement.id}
            title={announcement.title}
            content={announcement.content}
            date={announcement.date}
            author={announcement.author}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
