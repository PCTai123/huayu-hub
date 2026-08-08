"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Pencil, Calendar, Phone, Mail, User, Users, Briefcase, Cake } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileCardProps {
  avatar?: string;
  name: string;
  birthDate: string;
  team: string;
  position: string;
  joinDate: string;
  phone: string;
  email: string;
  bio: string;
  onEdit?: () => void;
}

export function ProfileCard({
  avatar,
  name,
  birthDate,
  team,
  position,
  joinDate,
  phone,
  email,
  bio,
  onEdit,
}: ProfileCardProps) {
  const t = useTranslations("profile");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-[20px] bg-white border border-gray-200 shadow-xl"
    >
      {/* Cover Image / Header Background */}
      <div className="h-24 bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 relative">
        <div className="absolute inset-0 bg-white/10" />
      </div>

      {/* Avatar - positioned to overlap */}
      <div className="px-6 -mt-14 relative z-10">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative w-28 h-28 rounded-[20px] overflow-hidden border-4 border-white bg-gray-100 shadow-lg"
        >
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <User className="w-14 h-14 text-gray-500" strokeWidth={1.5} />
            </div>
          )}
        </motion.div>
      </div>

      {/* Info */}
      <div className="p-6 pt-4 space-y-5">
        {/* Name & Position */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-black">{name}</h1>
          <div className="flex items-center gap-2 text-gray-600">
            <Briefcase className="w-4 h-4" strokeWidth={1.5} />
            <span>{position}</span>
          </div>
        </div>

        {/* Bio */}
        {bio && (
          <p className="text-sm text-gray-700 leading-relaxed">{bio}</p>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoItem icon={<Users className="w-4 h-4" />} label={t("team")} value={team} />
          <InfoItem icon={<Cake className="w-4 h-4" />} label={t("birthDate")} value={birthDate} />
          <InfoItem icon={<Calendar className="w-4 h-4" />} label={t("joinDate")} value={joinDate} />
          <InfoItem icon={<Phone className="w-4 h-4" />} label={t("phone")} value={phone} />
        </div>

        {/* Email */}
        <InfoItem icon={<Mail className="w-4 h-4" />} label={t("email")} value={email} fullWidth />

        {/* Edit Button */}
        <Button
          onClick={onEdit}
          className="w-full rounded-[20px] bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 shadow-lg transition-all duration-300"
        >
          <Pencil className="w-4 h-4 mr-2" strokeWidth={1.5} />
          {t("editProfile")}
        </Button>
      </div>
    </motion.div>
  );
}

function InfoItem({
  icon,
  label,
  value,
  fullWidth = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 ${fullWidth ? "col-span-full" : ""}`}>
      <div className="mt-0.5 text-gray-400">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm text-black font-medium">{value}</p>
      </div>
    </div>
  );
}
