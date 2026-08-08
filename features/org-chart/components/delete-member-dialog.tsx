"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { X, Trash2, User, ChevronDown, ChevronRight, Search, Crown } from "lucide-react";
import type { TeamData } from "./org-chart-tree";
import type { Member } from "@/lib/member-service";

interface DeleteMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teams: TeamData[];
  founder: Member | null;
  coFounder: Member | null;
  onDelete: (memberId: string) => void;
}

export function DeleteMemberDialog({
  isOpen,
  onClose,
  teams,
  founder,
  coFounder,
  onDelete,
}: DeleteMemberDialogProps) {
  const t = useTranslations("orgChart");
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Member | null>(null);

  const toggleTeam = (teamId: string) => {
    setExpandedTeams((prev) => {
      const next = new Set(prev);
      if (next.has(teamId)) {
        next.delete(teamId);
      } else {
        next.add(teamId);
      }
      return next;
    });
  };

  const handleDelete = (member: Member) => {
    setPendingDelete(member);
  };

  const confirmDelete = () => {
    if (pendingDelete) {
      onDelete(pendingDelete.id);
      setPendingDelete(null);
    }
  };

  const filteredTeams = teams.map((team) => ({
    ...team,
    members: team.members.filter((m) =>
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  }));

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
                <div className="p-2 rounded-lg bg-red-100">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-lg font-bold text-black">
                  {t("deleteMember") || "Xoa thanh vien"}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Search */}
            <div className="px-6 pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent placeholder:text-gray-400"
                  placeholder={t("searchMember") || "Tim thanh vien..."}
                />
              </div>
            </div>

            {/* Leadership Section (Founder + Co-Founder) */}
            {(founder || coFounder) && (
              <div className="px-6 pt-3">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" />
                  {t("leadership") || "Ban lãnh đạo"}
                </h3>
                <div className="space-y-2">
                  {founder && (
                    <div className="flex items-center justify-between px-4 py-2.5 bg-red-50/30 border border-red-100 rounded-xl hover:bg-red-50/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                          <Crown className="w-4 h-4 text-[#C62828]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-black">
                            {founder.fullName}
                          </p>
                          <p className="text-xs text-[#C62828] font-medium">
                            {t("founder") || "Người sáng lập"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(founder)}
                        className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  )}
                  {coFounder && (
                    <div className="flex items-center justify-between px-4 py-2.5 bg-amber-50/30 border border-amber-100 rounded-xl hover:bg-amber-50/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                          <Crown className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-black">
                            {coFounder.fullName}
                          </p>
                          <p className="text-xs text-amber-600 font-medium">
                            {t("coFounder") || "Đồng sáng lập"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(coFounder)}
                        className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Team-grouped Member List */}
            <div className="p-6 space-y-3">
              {filteredTeams.map((team) => {
                const isExpanded = expandedTeams.has(team.id);
                return (
                  <div
                    key={team.id}
                    className="border border-gray-200 rounded-xl overflow-hidden"
                  >
                    {/* Team Header */}
                    <button
                      onClick={() => toggleTeam(team.id)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                        <span className="font-semibold text-black text-sm">
                          {team.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({team.members.length})
                        </span>
                      </div>
                    </button>

                    {/* Members */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="divide-y divide-gray-100">
                            {team.members.length > 0 ? (
                              team.members.map((member) => (
                                <div
                                  key={member.id}
                                  className="flex items-center justify-between px-4 py-2.5 hover:bg-red-50/50 transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                      <User className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-black">
                                        {member.fullName}
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        {member.role}
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleDelete(member)}
                                    className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </button>
                                </div>
                              ))
                            ) : (
                              <p className="px-4 py-3 text-xs text-gray-400 italic text-center">
                                {t("noMembers") || "No members"}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Confirm Delete */}
            <AnimatePresence>
              {pendingDelete && (
                <motion.div
                  className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-white/80"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 max-w-sm w-full"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
                        <Trash2 className="w-6 h-6 text-red-600" />
                      </div>
                      <h3 className="text-lg font-bold text-black mb-1">
                        {t("confirmDelete") || "Xac nhan xoa"}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {t("deleteConfirmText") || "Ban co chac chan muon xoa"}{" "}
                        <span className="font-semibold text-black">
                          {pendingDelete.fullName}
                        </span>
                        ?
                      </p>
                      <div className="flex gap-3 w-full">
                        <button
                          onClick={() => setPendingDelete(null)}
                          className="flex-1 py-2.5 rounded-xl border border-gray-300 text-black font-medium hover:bg-gray-50 transition-colors"
                        >
                          {t("cancel") || "Huy"}
                        </button>
                        <button
                          onClick={confirmDelete}
                          className="flex-1 py-2.5 rounded-xl bg-[#C62828] text-white font-medium hover:bg-red-700 transition-colors"
                        >
                          {t("delete") || "Xoa"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
