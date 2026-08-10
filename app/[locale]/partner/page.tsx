"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import {
  Building2,
  Globe,
  Mail,
  MapPin,
  BookOpen,
  CalendarDays,
  Target,
  Trophy,
  Users,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Award,
  Megaphone,
  Check,
} from "lucide-react";
import {
  getOrganization,
  subscribeToOrganization,
  fetchOrganizationFromSupabase,
  type OrganizationData,
  type Partner,
  type SocialLink,
  type FeedbackImage,
  type CertificateImage,
} from "@/lib/organization-store";
import {
  getMembers,
  subscribeToMembers,
  fetchMembersFromSupabase,
  type Member,
} from "@/lib/member-service";

/* ───────────────────── Social SVG icons ───────────────────── */

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
/*           INFINITE CAROUSEL                  */
/* ════════════════════════════════════════════ */

function InfiniteCarousel({
  images,
  yearsOldLabel,
}: {
  images: (FeedbackImage | CertificateImage)[];
  yearsOldLabel: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || images.length <= 5) return;
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let startTime: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      if (elapsed > 16) {
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
          scrollContainer.scrollLeft = 0;
        } else {
          scrollContainer.scrollLeft += 1;
        }
        startTime = timestamp;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused, images.length]);

  // Duplicate images for infinite loop
  const displayImages = images.length > 5 ? [...images, ...images] : images;

  // Split into 2 rows
  const midPoint = Math.ceil(displayImages.length / 2);
  const row1 = displayImages.slice(0, midPoint);
  const row2 = displayImages.slice(midPoint);

  return (
    <div
      className="space-y-3"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <CarouselRow images={row1} scrollRef={scrollRef} yearsOldLabel={yearsOldLabel} />
      {row2.length > 0 && <CarouselRow images={row2} scrollRef={null} yearsOldLabel={yearsOldLabel} />}
    </div>
  );
}

function CarouselRow({
  images,
  scrollRef,
  yearsOldLabel,
}: {
  images: (FeedbackImage | CertificateImage)[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  yearsOldLabel: string;
}) {
  return (
    <div
      ref={scrollRef}
      className="flex gap-4 overflow-x-auto scrollbar-hide"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {images.map((img, idx) => (
        <div
          key={`${img.id}-${idx}`}
          className="flex-shrink-0 w-48 sm:w-56 rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow group"
        >
          {/* Image */}
          <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
            <img
              src={img.imageUrl}
              alt={img.fullName || `Image ${idx + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          {/* Info */}
          <div className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-bold text-[#2D2D2D] truncate">
                {img.fullName || ""}
              </h4>
              {img.age && (
                <span className="text-xs text-gray-400 shrink-0">
                  {img.age} {yearsOldLabel}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 line-clamp-2">
              {img.description || ""}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════ */
/*                    MAIN PAGE                 */
/* ════════════════════════════════════════════ */

const TEAM_CONFIG: Record<string, { color: string; bg: string; labelKey: string }> = {
  media: { color: "text-red-500", bg: "bg-red-50", labelKey: "teams_labels.media" },
  design: { color: "text-orange-500", bg: "bg-orange-50", labelKey: "teams_labels.design" },
  content: { color: "text-yellow-500", bg: "bg-yellow-50", labelKey: "teams_labels.content" },
  "teaching-assistant": { color: "text-green-500", bg: "bg-green-50", labelKey: "teams_labels.teaching-assistant" },
  operation: { color: "text-blue-500", bg: "bg-blue-50", labelKey: "teams_labels.operation" },
  partner: { color: "text-purple-500", bg: "bg-purple-50", labelKey: "teams_labels.partner" },
  executive: { color: "text-[#C62828]", bg: "bg-red-50", labelKey: "teams_labels.executive" },
};

const teamNameToId: Record<string, string> = {
  Media: "media",
  Design: "design",
  Content: "content",
  "Teaching Assistant": "teaching-assistant",
  Operation: "operation",
  Partner: "partner",
  Executive: "executive",
};

const LANGUAGES = [
  { code: "vi", label: "Tieng Viet", flag: "🇻🇳" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
];

export default function PartnerPage() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("partner");

  const [org, setOrg] = useState<OrganizationData | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [langOpen, setLangOpen] = useState(false);

  const [openSection, setOpenSection] = useState<Record<string, boolean>>({
    story: true,
    history: true,
    mission: true,
    achievements: true,
  });

  useEffect(() => {
    // Fetch from Supabase on mount (overrides localStorage)
    fetchOrganizationFromSupabase().then((orgData) => {
      setOrg(orgData);
    });
    fetchMembersFromSupabase().then((fetched) => {
      setMembers(fetched);
    });

    const unsubOrg = subscribeToOrganization((d) => setOrg(d));
    const unsubMem = subscribeToMembers((m) => setMembers(m));

    return () => {
      unsubOrg();
      unsubMem();
    };
  }, []);

  if (!org) return null;

  const toggle = (key: string) =>
    setOpenSection((prev) => ({ ...prev, [key]: !prev[key] }));

  const founder = members.find((m) => m.role === "Founder");
  const coFounders = members.filter((m) => m.role === "Co-Founder");
  const teamMembers = members.filter((m) => m.role !== "Founder" && m.role !== "Co-Founder");

  const membersByTeam: Record<string, Member[]> = {};
  teamMembers.forEach((member) => {
    const teamId = teamNameToId[member.team] || "other";
    if (!membersByTeam[teamId]) membersByTeam[teamId] = [];
    membersByTeam[teamId].push(member);
  });

  const teams = Object.entries(membersByTeam)
    .filter(([id]) => id !== "other")
    .map(([id, teamMembers]) => ({
      id,
      config: TEAM_CONFIG[id] || { color: "text-gray-500", bg: "bg-gray-50", labelKey: id },
      members: teamMembers,
    }));

  const vis = org.sectionVisibility;
  const hasBackground = !!org.backgroundUrl;

  const navLinks = [
    ...(vis.overview ? [{ label: t("nav.overview"), href: "#overview" }] : []),
    ...(vis.story ? [{ label: t("nav.story"), href: "#story" }] : []),
    ...(vis.members ? [{ label: t("nav.members"), href: "#members" }] : []),
    ...(vis.feedback ? [{ label: t("nav.feedback"), href: "#feedback" }] : []),
    ...(vis.certificates ? [{ label: t("nav.certificates"), href: "#certificates" }] : []),
  ];

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundColor: "#F6F1E8",
        backgroundImage: hasBackground ? `url(${org.backgroundUrl})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay for readability when background is set */}
      {hasBackground && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundColor: "rgba(246, 241, 232, 0.85)",
            zIndex: 0,
          }}
        />
      )}

      <div className="relative" style={{ zIndex: 1 }}>
        {/* ── Sticky Header ── */}
        <header className="sticky top-0 z-50 bg-[#F6F1E8]/90 backdrop-blur-md border-b border-[#C62828]/10">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href={`/${locale}/partner`} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#C62828] flex items-center justify-center text-white font-bold text-sm">
                H
              </div>
              <span className="font-bold text-[#C62828] text-lg hidden sm:inline" style={{ fontFamily: "var(--font-poppins)" }}>
                Huayu Hub
              </span>
            </Link>

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

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:text-[#C62828] hover:bg-[#C62828]/5 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {LANGUAGES.find((l) => l.code === locale)?.label || locale}
                </span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {langOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setLangOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[140px]">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          const newPath = pathname.replace(`/${locale}`, `/${lang.code}`);
                          router.push(newPath);
                          setLangOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                          locale === lang.code
                            ? "text-[#C62828] font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                        {locale === lang.code && (
                          <Check className="w-3.5 h-3.5 ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8 space-y-12">
          {/* ═══════════ OVERVIEW ═══════════ */}
          {vis.overview && (
            <section id="overview">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm"
              >
                {/* Banner */}
                <div
                  className="relative w-full bg-gradient-to-r from-red-50 via-orange-50 to-amber-50"
                  style={{ aspectRatio: "851 / 315" }}
                >
                  {org.bannerUrl ? (
                    <img
                      src={org.bannerUrl}
                      alt="Banner"
                      className="w-full h-full object-cover"
                      style={{ objectPosition: org.bannerPosition || "center" }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-16 h-16 text-[#C62828]/20" />
                    </div>
                  )}
                </div>

                {/* Avatar + Info */}
                <div className="px-6 pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 relative z-10">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-white shrink-0">
                      {org.avatarUrl ? (
                        <img src={org.avatarUrl} alt={org.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#C62828] flex items-center justify-center text-white font-bold text-2xl">
                          {org.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 pb-1">
                      <h1 className="text-2xl sm:text-3xl font-bold text-[#2D2D2D]">
                        {org.name}
                      </h1>
                      <p className="text-[#C62828] font-medium">
                        {org.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Social Links */}
                  {org.socialLinks.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {org.socialLinks.map((link) => (
                        <a
                          key={link.platform}
                          href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#C62828] hover:text-[#C62828] transition-colors text-sm text-gray-600"
                        >
                          {SOCIAL_ICONS[link.platform] || <Globe className="w-4 h-4" />}
                          <span className="hidden sm:inline">{link.platform}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Quick info chips */}
                  <div className="flex flex-wrap gap-3 mt-4">
                    {[
                      { icon: MapPin, text: org.location },
                      { icon: Mail, text: org.email },
                      { icon: Globe, text: org.website },
                    ].map((item) => (
                      <div
                        key={item.text}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-sm text-gray-600"
                      >
                        <item.icon className="w-4 h-4 text-[#C62828]" />
                        {item.text}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </section>
          )}

          {/* ═══════════ AD BANNER TOP ═══════════ */}
          {vis.adBannerTop && org.adBannerTopUrl && (
            <section id="ad-banner-top">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
                style={{ aspectRatio: "4 / 1" }}
              >
                <img
                  src={org.adBannerTopUrl}
                  alt="Advertisement"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: org.adBannerTopPosition || "center center" }}
                />
              </motion.div>
            </section>
          )}

          {/* ═══════════ STATS ═══════════ */}
          {vis.overview && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: t("stats.members"), value: `${org.stats.members}+`, icon: Users },
                { label: t("stats.teams"), value: org.stats.teams, icon: Users },
                { label: t("stats.activities"), value: `${org.stats.activities}+`, icon: CalendarDays },
                { label: t("stats.yearsActive"), value: `${org.stats.yearsActive}+`, icon: CalendarDays },
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
          )}

          {/* ═══════════ STORY ═══════════ */}
          {vis.story && (
            <Section id="story" title={t("sections.aboutUs")} icon={BookOpen}>
              <div className="space-y-4">
                <Card>
                  <button
                    onClick={() => toggle("story")}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-[#C62828]" />
                      <span className="font-semibold text-[#2D2D2D]">{t("sections.story")}</span>
                    </div>
                    {openSection.story ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </button>
                  {openSection.story && (
                    <div className="px-5 pb-5">
                      <p className="text-gray-600 leading-relaxed">{org.story}</p>
                    </div>
                  )}
                </Card>

                <Card>
                  <button
                    onClick={() => toggle("history")}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <CalendarDays className="w-5 h-5 text-[#C62828]" />
                      <span className="font-semibold text-[#2D2D2D]">{t("sections.history")}</span>
                    </div>
                    {openSection.history ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </button>
                  {openSection.history && (
                    <div className="px-5 pb-5">
                      <p className="text-gray-600 leading-relaxed">{org.history}</p>
                    </div>
                  )}
                </Card>

                <Card>
                  <button
                    onClick={() => toggle("mission")}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-[#C62828]" />
                      <span className="font-semibold text-[#2D2D2D]">{t("sections.mission")}</span>
                    </div>
                    {openSection.mission ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </button>
                  {openSection.mission && (
                    <div className="px-5 pb-5">
                      <p className="text-gray-600 leading-relaxed">{org.mission}</p>
                    </div>
                  )}
                </Card>

                <Card>
                  <button
                    onClick={() => toggle("achievements")}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-[#C62828]" />
                      <span className="font-semibold text-[#2D2D2D]">{t("sections.achievements")}</span>
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
          )}

          {/* ═══════════ PARTNERS ═══════════ */}
          {vis.partners && (
            <Section id="partners" title={t("sections.partners")} icon={Globe}>
              <Card>
                <div className="p-5">
                  <p className="text-sm text-gray-500 mb-6">{t("sections.partnersSubtitle")}</p>
                  <div className="flex flex-wrap justify-center gap-4">
                    {org.partners.map((partner) => (
                      <a
                        key={partner.id}
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center w-[140px] sm:w-[160px] p-4 rounded-xl border border-gray-100 hover:border-[#C62828] hover:shadow-md transition-all group bg-white"
                      >
                        {/* Avatar / Logo — 1:1 ratio */}
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-3 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center group-hover:ring-2 group-hover:ring-[#C62828]/20 transition-all">
                          {partner.logoUrl ? (
                            <img
                              src={partner.logoUrl}
                              alt={partner.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <Globe className="w-8 h-8 text-[#C62828]/60" />
                          )}
                        </div>
                        {/* Name */}
                        <span className="text-sm font-semibold text-gray-800 text-center leading-tight line-clamp-2 min-h-[2.5rem]">
                          {partner.name}
                        </span>
                        {/* Website link hint */}
                        <span className="text-[10px] text-gray-400 mt-1.5 truncate max-w-full">
                          {partner.website.replace(/^https?:\/\//, "")}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </Card>
            </Section>
          )}

          {/* ═══════════ FEEDBACK ═══════════ */}
          {vis.feedback && org.feedbackImages.length > 0 && (
            <Section id="feedback" title={t("sections.feedback")} icon={MessageSquare}>
              <Card>
                <div className="p-5">
                  <p className="text-sm text-gray-500 mb-4">
                    {t("sections.feedbackSubtitle")}
                  </p>
                  <InfiniteCarousel images={org.feedbackImages} yearsOldLabel={t("yearsOld")} />
                </div>
              </Card>
            </Section>
          )}

          {/* ═══════════ CERTIFICATES ═══════════ */}
          {vis.certificates && org.certificateImages.length > 0 && (
            <Section id="certificates" title={t("sections.certificates")} icon={Award}>
              <Card>
                <div className="p-5">
                  <p className="text-sm text-gray-500 mb-4">
                    {t("sections.certificatesSubtitle")}
                  </p>
                  <InfiniteCarousel images={org.certificateImages} yearsOldLabel={t("yearsOld")} />
                </div>
              </Card>
            </Section>
          )}

          {/* ═══════════ MEMBERS ═══════════ */}
          {vis.members && (
            <Section id="members" title={t("sections.members")} icon={Users}>
              <div className="space-y-8">
                {(founder || coFounders.length > 0) && (
                  <div>
                    <div className="flex items-center justify-center mb-4">
                      <div className="px-4 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wider shadow-sm">
                        {t("leadership")}
                      </div>
                    </div>
                    <div className="flex justify-center gap-6 flex-wrap">
                      {founder && (
                        <motion.div
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                          className="bg-white rounded-2xl border-2 border-[#C62828] shadow-lg p-4 w-52 text-center"
                        >
                          <div className="w-14 h-14 rounded-full border-2 border-white shadow-md overflow-hidden bg-gray-100 mx-auto mb-3">
                            {founder.avatarUrl ? (
                              <img src={founder.avatarUrl} alt={founder.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-[#C62828]/10 flex items-center justify-center text-[#C62828] font-bold text-xl">
                                {founder.fullName.charAt(0)}
                              </div>
                            )}
                          </div>
                          <h3 className="font-bold text-black text-sm">{founder.fullName}</h3>
                          <span className="text-xs text-[#C62828] font-medium mt-0.5 inline-block">{founder.role}</span>
                        </motion.div>
                      )}

                      {coFounders.map((cf, idx) => (
                        <motion.div
                          key={cf.id}
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.1 * (idx + 1) }}
                          className="bg-white rounded-2xl border-2 border-amber-400 shadow-lg p-4 w-52 text-center"
                        >
                          <div className="w-14 h-14 rounded-full border-2 border-white shadow-md overflow-hidden bg-gray-100 mx-auto mb-3">
                            {cf.avatarUrl ? (
                              <img src={cf.avatarUrl} alt={cf.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-xl">
                                {cf.fullName.charAt(0)}
                              </div>
                            )}
                          </div>
                          <h3 className="font-bold text-black text-sm">{cf.fullName}</h3>
                          <span className="text-xs text-amber-600 font-medium mt-0.5 inline-block">{cf.role}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {(founder || coFounders.length > 0) && teams.length > 0 && (
                  <div className="flex justify-center">
                    <div className="w-0.5 h-8 bg-gray-300" />
                  </div>
                )}

                {teams.length > 0 && (
                  <div>
                    <div className="flex items-center justify-center mb-4">
                      <div className="px-4 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wider shadow-sm">
                        {t("teams")}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {teams.map((team, idx) => (
                      <motion.div
                        key={team.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white rounded-xl border border-gray-200 shadow-sm p-3"
                      >
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`p-1.5 rounded-lg ${team.config.bg}`}>
                              <Users className={`w-4 h-4 ${team.config.color}`} />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-700">{t(team.config.labelKey as any)}</div>
                              <div className="text-xs text-gray-400">{t("membersCount", { count: team.members.length })}</div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {team.members.slice(0, 4).map((member) => (
                              <div key={member.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                                  {member.avatarUrl ? (
                                    <img src={member.avatarUrl} alt={member.fullName} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-sm font-bold text-gray-400">{member.fullName.charAt(0)}</span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-semibold text-gray-700 leading-tight truncate">{member.fullName}</div>
                                  <div className="text-xs text-[#C62828] mt-0.5">{member.role}</div>
                                </div>
                              </div>
                            ))}
                            {team.members.length > 4 && (
                              <div className="text-xs text-gray-400 text-center py-1">
                                {t("moreMembers", { count: team.members.length - 4 })}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* ═══════════ AD BANNER BOTTOM ═══════════ */}
          {vis.adBannerBottom && org.adBannerBottomUrl && (
            <section id="ad-banner-bottom">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
                style={{ aspectRatio: "4 / 1" }}
              >
                <img
                  src={org.adBannerBottomUrl}
                  alt="Advertisement"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: org.adBannerBottomPosition || "center center" }}
                />
              </motion.div>
            </section>
          )}

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
              <span>.</span>
              <span>{org.website}</span>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              (c) 2026 {org.name}. {t("footer.rights")}
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
