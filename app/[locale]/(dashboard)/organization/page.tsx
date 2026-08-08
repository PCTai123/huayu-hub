"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Building2,
  Pencil,
  X,
  BookOpen,
  CalendarDays,
  Target,
  Trophy,
  Users,
  Globe,
  Mail,
  MapPin,
  ExternalLink,
  Link as LinkIcon,
} from "lucide-react";
import {
  getOrganization,
  updateOrganization,
  subscribeToOrganization,
  type OrganizationData,
  type Partner,
  type SocialLink,
} from "@/lib/organization-store";

// Partner platform icons (inline SVGs since lucide-react dropped brand icons)
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  );
}
function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z" />
    </svg>
  );
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  Facebook: <FacebookIcon className="w-4 h-4" />,
  TikTok: <TiktokIcon className="w-4 h-4" />,
  Instagram: <InstagramIcon className="w-4 h-4" />,
  YouTube: <YoutubeIcon className="w-4 h-4" />,
  Website: <Globe className="w-4 h-4" />,
};

// Stat card colors
const STAT_COLORS = [
  { bg: "bg-red-50", icon: "text-red-500", border: "border-red-100" },
  { bg: "bg-orange-50", icon: "text-orange-500", border: "border-orange-100" },
  { bg: "bg-green-50", icon: "text-green-500", border: "border-green-100" },
  { bg: "bg-blue-50", icon: "text-blue-500", border: "border-blue-100" },
];

// Section icon colors
const SECTION_COLORS = [
  { icon: "bg-red-50 text-red-500", button: "text-red-500 hover:bg-red-50" },
  { icon: "bg-orange-50 text-orange-500", button: "text-orange-500 hover:bg-orange-50" },
  { icon: "bg-green-50 text-green-500", button: "text-green-500 hover:bg-green-50" },
  { icon: "bg-purple-50 text-purple-500", button: "text-purple-500 hover:bg-purple-50" },
];

function StatCard({
  icon,
  number,
  label,
  index,
}: {
  icon: React.ReactNode;
  number: string;
  label: string;
  index: number;
}) {
  const colors = STAT_COLORS[index % STAT_COLORS.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
      className={`flex items-center gap-4 bg-white rounded-2xl border ${colors.border} p-4 shadow-sm`}
    >
      <div className={`p-3 rounded-xl ${colors.bg}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-black">{number}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </motion.div>
  );
}

function InfoSection({
  icon,
  title,
  content,
  index,
  onDetail,
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
  index: number;
  onDetail?: () => void;
}) {
  const colors = SECTION_COLORS[index % SECTION_COLORS.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 * index }}
      className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-2 rounded-lg ${colors.icon}`}>{icon}</div>
        <h3 className="font-bold text-black text-base">{title}</h3>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-4">
        {content}
      </p>
      {onDetail && (
        <button
          onClick={onDetail}
          className={`flex items-center gap-1 text-sm font-medium ${colors.button} px-3 py-1.5 rounded-lg transition-colors`}
        >
          Xem chi tiết
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      )}
    </motion.div>
  );
}

export default function OrganizationPage() {
  const t = useTranslations("organization");
  const [org, setOrg] = useState<OrganizationData | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [detailSection, setDetailSection] = useState<string | null>(null);

  useEffect(() => {
    setOrg(getOrganization());
    return subscribeToOrganization((data) => setOrg({ ...data }));
  }, []);

  if (!org) return null;

  const handleSave = (updated: OrganizationData) => {
    updateOrganization(updated);
    setIsEditOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#C62828]/10">
            <Building2 className="w-6 h-6 text-[#C62828]" />
          </div>
          <h1 className="text-2xl font-bold text-black">
            {t("title") || "Thông tin tổ chức"}
          </h1>
        </div>
        <button
          onClick={() => setIsEditOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#C62828] text-[#C62828] text-sm font-medium hover:bg-[#C62828] hover:text-white transition-colors"
        >
          <Pencil className="w-4 h-4" />
          {t("edit") || "Chỉnh sửa"}
        </button>
      </motion.div>

      {/* Banner Section - Separate from profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm"
      >
        <div className="relative h-72 w-full bg-gradient-to-r from-red-50 via-orange-50 to-amber-50">
          {org.bannerUrl ? (
            <img
              src={org.bannerUrl}
              alt="Banner"
              className="w-full h-full object-cover"
              style={{ objectPosition: org.bannerPosition || "center center" }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="w-20 h-20 text-gray-300" />
            </div>
          )}
        </div>
      </motion.div>

      {/* Profile Info Section - Below banner, separate card with clear spacing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 mt-6"
      >
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gray-100 shrink-0">
            {org.avatarUrl ? (
              <img
                src={org.avatarUrl}
                alt={org.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#C62828] to-red-400">
                <span className="text-white text-3xl font-bold">
                  {org.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-black mb-1">{org.name}</h2>
            <p className="text-sm text-gray-500 mb-3">{org.tagline}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-400" />
                {org.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-gray-400" />
                {org.email}
              </span>
              <a
                href={org.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-[#C62828] transition-colors"
              >
                <Globe className="w-4 h-4 text-gray-400" />
                {org.website}
              </a>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-100">
          {org.socialLinks.map((link) => (
            <a
              key={link.platform}
              href={
                link.url.startsWith("http")
                  ? link.url
                  : `https://${link.url}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#C62828] hover:text-white transition-colors"
              title={link.platform}
            >
              {PLATFORM_ICONS[link.platform] || (
                <LinkIcon className="w-4 h-4" />
              )}
            </a>
          ))}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          number={`${org.stats.members}+`}
          label={t("members") || "Thành viên"}
          index={0}
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          number={`${org.stats.teams}`}
          label={t("teams") || "Đội nhóm"}
          index={1}
        />
        <StatCard
          icon={<CalendarDays className="w-5 h-5" />}
          number={`${org.stats.activities}+`}
          label={t("activities") || "Hoạt động"}
          index={2}
        />
        <StatCard
          icon={<Globe className="w-5 h-5" />}
          number={`${org.stats.yearsActive}+`}
          label={t("yearsActive") || "Năm hoạt động"}
          index={3}
        />
      </div>

      {/* Info Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoSection
          icon={<BookOpen className="w-5 h-5" />}
          title={t("story") || "Câu chuyện"}
          content={org.story}
          index={0}
          onDetail={() => setDetailSection("story")}
        />
        <InfoSection
          icon={<CalendarDays className="w-5 h-5" />}
          title={t("history") || "Lịch sử hình thành"}
          content={org.history}
          index={1}
          onDetail={() => setDetailSection("history")}
        />
        <InfoSection
          icon={<Target className="w-5 h-5" />}
          title={t("mission") || "Sứ mệnh"}
          content={org.mission}
          index={2}
          onDetail={() => setDetailSection("mission")}
        />
        <InfoSection
          icon={<Trophy className="w-5 h-5" />}
          title={t("achievements") || "Thành tích"}
          content={org.achievements.join("\n")}
          index={3}
          onDetail={() => setDetailSection("achievements")}
        />
      </div>

      {/* Partners & Related Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Partners */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <Handshake className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-black">
              {t("partners") || "Đối tác hiện có"}
            </h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            {t("partnersSubtitle") || "Cộng đồng hành – Cùng phát triển"}
          </p>
          <div className="grid grid-cols-5 gap-3">
            {org.partners.map((partner) => (
              <a
                key={partner.id}
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-3 rounded-xl border border-gray-100 hover:border-[#C62828] hover:shadow-sm transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center mb-2 group-hover:bg-[#C62828]/10">
                  {partner.logoUrl ? (
                    <img
                      src={partner.logoUrl}
                      alt={partner.name}
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <span className="text-lg font-bold text-gray-400 group-hover:text-[#C62828]">
                      {partner.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium text-gray-700 text-center truncate w-full">
                  {partner.name}
                </span>
                <span className="text-[10px] text-gray-400 truncate w-full text-center">
                  {partner.website.replace("https://", "")}
                </span>
                <ExternalLink className="w-3 h-3 text-gray-300 mt-1" />
              </a>
            ))}
          </div>
          <button className="w-full mt-4 py-2.5 rounded-xl bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
            {t("viewAllPartners") || "Xem tất cả đối tác"}
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </motion.div>

        {/* Related Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
        >
          <h3 className="font-bold text-black mb-1">
            {t("relatedLinks") || "Trang web liên quan"}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {t("relatedLinksSubtitle") ||
              "Kết nối và cập nhật thông tin mới nhất từ chúng tôi"}
          </p>
          <div className="space-y-2">
            {org.socialLinks.map((link) => (
              <a
                key={link.platform}
                href={
                  link.url.startsWith("http")
                    ? link.url
                    : `https://${link.url}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-[#C62828] hover:bg-gray-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                    {PLATFORM_ICONS[link.platform] || (
                      <LinkIcon className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black">
                      {link.platform}
                    </p>
                    <p className="text-xs text-gray-400">{link.url}</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-[#C62828]" />
              </a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Edit Dialog */}
      {isEditOpen && (
        <EditOrgDialog
          org={org}
          onClose={() => setIsEditOpen(false)}
          onSave={handleSave}
        />
      )}

      {/* Detail Modal */}
      {detailSection && (
        <DetailModal
          section={detailSection}
          org={org}
          onClose={() => setDetailSection(null)}
        />
      )}
    </div>
  );
}

// Missing Handshake import workaround
function Handshake({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m11 17 2 2a1 1 0 1 0 3-3" />
      <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.5-3.5a1 1 0 0 0-1.5 0L12 14" />
      <path d="m11 17-2 2a1 1 0 1 1-3-3l3.5-3.5a1 1 0 0 1 1.5 0L15 14" />
      <path d="M8.5 12.5 11 10" />
      <path d="m11 10 3-3a1 1 0 0 0-3-3l-2.5 2.5" />
      <path d="m15 6 2-2a1 1 0 0 0-3-3l-3.5 3.5a1 1 0 0 0 0 1.5L11 10" />
      <path d="M2 21a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1z" />
      <path d="M20 21a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1z" />
      <path d="m4.5 16.5 3-3" />
      <path d="m17.5 16.5-3-3" />
    </svg>
  );
}

function EditOrgDialog({
  org,
  onClose,
  onSave,
}: {
  org: OrganizationData;
  onClose: () => void;
  onSave: (data: OrganizationData) => void;
}) {
  const [form, setForm] = useState<OrganizationData>({ ...org });
  const [activeTab, setActiveTab] = useState<
    "basic" | "content" | "partners" | "social"
  >("basic");

  const handleChange = (field: keyof OrganizationData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "avatarUrl" | "bannerUrl"
  ) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleChange(field, event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const parseBannerPosition = (pos?: string) => {
    if (!pos) return { x: 50, y: 50 };
    const parts = pos.split(" ");
    const parse = (v: string) => {
      if (v.endsWith("%")) return parseInt(v);
      if (v === "left") return 0;
      if (v === "center") return 50;
      if (v === "right") return 100;
      if (v === "top") return 0;
      if (v === "bottom") return 100;
      return 50;
    };
    return {
      x: parse(parts[0] || "center"),
      y: parse(parts[1] || "center"),
    };
  };

  const handleBannerPositionChange = (axis: "x" | "y", value: number) => {
    const current = parseBannerPosition(form.bannerPosition);
    const newPos = axis === "x"
      ? `${value}% ${current.y}%`
      : `${current.x}% ${value}%`;
    handleChange("bannerPosition", newPos);
  };

  const handlePartnerChange = (
    index: number,
    field: keyof Partner,
    value: string
  ) => {
    const updated = [...form.partners];
    updated[index] = { ...updated[index], [field]: value };
    setForm((prev) => ({ ...prev, partners: updated }));
  };

  const addPartner = () => {
    setForm((prev) => ({
      ...prev,
      partners: [
        ...prev.partners,
        { id: `p-${Date.now()}`, name: "", website: "", logoUrl: "" },
      ],
    }));
  };

  const removePartner = (index: number) => {
    setForm((prev) => ({
      ...prev,
      partners: prev.partners.filter((_, i) => i !== index),
    }));
  };

  const handleSocialChange = (
    index: number,
    field: keyof SocialLink,
    value: string
  ) => {
    const updated = [...form.socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    setForm((prev) => ({ ...prev, socialLinks: updated }));
  };

  const handleAchievementChange = (index: number, value: string) => {
    const updated = [...form.achievements];
    updated[index] = value;
    setForm((prev) => ({ ...prev, achievements: updated }));
  };

  const addAchievement = () => {
    setForm((prev) => ({
      ...prev,
      achievements: [...prev.achievements, ""],
    }));
  };

  const removeAchievement = (index: number) => {
    setForm((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-[#C62828]">
          <h2 className="text-lg font-bold text-white">Chỉnh sửa thông tin tổ chức</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-2 border-b border-gray-100 bg-gray-50">
          {[
            { key: "basic", label: "Cơ bản" },
            { key: "content", label: "Nội dung" },
            { key: "partners", label: "Đối tác" },
            { key: "social", label: "Liên kết" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-white text-[#C62828] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
          {activeTab === "basic" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Logo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "avatarUrl")}
                    className="w-full text-sm"
                  />
                  {form.avatarUrl && (
                    <img
                      src={form.avatarUrl}
                      alt="Avatar"
                      className="w-16 h-16 rounded-lg mt-2 object-cover"
                    />
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Ảnh bìa
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "bannerUrl")}
                    className="w-full text-sm"
                  />
                  {form.bannerUrl && (
                    <>
                      <div className="w-full h-24 rounded-lg mt-2 overflow-hidden border border-gray-200">
                        <img
                          src={form.bannerUrl}
                          alt="Banner"
                          className="w-full h-full object-cover"
                          style={{ objectPosition: form.bannerPosition || "center center" }}
                        />
                      </div>
                      <div className="mt-3 space-y-2">
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Vị trí ngang (X)</label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={parseBannerPosition(form.bannerPosition).x}
                            onChange={(e) => handleBannerPositionChange("x", parseInt(e.target.value))}
                            className="w-full accent-[#C62828]"
                          />
                          <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                            <span>Trái</span>
                            <span>Giữa</span>
                            <span>Phải</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Vị trí dọc (Y)</label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={parseBannerPosition(form.bannerPosition).y}
                            onChange={(e) => handleBannerPositionChange("y", parseInt(e.target.value))}
                            className="w-full accent-[#C62828]"
                          />
                          <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                            <span>Trên</span>
                            <span>Giữa</span>
                            <span>Dưới</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Tên tổ chức
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-black focus:border-[#C62828] outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Slogan
                </label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={(e) => handleChange("tagline", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-black focus:border-[#C62828] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Địa điểm
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-black focus:border-[#C62828] outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-black focus:border-[#C62828] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Website
                </label>
                <input
                  type="text"
                  value={form.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-black focus:border-[#C62828] outline-none"
                />
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Thành viên
                  </label>
                  <input
                    type="number"
                    value={form.stats.members}
                    onChange={(e) =>
                      handleChange("stats", {
                        ...form.stats,
                        members: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-black focus:border-[#C62828] outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Nhóm
                  </label>
                  <input
                    type="number"
                    value={form.stats.teams}
                    onChange={(e) =>
                      handleChange("stats", {
                        ...form.stats,
                        teams: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-black focus:border-[#C62828] outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Hoạt động
                  </label>
                  <input
                    type="number"
                    value={form.stats.activities}
                    onChange={(e) =>
                      handleChange("stats", {
                        ...form.stats,
                        activities: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-black focus:border-[#C62828] outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Năm
                  </label>
                  <input
                    type="number"
                    value={form.stats.yearsActive}
                    onChange={(e) =>
                      handleChange("stats", {
                        ...form.stats,
                        yearsActive: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-black focus:border-[#C62828] outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === "content" && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Câu chuyện
                </label>
                <textarea
                  value={form.story}
                  onChange={(e) => handleChange("story", e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-black focus:border-[#C62828] outline-none resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Lịch sử hình thành
                </label>
                <textarea
                  value={form.history}
                  onChange={(e) => handleChange("history", e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-black focus:border-[#C62828] outline-none resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Sứ mệnh
                </label>
                <textarea
                  value={form.mission}
                  onChange={(e) => handleChange("mission", e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-black focus:border-[#C62828] outline-none resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Thành tích
                </label>
                <div className="space-y-2">
                  {form.achievements.map((achievement, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={achievement}
                        onChange={(e) =>
                          handleAchievementChange(index, e.target.value)
                        }
                        className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm text-black focus:border-[#C62828] outline-none"
                        placeholder={`Thành tích ${index + 1}`}
                      />
                      <button
                        onClick={() => removeAchievement(index)}
                        className="px-3 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 text-sm"
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addAchievement}
                  className="mt-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm hover:bg-gray-200 transition-colors"
                >
                  + Thêm thành tích
                </button>
              </div>
            </>
          )}

          {activeTab === "partners" && (
            <>
              <div className="space-y-3">
                {form.partners.map((partner, index) => (
                  <div
                    key={partner.id}
                    className="p-3 rounded-xl border border-gray-200 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Đối tác {index + 1}
                      </span>
                      <button
                        onClick={() => removePartner(index)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Xóa
                      </button>
                    </div>
                    <input
                      type="text"
                      value={partner.name}
                      onChange={(e) =>
                        handlePartnerChange(index, "name", e.target.value)
                      }
                      placeholder="Tên đối tác"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-black focus:border-[#C62828] outline-none"
                    />
                    <input
                      type="text"
                      value={partner.website}
                      onChange={(e) =>
                        handlePartnerChange(index, "website", e.target.value)
                      }
                      placeholder="Website"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-black focus:border-[#C62828] outline-none"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && file.type.startsWith("image/")) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            handlePartnerChange(
                              index,
                              "logoUrl",
                              event.target?.result as string
                            );
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-sm"
                    />
                    {partner.logoUrl && (
                      <img
                        src={partner.logoUrl}
                        alt={partner.name}
                        className="w-10 h-10 rounded object-contain"
                      />
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addPartner}
                className="w-full py-2.5 rounded-xl bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                + Thêm đối tác
              </button>
            </>
          )}

          {activeTab === "social" && (
            <div className="space-y-3">
              {form.socialLinks.map((link, index) => (
                <div
                  key={link.platform}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-200"
                >
                  <span className="text-sm font-medium text-gray-700 w-24">
                    {link.platform}
                  </span>
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) =>
                      handleSocialChange(index, "url", e.target.value)
                    }
                    className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-black focus:border-[#C62828] outline-none"
                    placeholder="URL"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={() => onSave(form)}
            className="px-4 py-2 rounded-xl bg-[#C62828] text-white text-sm font-medium hover:bg-[#A52020] transition-colors"
          >
            Lưu thay đổi
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function DetailModal({
  section,
  org,
  onClose,
}: {
  section: string;
  org: OrganizationData;
  onClose: () => void;
}) {
  const sectionData: Record<string, { title: string; content: string | string[]; icon: React.ReactNode }> = {
    story: {
      title: "Câu chuyện",
      content: org.story,
      icon: <BookOpen className="w-6 h-6 text-red-500" />,
    },
    history: {
      title: "Lịch sử hình thành",
      content: org.history,
      icon: <CalendarDays className="w-6 h-6 text-orange-500" />,
    },
    mission: {
      title: "Sứ mệnh",
      content: org.mission,
      icon: <Target className="w-6 h-6 text-green-500" />,
    },
    achievements: {
      title: "Thành tích",
      content: org.achievements,
      icon: <Trophy className="w-6 h-6 text-purple-500" />,
    },
  };

  const data = sectionData[section];
  if (!data) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          {data.icon}
          <h2 className="text-xl font-bold text-black">{data.title}</h2>
        </div>
        <div className="space-y-3">
          {Array.isArray(data.content) ? (
            data.content.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C62828] mt-2 shrink-0" />
                <p className="text-sm text-gray-700">{item}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-700 leading-relaxed">
              {data.content}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Đóng
        </button>
      </motion.div>
    </div>
  );
}
