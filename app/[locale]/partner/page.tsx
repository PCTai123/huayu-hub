"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Globe,
  Mail,
  MapPin,
  ExternalLink,
  BookOpen,
  CalendarDays,
  Target,
  Trophy,
  Users,
  Newspaper,
  Activity,
  ChevronDown,
  ChevronUp,
  LogIn,
  Link as LinkIcon,
} from "lucide-react";
import {
  getOrganization,
  subscribeToOrganization,
  type OrganizationData,
  type Partner,
  type SocialLink,
} from "@/lib/organization-store";
import { getMembers, subscribeToMembers, type Member } from "@/lib/member-service";
import { getPosts, subscribeToPosts, type Post } from "@/lib/news-feed-store";
import { getActivities, subscribeToActivities } from "@/lib/activity-store";
import type { Activity as ActivityType } from "@/features/activities/components/activity-card";

/* ───────────────────── helpers ───────────────────── */

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
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

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  Facebook: <FacebookIcon className="w-5 h-5" />,
  Instagram: <InstagramIcon className="w-5 h-5" />,
  YouTube: <YoutubeIcon className="w-5 h-5" />,
  TikTok: <TiktokIcon className="w-5 h-5" />,
  Website: <Globe className="w-5 h-5" />,
};

/* ───────────────────── Section wrapper ───────────────────── */

function Section({
  id,
  title,
  icon: Icon,
  children,
}: {
  id: string;
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#C62828]/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#C62828]" />
        </div>
        <h2 className="text-xl font-bold text-[#2D2D2D]" style={{ fontFamily: "var(--font-poppins)" }}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

/* ───────────────────── Animated card ───────────────────── */

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className={`rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ════════════════════════════════════════════ */
/*                    MAIN PAGE                 */
/* ════════════════════════════════════════════ */

export default function PartnerPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "vi";

  /* Data states */
  const [org, setOrg] = useState<OrganizationData | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activities, setActivities] = useState<ActivityType[]>([]);

  /* Accordion states */
  const [openSection, setOpenSection] = useState<Record<string, boolean>>({
    story: true,
    history: true,
    mission: true,
    achievements: true,
    partners: true,
    members: true,
    news: true,
    activities: true,
  });

  /* Load data */
  useEffect(() => {
    setOrg(getOrganization());
    setMembers(getMembers());
    setPosts(getPosts());
    setActivities(getActivities());

    const unsubOrg = subscribeToOrganization((d) => setOrg(d));
    const unsubMem = subscribeToMembers((m) => setMembers(m));
    const unsubPost = subscribeToPosts((p) => setPosts(p));
    const unsubAct = subscribeToActivities((a) => setActivities(a));

    return () => {
      unsubOrg();
      unsubMem();
      unsubPost();
      unsubAct();
    };
  }, []);

  if (!org) return null;

  const toggle = (key: string) =>
    setOpenSection((prev) => ({ ...prev, [key]: !prev[key] }));

  /* ─────────────── Navbar ─────────────── */
  const navLinks = [
    { label: "Tổng quan", href: "#overview" },
    { label: "Câu chuyện", href: "#story" },
    { label: "Thành viên", href: "#members" },
    { label: "Tin tức", href: "#news" },
    { label: "Hoạt động", href: "#activities" },
  ];

  return (
    <div className="min-h-screen bg-[#F6F1E8]">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-50 bg-[#F6F1E8]/90 backdrop-blur-md border-b border-[#C62828]/10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}/partner`} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#C62828] flex items-center justify-center text-white font-bold text-sm">
              H
            </div>
            <span className="font-bold text-[#C62828] text-lg hidden sm:inline" style={{ fontFamily: "var(--font-poppins)" }}>
              Huayu Hub
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:text-[#C62828] hover:bg-[#C62828]/5 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <Link
            href={`/${locale}/login`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C62828] text-white text-sm font-medium hover:bg-[#A02020] transition-colors shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">Đăng nhập</span>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-12">
        {/* ═══════════ OVERVIEW (Hero) ═══════════ */}
        <section id="overview" className="text-center py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 rounded-2xl bg-[#C62828] mx-auto mb-4 flex items-center justify-center shadow-xl shadow-[#C62828]/20">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h1
              className="text-3xl sm:text-4xl font-bold text-[#2D2D2D] mb-2"
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              {org.name}
            </h1>
            <p className="text-lg text-[#C62828] font-medium mb-6">
              {org.tagline}
            </p>

            {/* Quick info chips */}
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { icon: MapPin, text: org.location },
                { icon: Mail, text: org.email },
                { icon: Globe, text: org.website },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-100 shadow-sm text-sm text-gray-600"
                >
                  <item.icon className="w-4 h-4 text-[#C62828]" />
                  {item.text}
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ═══════════ STATS ═══════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Thành viên", value: `${org.stats.members}+`, icon: Users },
            { label: "Đội nhóm", value: org.stats.teams, icon: Users },
            { label: "Hoạt động", value: `${org.stats.activities}+`, icon: Activity },
            { label: "Năm hoạt động", value: `${org.stats.yearsActive}+`, icon: CalendarDays },
          ].map((stat) => (
            <Card key={stat.label}>
              <div className="p-5 text-center">
                <stat.icon className="w-6 h-6 text-[#C62828] mx-auto mb-2" />
                <div className="text-2xl font-bold text-[#2D2D2D]">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* ═══════════ STORY / HISTORY / MISSION ═══════════ */}
        <Section id="story" title="Về chúng tôi" icon={BookOpen}>
          <div className="space-y-4">
            {/* Story */}
            <Card>
              <button
                onClick={() => toggle("story")}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-[#C62828]" />
                  <span className="font-semibold text-[#2D2D2D]">Câu chuyện</span>
                </div>
                {openSection.story ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
              {openSection.story && (
                <div className="px-5 pb-5">
                  <p className="text-gray-600 leading-relaxed">{org.story}</p>
                </div>
              )}
            </Card>

            {/* History */}
            <Card>
              <button
                onClick={() => toggle("history")}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <div className="flex items-center gap-3">
                  <CalendarDays className="w-5 h-5 text-[#C62828]" />
                  <span className="font-semibold text-[#2D2D2D]">Lịch sử hình thành</span>
                </div>
                {openSection.history ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
              {openSection.history && (
                <div className="px-5 pb-5">
                  <p className="text-gray-600 leading-relaxed">{org.history}</p>
                </div>
              )}
            </Card>

            {/* Mission */}
            <Card>
              <button
                onClick={() => toggle("mission")}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-[#C62828]" />
                  <span className="font-semibold text-[#2D2D2D]">Sứ mệnh</span>
                </div>
                {openSection.mission ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
              {openSection.mission && (
                <div className="px-5 pb-5">
                  <p className="text-gray-600 leading-relaxed">{org.mission}</p>
                </div>
              )}
            </Card>

            {/* Achievements */}
            <Card>
              <button
                onClick={() => toggle("achievements")}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-[#C62828]" />
                  <span className="font-semibold text-[#2D2D2D]">Thành tích</span>
                </div>
                {openSection.achievements ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
              {openSection.achievements && (
                <div className="px-5 pb-5">
                  <ul className="space-y-2">
                    {org.achievements.map((ach, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-600">
                        <Trophy className="w-4 h-4 text-[#C62828] shrink-0 mt-0.5" />
                        {ach}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          </div>
        </Section>

        {/* ═══════════ PARTNERS ═══════════ */}
        <Section id="partners" title="Đối tác" icon={Globe}>
          <Card>
            <div className="p-5">
              <p className="text-sm text-gray-500 mb-4">Cộng đồng hành – Cùng phát triển</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {org.partners.map((partner) => (
                  <a
                    key={partner.id}
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-4 rounded-xl border border-gray-100 hover:border-[#C62828] hover:shadow-sm transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#C62828]/10 flex items-center justify-center mb-2 group-hover:bg-[#C62828]/20 transition-colors">
                      <Globe className="w-6 h-6 text-[#C62828]" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 text-center">{partner.name}</span>
                    <span className="text-xs text-gray-400 mt-1 truncate max-w-full">{partner.website.replace(/^https?:\/\//, "")}</span>
                  </a>
                ))}
              </div>
            </div>
          </Card>
        </Section>

        {/* ═══════════ SOCIAL LINKS ═══════════ */}
        {org.socialLinks.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3">
            {org.socialLinks.map((link) => (
              <a
                key={link.platform}
                href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-100 hover:border-[#C62828] hover:text-[#C62828] transition-colors text-sm text-gray-600 shadow-sm"
              >
                {SOCIAL_ICONS[link.platform] || <Globe className="w-5 h-5" />}
              </a>
            ))}
          </div>
        )}

        {/* ═══════════ MEMBERS (Org Chart simplified) ═══════════ */}
        <Section id="members" title="Thành viên chủ chốt" icon={Users}>
          <Card>
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.slice(0, 9).map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#C62828]/10 flex items-center justify-center shrink-0">
                      <span className="text-[#C62828] font-bold text-sm">
                        {member.fullName.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-[#2D2D2D] truncate">{member.fullName}</div>
                      <div className="text-xs text-[#C62828]">{member.role}</div>
                      <div className="text-xs text-gray-500">{member.team}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Section>

        {/* ═══════════ NEWS ═══════════ */}
        <Section id="news" title="Tin tức" icon={Newspaper}>
          <div className="space-y-4">
            {posts
              .filter((p) => p.visibility === "public")
              .slice(0, 5)
              .map((post) => (
                <Card key={post.id}>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-[#C62828]/10 flex items-center justify-center">
                        <span className="text-[#C62828] text-xs font-bold">
                          {post.author.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#2D2D2D]">{post.author.name}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                    </div>
                    <h3 className="font-semibold text-[#2D2D2D] mb-2">{post.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-3">{post.content}</p>
                    {post.images.length > 0 && (
                      <div className="mt-3 rounded-xl overflow-hidden">
                        <img
                          src={post.images[0]}
                          alt={post.title}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      <span>{post.likes} thích</span>
                      <span>{post.comments.length} bình luận</span>
                      <span>{post.views} lượt xem</span>
                    </div>
                  </div>
                </Card>
              ))}
            {posts.filter((p) => p.visibility === "public").length === 0 && (
              <div className="text-center py-8 text-gray-400">Chưa có tin tức công khai</div>
            )}
          </div>
        </Section>

        {/* ═══════════ ACTIVITIES ═══════════ */}
        <Section id="activities" title="Hoạt động" icon={Activity}>
          <div className="space-y-4">
            {activities.slice(0, 6).map((activity) => (
              <Card key={activity.id}>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#2D2D2D] mb-1">{activity.name}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mb-2">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {activity.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5" />
                          {activity.topic}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            activity.status === "upcoming"
                              ? "bg-green-50 text-green-600"
                              : activity.status === "ongoing"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {activity.status === "upcoming"
                            ? "Sắp diễn ra"
                            : activity.status === "ongoing"
                            ? "Đang diễn ra"
                            : "Đã kết thúc"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{activity.description}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {activities.length === 0 && (
              <div className="text-center py-8 text-gray-400">Chưa có hoạt động</div>
            )}
          </div>
        </Section>

        {/* ═══════════ FOOTER ═══════════ */}
        <footer className="border-t border-gray-200 pt-8 pb-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#C62828] flex items-center justify-center text-white font-bold text-sm">
              H
            </div>
            <span className="font-bold text-[#2D2D2D]" style={{ fontFamily: "var(--font-poppins)" }}>
              Huayu Hub
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-4">{org.tagline}</p>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <span>{org.email}</span>
            <span>•</span>
            <span>{org.website}</span>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            © 2026 {org.name}. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}
