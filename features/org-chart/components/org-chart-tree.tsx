"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Crown,
  Users,
  UserPlus,
  UserMinus,
  Trash2,
  MonitorPlay,
  Palette,
  PenTool,
  GraduationCap,
  Settings,
  Handshake,
  ChevronDown,
  ChevronRight,
  Mail,
  Download,
  List,
  TreePine,
} from "lucide-react";
import { TeamCard } from "./team-card";
import { MemberProfileDialog } from "./member-profile-dialog";
import { AddMemberDialog, type NewMemberData } from "./add-member-dialog";
import { DeleteMemberDialog } from "./delete-member-dialog";
import { useMemberStore, type Member } from "@/lib/member-service";

// Team icon & color mapping
const TEAM_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  media: {
    icon: <MonitorPlay className="w-5 h-5" />,
    color: "text-red-500",
    bg: "bg-red-50",
  },
  design: {
    icon: <Palette className="w-5 h-5" />,
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  content: {
    icon: <PenTool className="w-5 h-5" />,
    color: "text-yellow-500",
    bg: "bg-yellow-50",
  },
  "teaching-assistant": {
    icon: <GraduationCap className="w-5 h-5" />,
    color: "text-green-500",
    bg: "bg-green-50",
  },
  operation: {
    icon: <Settings className="w-5 h-5" />,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  partner: {
    icon: <Handshake className="w-5 h-5" />,
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
};

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

export function OrgChartTree() {
  const t = useTranslations("orgChart");
  const { members, addMember, deleteMember } = useMemberStore();
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"tree" | "list">("tree");
  const treeRef = useRef<HTMLDivElement>(null);

  const founder = members.find((m) => m.role === "Founder");
  const coFounders = members.filter((m) => m.role === "Co-Founder");

  // Filter: exclude Founder and Co-Founder from teams, exclude "other" team
  const membersByTeam: Record<string, Member[]> = {};
  members.forEach((member) => {
    if (member.role === "Founder" || member.role === "Co-Founder") return;
    const teamId = teamNameToId[member.team];
    if (!teamId) return; // Skip members without a valid team (no "other")
    if (!membersByTeam[teamId]) membersByTeam[teamId] = [];
    membersByTeam[teamId].push(member);
  });

  const teams = Object.entries(membersByTeam).map(([id, teamMembers]) => ({
    id,
    name: teamDisplayNames[id] || id,
    config: TEAM_CONFIG[id] || { icon: <Users className="w-5 h-5" />, color: "text-gray-500", bg: "bg-gray-50" },
    memberCount: teamMembers.length,
    members: teamMembers,
  }));

  const toggleTeam = (teamId: string) => {
    setExpandedTeams((prev) => {
      const next = new Set(prev);
      if (next.has(teamId)) next.delete(teamId);
      else next.add(teamId);
      return next;
    });
  };

  const handleAddMember = (data: NewMemberData) => {
    const newMember: Member = {
      id: `new-${Date.now()}`,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      birthDate: data.birthDate,
      team: data.team,
      role: data.role,
      joinDate: data.joinDate || new Date().toISOString().split("T")[0],
      bio: data.bio,
    };
    addMember(newMember);
    const teamId = teamNameToId[data.team] || "other";
    setExpandedTeams((prev) => new Set([...prev, teamId]));
  };

  const handleDeleteMember = async (memberId: string) => {
    await deleteMember(memberId);
  };

  useEffect(() => {
    if (selectedMember) {
      const updated = members.find((m) => m.id === selectedMember.id);
      if (updated && updated !== selectedMember) {
        setSelectedMember(updated);
      }
    }
  }, [members, selectedMember]);

  // PDF Export using html2canvas (PNG image download)
  const handleExportPDF = useCallback(async () => {
    const content = document.getElementById("org-chart-export-area");
    if (!content) {
      console.error("Export area not found");
      alert("Không tìm thấy vùng sơ đồ để xuất!");
      return;
    }

    // Show loading state
    const btn = document.querySelector('[data-pdf-btn]') as HTMLButtonElement;
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>Đang xử lý...';
    }

    try {
      // Dynamic import to avoid SSR issues
      const { default: html2canvas } = await import("html2canvas");

      // Wait for any animations to settle
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Scroll to top to ensure full capture
      window.scrollTo(0, 0);

      // Capture the org chart area with high quality
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: false,
        allowTaint: false,
        backgroundColor: "#FAF7F2",
        logging: false,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        windowWidth: content.scrollWidth,
        windowHeight: content.scrollHeight,
      });

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error("Canvas has zero dimensions");
      }

      // Convert to PNG and download
      const imgData = canvas.toDataURL("image/png");
      
      if (!imgData || imgData === "data:,") {
        throw new Error("Failed to generate image data from canvas");
      }

      // Create download link
      const link = document.createElement("a");
      link.download = "so-do-to-chuc.png";
      link.href = imgData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error("Export error:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      alert(`Có lỗi khi tạo ảnh: ${errorMessage}`);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>Tải sơ đồ';
      }
    }
  }, []);

  const totalMembers = members.length;
  const founderCount = members.filter((m) => m.role === "Founder").length;
  const coFounderCount = members.filter((m) => m.role === "Co-Founder").length;
  const teamCount = teams.length;

  const renderMemberCard = (member: Member, index: number, compact = false) => (
    <motion.div
      key={member.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
      onClick={() => setSelectedMember(member)}
    >
      <div className="flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full border-2 border-white shadow-md overflow-hidden bg-gray-100 mb-3">
          {member.avatarUrl ? (
            <img src={member.avatarUrl} alt={member.fullName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>
        {/* Name */}
        <h3 className="font-bold text-black text-sm">{member.fullName}</h3>
        {/* Role */}
        <span className="text-xs text-[#C62828] font-medium mt-0.5">{member.role}</span>
        {/* Email */}
        {!compact && (
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <Mail className="w-3 h-3" />
            {member.email}
          </p>
        )}
        {/* View more button */}
        <button className="mt-2 px-3 py-1 rounded-full bg-gray-100 text-xs text-gray-600 hover:bg-[#C62828] hover:text-white transition-colors font-medium">
          {t("viewMore") || "Xem thêm"}
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="w-full" ref={treeRef}>
      {/* Tab Navigation + Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab("tree")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "tree"
                ? "bg-white text-[#C62828] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <TreePine className="w-4 h-4" />
            {t("treeView") || "Sơ đồ cây"}
          </button>
          <button
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "list"
                ? "bg-white text-[#C62828] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <List className="w-4 h-4" />
            {t("listView") || "Danh sách"}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            data-pdf-btn
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C62828] text-white text-sm font-medium hover:bg-[#A52020] transition-colors shadow-md disabled:opacity-70"
          >
            <Download className="w-4 h-4" />
            {t("downloadPdf") || "Tải sơ đồ"}
          </button>
        </div>
      </div>

      {/* Main Content Area - PDF Export Target */}
      <div
        id="org-chart-export-area"
        className="relative rounded-2xl p-6 md:p-8 overflow-hidden bg-[#FAF7F2]"
      >
        <div>
          {/* Stats Bar */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-100">
              <Crown className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-bold text-black">{founderCount}</span>
              <span className="text-xs text-gray-500">{t("founder") || "Founder"}</span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-100">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-black">{coFounderCount}</span>
              <span className="text-xs text-gray-500">{t("coFounder") || "Co-Founder"}</span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-100">
              <Users className="w-4 h-4 text-[#C62828]" />
              <span className="text-sm font-bold text-black">{teamCount}</span>
              <span className="text-xs text-gray-500">{t("team") || "Team"}</span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-100">
              <Users className="w-4 h-4 text-[#C62828]" />
              <span className="text-sm font-bold text-black">{totalMembers}</span>
              <span className="text-xs text-gray-500">{t("members") || "Thành viên"}</span>
            </div>
          </div>

          {activeTab === "tree" ? (
            <>
              {/* LEADERSHIP Section */}
              <div className="mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="px-4 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wider shadow-sm">
                    {t("leadership") || "LEADERSHIP"}
                  </div>
                </div>

                <div className="flex justify-center gap-8 mb-4">
                  {/* Founder */}
                  {founder && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="relative bg-white rounded-2xl border border-gray-200 shadow-lg p-6 w-64 text-center cursor-pointer hover:shadow-xl transition-all group"
                      onClick={() => setSelectedMember(founder)}
                    >
                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMember(founder.id);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors opacity-0 group-hover:opacity-100 z-10"
                        title={t("delete") || "Xóa"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="w-20 h-20 rounded-full border-2 border-[#C62828] overflow-hidden mx-auto mb-3 bg-gray-100">
                        {founder.avatarUrl ? (
                          <img src={founder.avatarUrl} alt={founder.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <Crown className="w-10 h-10 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="inline-flex items-center px-2 py-0.5 rounded bg-[#C62828] text-white text-[10px] font-bold uppercase mb-2">
                        <Crown className="w-3 h-3 mr-1" />
                        {t("founder") || "FOUNDER"}
                      </div>
                      <h3 className="font-bold text-black">{founder.fullName}</h3>
                      <p className="text-xs text-gray-500 mt-1">{founder.email}</p>
                    </motion.div>
                  )}

                  {/* Co-Founders */}
                  {coFounders.map((coFounder, cfIndex) => (
                    <motion.div
                      key={coFounder.id}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * (cfIndex + 1) }}
                      className="relative bg-white rounded-2xl border border-gray-200 shadow-lg p-6 w-64 text-center cursor-pointer hover:shadow-xl transition-all group"
                      onClick={() => setSelectedMember(coFounder)}
                    >
                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMember(coFounder.id);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors opacity-0 group-hover:opacity-100 z-10"
                        title={t("delete") || "Xóa"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="w-20 h-20 rounded-full border-2 border-amber-400 overflow-hidden mx-auto mb-3 bg-gray-100">
                        {coFounder.avatarUrl ? (
                          <img src={coFounder.avatarUrl} alt={coFounder.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <Crown className="w-10 h-10 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="inline-flex items-center px-2 py-0.5 rounded bg-amber-400 text-white text-[10px] font-bold uppercase mb-2">
                        <Crown className="w-3 h-3 mr-1" />
                        {t("coFounder") || "CO-FOUNDER"}
                      </div>
                      <h3 className="font-bold text-black">{coFounder.fullName}</h3>
                      <p className="text-xs text-gray-500 mt-1">{coFounder.email}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Connector line */}
                <div className="flex justify-center">
                  <div className="w-0.5 h-8 bg-gray-300" />
                </div>
              </div>

              {/* TEAMS Section */}
              <div>
                <div className="flex items-center justify-center mb-4">
                  <div className="px-4 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wider shadow-sm">
                    {t("teams") || "TEAMS"}
                  </div>
                </div>

                {/* Team Cards Grid - Compact single row */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {teams.map((team, index) => {
                    const leader = team.members.find((m) =>
                      ["Trưởng nhóm", "Team Lead", "Leader"].some((r) => m.role.includes(r))
                    ) || team.members[0];
                    return (
                      <motion.div
                        key={team.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.08 }}
                        className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 hover:shadow-md transition-all"
                      >
                        {/* Team Header */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`p-1.5 rounded-lg ${team.config.bg}`}>
                            <div className={`${team.config.color} scale-90`}>{team.config.icon}</div>
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-black text-xs truncate">{team.name}</h3>
                            {leader && (
                              <p className="text-[10px] text-gray-500 truncate">
                                {t("teamLead") || "Trưởng nhóm"}: {leader.fullName}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Member count & avatars */}
                        <div className="flex items-center justify-between">
                          <div className="flex -space-x-1.5">
                            {team.members.slice(0, 4).map((m, i) => (
                              <div
                                key={m.id}
                                className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 overflow-hidden flex items-center justify-center"
                              >
                                {m.avatarUrl ? (
                                  <img src={m.avatarUrl} alt={m.fullName} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-[7px] font-bold text-gray-500">
                                    {m.fullName.charAt(0)}
                                  </span>
                                )}
                              </div>
                            ))}
                            {team.members.length > 4 && (
                              <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[7px] text-gray-500 font-bold">
                                +{team.members.length - 4}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => toggleTeam(team.id)}
                            className="flex items-center gap-1 text-[10px] text-[#C62828] font-medium hover:underline"
                          >
                            <Users className="w-3 h-3" />
                            {team.memberCount}
                            <ChevronDown
                              className={`w-3 h-3 transition-transform ${expandedTeams.has(team.id) ? "rotate-180" : ""}`}
                            />
                          </button>
                        </div>

                        {/* Expanded Members */}
                        <AnimatePresence>
                          {expandedTeams.has(team.id) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-gray-100 mt-2 pt-2 space-y-1.5">
                                {team.members.map((member, idx) => (
                                  <motion.div
                                    key={member.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors relative group"
                                    onClick={() => setSelectedMember(member)}
                                  >
                                    {/* Delete button */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteMember(member.id);
                                      }}
                                      className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors opacity-0 group-hover:opacity-100 z-10"
                                      title={t("delete") || "Xóa"}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                    <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                                      {member.avatarUrl ? (
                                        <img src={member.avatarUrl} alt={member.fullName} className="w-full h-full object-cover" />
                                      ) : (
                                        <Users className="w-4 h-4 text-gray-400" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-black truncate">{member.fullName}</p>
                                      <p className="text-[10px] text-[#C62828]">{member.role}</p>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>

                {/* ALL MEMBERS Button */}
                <div className="flex justify-center mt-8">
                  <button className="px-6 py-2.5 rounded-full bg-white border border-gray-200 text-sm font-bold text-gray-600 hover:bg-[#C62828] hover:text-white hover:border-[#C62828] transition-all shadow-sm uppercase tracking-wider">
                    {t("allMembers") || "All Members"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* List View */
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {members.map((member, index) => renderMemberCard(member, index))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 z-30 flex flex-col gap-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddDialog(true)}
          className="w-14 h-14 rounded-full bg-[#C62828] hover:bg-red-700 text-white shadow-lg flex items-center justify-center transition-colors"
          title={t("addMember") || "Thêm thành viên"}
        >
          <UserPlus className="w-6 h-6" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowDeleteDialog(true)}
          className="w-14 h-14 rounded-full bg-gray-600 hover:bg-gray-700 text-white shadow-lg flex items-center justify-center transition-colors"
          title={t("deleteMember") || "Xóa thành viên"}
        >
          <UserMinus className="w-6 h-6" />
        </motion.button>
      </div>

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

      <AddMemberDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSubmit={handleAddMember}
      />

      <DeleteMemberDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        teams={teams.map((t) => ({ id: t.id, name: t.name, icon: t.config.icon, memberCount: t.memberCount, members: t.members }))}
        founder={founder || null}
        coFounder={coFounder || null}
        onDelete={handleDeleteMember}
      />
    </div>
  );
}
