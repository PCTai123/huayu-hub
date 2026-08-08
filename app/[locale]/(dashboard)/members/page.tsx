"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Users, User, Briefcase, Mail, Phone } from "lucide-react";
import { useMemberStore } from "@/lib/member-service";

const teamNameToId: Record<string, string> = {
  Media: "media",
  Design: "design",
  Content: "content",
  "Teaching Assistant": "teaching-assistant",
  Operation: "operation",
  Partner: "partner",
};

const teamDisplayNames: Record<string, string> = {
  media: "Media",
  design: "Design",
  content: "Content",
  "teaching-assistant": "Teaching Assistant",
  operation: "Operation",
  partner: "Partner",
};

export default function MembersPage() {
  const t = useTranslations("orgChart");
  const { members } = useMemberStore();

  // Group members by team
  const membersByTeam: Record<string, typeof members> = {};
  members.forEach((member) => {
    const teamId = teamNameToId[member.team] || "other";
    if (!membersByTeam[teamId]) {
      membersByTeam[teamId] = [];
    }
    membersByTeam[teamId].push(member);
  });

  const teams = Object.entries(membersByTeam).map(([id, teamMembers]) => ({
    id,
    name: teamDisplayNames[id] || id,
    members: teamMembers,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h1
          className="text-2xl font-bold text-black"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          {t("members") || "Thanh vien"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {members.length} {t("members") || "thanh vien"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teams.map((team, teamIndex) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: teamIndex * 0.1 }}
            className="rounded-[20px] bg-white p-5 shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-gray-100">
                <Users className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-black">{team.name}</h3>
                <p className="text-xs text-gray-500">
                  {team.members.length} {t("members") || "thanh vien"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {team.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black">
                      {member.fullName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-black">
                        {member.role}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Mail className="w-4 h-4" />
                    <Phone className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
