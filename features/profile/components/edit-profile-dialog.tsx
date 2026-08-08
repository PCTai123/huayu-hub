"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { X, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EditProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    avatar?: string;
    name: string;
    birthDate: string;
    phone: string;
    email: string;
    bio: string;
    team: string;
    position: string;
  };
  onSave?: (data: {
    avatar?: string;
    name: string;
    birthDate: string;
    phone: string;
    email: string;
    bio: string;
    team: string;
    position: string;
  }) => void;
}

export function EditProfileDialog({
  isOpen,
  onClose,
  profile,
  onSave,
}: EditProfileDialogProps) {
  const t = useTranslations("profile");
  const [formData, setFormData] = useState(profile);
  const [isDragging, setIsDragging] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(profile.avatar);

  // Sync form data when profile prop changes (e.g. when dialog reopens)
  useEffect(() => {
    setFormData(profile);
    setPreviewAvatar(profile.avatar);
  }, [profile]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setPreviewAvatar(result);
          setFormData((prev) => ({ ...prev, avatar: result }));
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPreviewAvatar(result);
        setFormData((prev) => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave?.(formData);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg rounded-[20px] bg-white border border-gray-200 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-black">{t("editProfile")}</h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Avatar Upload - Drag & Drop */}
              <div className="flex flex-col items-center gap-3">
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`relative w-32 h-32 rounded-[20px] overflow-hidden border-2 border-dashed cursor-pointer transition-all duration-300 ${
                    isDragging
                      ? "border-[#C62828] bg-red-50 scale-105"
                      : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  {previewAvatar ? (
                    <img
                      src={previewAvatar}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      <ImagePlus className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
                      <span className="text-xs text-gray-400">{t("dropImage")}</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-gray-400">{t("dragDropHint")}</p>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-black">{t("name")}</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder={t("namePlaceholder")}
                  className="rounded-xl bg-white border-gray-300 text-black placeholder:text-gray-400 focus:border-[#C62828] focus:ring-0"
                />
              </div>

              {/* Birth Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-black">{t("birthDate")}</label>
                <Input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleChange("birthDate", e.target.value)}
                  className="rounded-xl bg-white border-gray-300 text-black focus:border-[#C62828] focus:ring-0"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-black">{t("phone")}</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder={t("phonePlaceholder")}
                  className="rounded-xl bg-white border-gray-300 text-black placeholder:text-gray-400 focus:border-[#C62828] focus:ring-0"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-black">{t("email")}</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  className="rounded-xl bg-white border-gray-300 text-black placeholder:text-gray-400 focus:border-[#C62828] focus:ring-0"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-black">{t("bio")}</label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  placeholder={t("bioPlaceholder")}
                  rows={4}
                  className="rounded-xl bg-white border-gray-300 text-black placeholder:text-gray-400 focus:border-[#C62828] focus:ring-0 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  className="rounded-[20px] border-gray-300 text-black hover:bg-gray-100"
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  className="rounded-[20px] bg-[#C62828] text-white hover:bg-red-700 shadow-lg transition-all duration-300"
                >
                  {t("save")}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
