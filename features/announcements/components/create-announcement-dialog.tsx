"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CreateAnnouncementDialogProps {
  onSubmit?: (data: { title: string; content: string }) => void;
  isAdmin?: boolean;
}

export function CreateAnnouncementDialog({
  onSubmit,
  isAdmin = false,
}: CreateAnnouncementDialogProps) {
  const t = useTranslations("announcements");
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  if (!isAdmin) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onSubmit?.({ title, content });
    setTitle("");
    setContent("");
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="rounded-[20px] bg-[#C62828] text-white font-bold hover:bg-[#A52020] shadow-lg transition-all duration-300"
      >
        <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
        {t("createNew")}
      </Button>

      {/* Dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setIsOpen(false)}
          >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg rounded-[20px] bg-white border border-gray-200 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-[#C62828]">
              <h2 className="text-xl font-bold text-white">
                {t("createAnnouncement")}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white/80" strokeWidth={1.5} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-800">
                  {t("title")}
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("titlePlaceholder")}
                  className="rounded-xl bg-gray-50 border-gray-200 text-black placeholder:text-gray-400 focus:border-[#C62828] focus:ring-[#C62828]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-800">
                  {t("content")}
                </label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t("contentPlaceholder")}
                  rows={6}
                  className="rounded-xl bg-gray-50 border-gray-200 text-black placeholder:text-gray-400 focus:border-[#C62828] focus:ring-[#C62828] resize-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={!title.trim() || !content.trim()}
                  className="rounded-[20px] bg-[#C62828] text-white font-bold hover:bg-[#A52020] shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {t("submit")}
                </Button>
              </div>
            </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
