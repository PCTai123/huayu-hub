"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { ChevronDown, Users, User } from "lucide-react";
import { TeamData } from "./org-chart-tree";
import { MemberProfileDialog } from "./member-profile-dialog";
import type { Member } from "@/lib/member-service";

interface TeamCardProps {
  team: TeamData;
  isExpanded: boolean;
  onToggle: () => void;
}

export function TeamCard({ team, isExpanded, onToggle }: TeamCardProps) {
  const t = useTranslations("orgChart");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  return (
    <>
      <motion.div
        className="rounded-[16px] bg-white border border-gray-200 p-4 cursor-pointer hover:shadow-lg transition-all"
        whileHover={{ scale: 1.02 }}
        onClick={onToggle}
        layout
      >
        {/* Team Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gray-100">
              {team.icon}
            </div>
            <div>
              <h3 className="font-semibold text-black text-sm">
                {team.name}
              </h3>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Users className="w-3 h-3" />
                <span>
                  {team.memberCount} {t("members")}
                </span>
              </div>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </motion.div>
        </div>

        {/* Expanded Member List */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-t border-gray-200 pt-3 mt-2 space-y-2">
                {team.members.length > 0 ? (
                  team.members.map((member, idx) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedMember(member)}
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-black truncate">
                          {member.fullName}
                        </p>
                        <p className="text-xs text-gray-600">{member.role}</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic py-2 text-center">
                    {t("noMembers") || "No members"}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Member Profile Dialog */}
      {selectedMember && (
        <MemberProfileDialog
          member={selectedMember}
          isOpen={!!selectedMember}
          onClose={() => setSelectedMember(null)}
          isAdmin={false}
          isSelf={false}
        />
      )}
    </>
  );
}
