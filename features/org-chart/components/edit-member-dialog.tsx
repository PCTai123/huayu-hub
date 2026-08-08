"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { X, Upload, User, Mail, Phone, Calendar, Briefcase } from "lucide-react";
import { TeamMember } from "./org-chart-tree";

interface EditMemberDialogProps {
  member: TeamMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TeamMember) => void;
}

const teams = [
  "Media",
  "Design",
  "Content",
  "Teaching Assistant",
  "Operation",
  "Partner",
];

const roles = ["Team Lead", "Member", "Intern", "Advisor"];

export function EditMemberDialog({
  member,
  isOpen,
  onClose,
  onSubmit,
}: EditMemberDialogProps) {
  const t = useTranslations("orgChart");
  const [formData, setFormData] = useState<TeamMember | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setFormData({ ...member });
      setAvatarPreview(member.avatar || null);
    }
  }, [member]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && formData) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        setFormData((prev) =>
          prev ? { ...prev, avatar: reader.result as string } : null
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSubmit(formData);
      onClose();
    }
  };

  if (!formData) return null;

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
            className="relative glass-dialog w-full max-w-lg max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-amber-200/30 bg-white/40 backdrop-blur-md rounded-t-[20px]">
              <h2 className="text-lg font-bold text-amber-900">
                {t("editMember")}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5 text-amber-900" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Avatar Upload */}
              <div className="flex justify-center mb-4">
                <motion.label
                  whileHover={{ scale: 1.05 }}
                  className="relative w-24 h-24 rounded-full bg-amber-100/50 border-2 border-dashed border-amber-300 flex items-center justify-center cursor-pointer overflow-hidden"
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-amber-600">
                      <Upload className="w-6 h-6 mb-1" />
                      <span className="text-xs">{t("uploadAvatar")}</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </motion.label>
              </div>

              {/* Full Name */}
              <FormField
                icon={<User className="w-4 h-4" />}
                label={t("fullName")}
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />

              {/* Email */}
              <FormField
                icon={<Mail className="w-4 h-4" />}
                label={t("email")}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              {/* Phone */}
              <FormField
                icon={<Phone className="w-4 h-4" />}
                label={t("phone")}
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
              />

              {/* Birth Date */}
              <FormField
                icon={<Calendar className="w-4 h-4" />}
                label={t("birthDate")}
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
              />

              {/* Team Select */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-amber-800 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {t("team")}
                </label>
                <select
                  name="team"
                  value={formData.team}
                  onChange={handleChange}
                  className="glass-input w-full"
                >
                  {teams.map((team) => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Select */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-amber-800 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {t("role")}
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="glass-input w-full"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-amber-800">
                  {t("bio")}
                </label>
                <textarea
                  name="bio"
                  value={formData.bio || ""}
                  onChange={handleChange as any}
                  rows={3}
                  className="glass-input w-full resize-none"
                  placeholder={t("bioPlaceholder")}
                />
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl bg-amber-500 text-white font-semibold shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-colors"
              >
                {t("saveChanges")}
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
}: {
  icon: React.ReactNode;
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
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
        className="glass-input w-full"
        placeholder={label}
      />
    </div>
  );
}
