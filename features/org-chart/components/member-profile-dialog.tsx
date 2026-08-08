"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  X,
  Mail,
  Phone,
  Calendar,
  User,
  Briefcase,
  Edit3,
  ArrowRightLeft,
  MessageCircle,
  Hash,
  Clock,
  Shield,
} from "lucide-react";
import type { Member } from "@/lib/member-service";

interface MemberProfileDialogProps {
  member: Member;
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  isSelf: boolean;
}

export function MemberProfileDialog({
  member,
  isOpen,
  onClose,
  isAdmin,
  isSelf,
}: MemberProfileDialogProps) {
  const t = useTranslations("orgChart");
  const [showEdit, setShowEdit] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);

  const canEdit = isAdmin || isSelf;

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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Dialog */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-20"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="flex flex-col md:flex-row">
              {/* Left Column */}
              <div className="w-full md:w-2/5 bg-gray-50 p-6 flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-gray-200">
                {/* Avatar */}
                <motion.div
                  className="w-28 h-28 rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden bg-gray-100"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 20, delay: 0.1 }}
                >
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </motion.div>

                {/* Name */}
                <h2 className="mt-4 text-xl font-bold text-black">
                  {member.fullName}
                </h2>

                {/* Role Badge */}
                <span className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-[#C62828] text-white text-sm font-semibold">
                  <Shield className="w-3.5 h-3.5 mr-1.5" />
                  {member.role}
                </span>

                {/* Motto / Bio */}
                {member.bio && (
                  <div className="mt-4 px-3 py-2.5 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-medium">
                      {t("motto")}
                    </p>
                    <p className="text-sm text-gray-700 italic leading-relaxed">
                      &ldquo;{member.bio}&rdquo;
                    </p>
                  </div>
                )}

                {/* Team Info */}
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-black">{member.team}</span>
                </div>

                {/* Join Date */}
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>
                    {t("joined")}: {member.joinDate}
                  </span>
                </div>

                {/* Member ID */}
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                  <Hash className="w-3.5 h-3.5" />
                  <span>
                    {t("memberId")}: {member.id}
                  </span>
                </div>
              </div>

              {/* Right Column */}
              <div className="w-full md:w-3/5 p-6 flex flex-col">
                <h3 className="text-lg font-bold text-black mb-4">
                  {t("profileDetails")}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InfoCard
                    icon={<Calendar className="w-4 h-4" />}
                    label={t("birthDate")}
                    value={member.birthDate}
                  />
                  <InfoCard
                    icon={<Briefcase className="w-4 h-4" />}
                    label={t("team")}
                    value={member.team}
                  />
                  <InfoCard
                    icon={<Calendar className="w-4 h-4" />}
                    label={t("joinDate")}
                    value={member.joinDate}
                  />
                  <InfoCard
                    icon={<Phone className="w-4 h-4" />}
                    label={t("phone")}
                    value={member.phone}
                  />
                  <InfoCard
                    icon={<Mail className="w-4 h-4" />}
                    label={t("email")}
                    value={member.email}
                    className="sm:col-span-2"
                  />
                  {member.bio && (
                    <InfoCard
                      icon={<User className="w-4 h-4" />}
                      label={t("description")}
                      value={member.bio}
                      className="sm:col-span-2"
                    />
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-auto pt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => console.log("Messaging", member.email)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-200 text-black font-medium hover:bg-gray-300 transition-colors shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {t("message")}
                  </motion.button>

                  {canEdit && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowEdit(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#C62828] text-white font-medium hover:bg-red-700 transition-colors shadow-sm"
                    >
                      <Edit3 className="w-4 h-4" />
                      {t("edit")}
                    </motion.button>
                  )}
                </div>

                {isAdmin && (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setShowTransfer(true)}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-[#C62828] font-medium hover:bg-red-100 transition-colors text-sm border border-red-200"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    {t("transfer")}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InfoCard({
  icon,
  label,
  value,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`p-3 rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors ${
        className || ""
      }`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div className="text-gray-400">{icon}</div>
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
          {label}
        </p>
      </div>
      <p className="text-sm font-medium text-black break-words">{value}</p>
    </div>
  );
}
