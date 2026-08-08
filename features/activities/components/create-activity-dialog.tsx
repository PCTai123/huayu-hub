"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  X,
  Calendar,
  Clock,
  Type,
  Building2,
  Link as LinkIcon,
  Tag,
  FileText,
  Save,
} from "lucide-react";

interface CreateActivityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ActivityFormData) => void;
}

export interface ActivityFormData {
  name: string;
  date: string;
  time: string;
  organization: string;
  topic: string;
  referenceLink: string;
  registrationLink: string;
  description: string;
}

const topics = [
  "Hội thảo",
  "Workshop",
  "Cuộc thi",
  "Tình nguyện",
  "Giao lưu",
  "Học bổng",
  "Khác",
];

export function CreateActivityDialog({
  isOpen,
  onClose,
  onSubmit,
}: CreateActivityDialogProps) {
  const t = useTranslations("activities");
  const [formData, setFormData] = useState<ActivityFormData>({
    name: "",
    date: "",
    time: "",
    organization: "",
    topic: topics[0],
    referenceLink: "",
    registrationLink: "",
    description: "",
  });
  const [charCount, setCharCount] = useState(0);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "description") {
      setCharCount(value.length);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form
    setFormData({
      name: "",
      date: "",
      time: "",
      organization: "",
      topic: topics[0],
      referenceLink: "",
      registrationLink: "",
      description: "",
    });
    setCharCount(0);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            className="relative bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[20px] shadow-2xl border border-gray-200"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-[20px]">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                <h2 className="text-lg font-bold text-amber-900">
                  {t("createActivity")}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5 text-amber-900" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Activity Name */}
              <FormField
                icon={<Type className="w-4 h-4" />}
                label={t("activityName")}
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder={t("activityNamePlaceholder")}
              />

              {/* Date & Time Row */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  icon={<Calendar className="w-4 h-4" />}
                  label={t("date")}
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
                <FormField
                  icon={<Clock className="w-4 h-4" />}
                  label={t("time")}
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Organization */}
              <FormField
                icon={<Building2 className="w-4 h-4" />}
                label={t("organization")}
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                required
                placeholder={t("organizationPlaceholder")}
              />

              {/* Topic Select */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-amber-800 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  {t("topic")}
                </label>
                <select
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  {topics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reference Link */}
              <FormField
                icon={<LinkIcon className="w-4 h-4" />}
                label={t("referenceLink")}
                name="referenceLink"
                type="url"
                value={formData.referenceLink}
                onChange={handleChange}
                placeholder="https://..."
              />

              {/* Registration Link */}
              <FormField
                icon={<LinkIcon className="w-4 h-4" />}
                label={t("registrationLink")}
                name="registrationLink"
                type="url"
                value={formData.registrationLink}
                onChange={handleChange}
                placeholder="https://..."
              />

              {/* Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-amber-800 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {t("description")}
                  </label>
                  <span
                    className={`text-xs ${
                      charCount > 1000 ? "text-red-500" : "text-amber-500"
                    }`}
                  >
                    {charCount}/1000
                  </span>
                </div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  maxLength={1000}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  placeholder={t("descriptionPlaceholder")}
                />
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl bg-amber-500 text-white font-semibold shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {t("saveAndAddToCalendar")}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FormField({
  icon,
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-amber-800 flex items-center gap-2">
        {icon}
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder:text-gray-400"
        placeholder={placeholder || label}
      />
    </div>
  );
}
