"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { X, Upload, User, Mail, Phone, Calendar, Briefcase, Building2, FileText, Save } from "lucide-react";

interface AddMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewMemberData) => void;
}

export interface NewMemberData {
  fullName: string;
  email: string;
  phone: string;
  birthDate: string;
  joinDate: string;
  team: string;
  role: string;
  bio: string;
  avatar?: File;
}

const teams = [
  "Media",
  "Design",
  "Content",
  "Teaching Assistant",
  "Operation",
  "Partner",
  "Executive",
];

const roles = [
  { value: "Founder", label: "Founder" },
  { value: "Co-Founder", label: "Co-Founder" },
  { value: "Admin", label: "Admin" },
  { value: "Leader", label: "Leader" },
  { value: "Member", label: "Member" },
  { value: "Intern", label: "Intern" },
  { value: "Advisor", label: "Advisor" },
];

export function AddMemberDialog({ isOpen, onClose, onSubmit }: AddMemberDialogProps) {
  const t = useTranslations("orgChart");
  const [formData, setFormData] = useState<NewMemberData>({
    fullName: "",
    email: "",
    phone: "",
    birthDate: "",
    joinDate: "",
    team: teams[0],
    role: roles[0].value,
    bio: "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, avatar: file }));
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      birthDate: "",
      joinDate: "",
      team: teams[0],
      role: roles[0].value,
      bio: "",
    });
    setAvatarPreview(null);
    onClose();
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent placeholder:text-gray-400 transition-colors";

  const labelClass =
    "flex items-center gap-2 text-sm font-semibold text-black mb-1.5";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-gray-200"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#C62828]">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-black">
                  {t("addMember") || "Them thanh vien"}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Avatar Upload */}
              <div className="flex justify-center mb-2">
                <motion.label
                  whileHover={{ scale: 1.05 }}
                  className="relative w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden hover:border-[#C62828] transition-colors"
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <Upload className="w-6 h-6 mb-1" />
                      <span className="text-xs">{t("uploadAvatar") || "Avatar"}</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </motion.label>
              </div>

              {/* Full Name */}
              <div>
                <label className={labelClass}>
                  <User className="w-4 h-4 text-[#C62828]" />
                  {t("fullName") || "Ho va ten"} <span className="text-[#C62828]">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder={t("fullNamePlaceholder") || "Nhap ho va ten"}
                  required
                  className={inputClass}
                />
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    <Mail className="w-4 h-4 text-[#C62828]" />
                    {t("email") || "Email"}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    <Phone className="w-4 h-4 text-[#C62828]" />
                    {t("phone") || "Dien thoai"}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0123456789"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Team */}
              <div>
                <label className={labelClass}>
                  <Building2 className="w-4 h-4 text-[#C62828]" />
                  {t("team") || "Ban/Nhom"}
                </label>
                <select
                  name="team"
                  value={formData.team}
                  onChange={handleChange}
                  className={inputClass}
                >
                  {teams.map((teamName) => (
                    <option key={teamName} value={teamName}>
                      {teamName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role */}
              <div>
                <label className={labelClass}>
                  <Briefcase className="w-4 h-4 text-[#C62828]" />
                  {t("role") || "Vai tro"}
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={inputClass}
                >
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Birth Date + Join Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    <Calendar className="w-4 h-4 text-[#C62828]" />
                    {t("birthDate") || "Ngay sinh"}
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    <Calendar className="w-4 h-4 text-[#C62828]" />
                    {t("joinDate") || "Ngay tham gia"}
                  </label>
                  <input
                    type="date"
                    name="joinDate"
                    value={formData.joinDate}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className={labelClass}>
                  <FileText className="w-4 h-4 text-[#C62828]" />
                  {t("bio") || "Tieu su"}
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder={t("bioPlaceholder") || "Mo ta ve thanh vien..."}
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {t("cancel") || "Huy"}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#C62828] rounded-lg hover:bg-[#a02222] transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {t("save") || "Luu"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
