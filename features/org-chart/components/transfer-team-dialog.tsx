"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { X, ArrowRightLeft, User, Briefcase, AlertCircle } from "lucide-react";
import { TeamMember } from "./org-chart-tree";

interface TransferTeamDialogProps {
  member: TeamMember | null;
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (memberId: string, newTeam: string, newRole?: string) => void;
}

const teams = [
  "Media",
  "Design",
  "Content",
  "Teaching Assistant",
  "Operation",
  "Partner",
];

export function TransferTeamDialog({
  member,
  isOpen,
  onClose,
  onTransfer,
}: TransferTeamDialogProps) {
  const t = useTranslations("orgChart");
  const [selectedTeam, setSelectedTeam] = useState(member?.team || "");
  const [newRole, setNewRole] = useState(member?.role || "Member");

  React.useEffect(() => {
    if (member) {
      setSelectedTeam(member.team);
      setNewRole(member.role);
    }
  }, [member]);

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (member && selectedTeam !== member.team) {
      onTransfer(member.id, selectedTeam, newRole);
      onClose();
    }
  };

  if (!member) return null;

  const isSameTeam = selectedTeam === member.team;

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
            className="relative glass-dialog w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-amber-200/30">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-amber-600" />
                <h2 className="text-lg font-bold text-amber-900">
                  {t("transferTeam")}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5 text-amber-900" />
              </button>
            </div>

            <form onSubmit={handleTransfer} className="px-6 py-5 space-y-5">
              {/* Member Info */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-200/30">
                <div className="w-10 h-10 rounded-full bg-amber-200/60 flex items-center justify-center">
                  <User className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <p className="font-medium text-amber-900">
                    {member.fullName}
                  </p>
                  <p className="text-sm text-amber-600">
                    {member.role} · {member.team}
                  </p>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <motion.div
                  animate={{ y: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <ArrowRightLeft className="w-6 h-6 text-amber-400 rotate-90" />
                </motion.div>
              </div>

              {/* New Team Select */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-amber-800 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {t("newTeam")}
                </label>
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="glass-input w-full"
                >
                  {teams.map((team) => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
                </select>
              </div>

              {/* Warning if same team */}
              {isSameTeam && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-amber-100/50 border border-amber-300/50"
                >
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <p className="text-sm text-amber-700">{t("sameTeamWarning")}</p>
                </motion.div>
              )}

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isSameTeam}
                whileHover={!isSameTeam ? { scale: 1.02 } : {}}
                whileTap={!isSameTeam ? { scale: 0.98 } : {}}
                className={`w-full py-3 rounded-xl font-semibold shadow-lg transition-colors ${
                  isSameTeam
                    ? "bg-amber-200 text-amber-400 cursor-not-allowed"
                    : "bg-amber-500 text-white shadow-amber-500/20 hover:bg-amber-600"
                }`}
              >
                {t("confirmTransfer")}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
