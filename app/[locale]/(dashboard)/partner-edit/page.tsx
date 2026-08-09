"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Building2,
  Pencil,
  X,
  Eye,
  Upload,
  Trash2,
  Plus,
  Check,
  Image as ImageIcon,
  Palette,
  Megaphone,
  Award,
  MessageSquare,
  Lock,
  Save,
  ExternalLink,
} from "lucide-react";
import {
  getOrganization,
  saveOrganizationWithCloudUpload,
  subscribeToOrganization,
  resizeImageToDataURL,
  type OrganizationData,
  type FeedbackImage,
  type CertificateImage,
  type SectionVisibility,
} from "@/lib/organization-store";
import { getMembers, subscribeToMembers, type Member } from "@/lib/member-service";

/* ─────────── Section config ─────────── */

interface SectionDef {
  key: keyof SectionVisibility;
  label: string;
  icon: React.ElementType;
  locked?: boolean;
  description: string;
}

type SectionKey =
  | "overview"
  | "story"
  | "members"
  | "partners"
  | "feedback"
  | "certificates"
  | "adBanner";

const SECTION_ORDER: SectionKey[] = [
  "overview",
  "story",
  "members",
  "partners",
  "feedback",
  "certificates",
  "adBanner",
];

const LOCKED_KEYS = new Set<SectionKey>(["overview", "story", "members", "partners"]);

const SECTION_ICONS: Record<SectionKey, React.ElementType> = {
  overview: Building2,
  story: ImageIcon,
  members: Building2,
  partners: Building2,
  feedback: MessageSquare,
  certificates: Award,
  adBanner: Megaphone,
};

function getSections(t: ReturnType<typeof useTranslations<"partnerEdit">>): SectionDef[] {
  return SECTION_ORDER.map((key) => ({
    key,
    label: t(`sections.${key}.label`),
    icon: SECTION_ICONS[key],
    locked: LOCKED_KEYS.has(key),
    description: t(`sections.${key}.description`),
  }));
}

/* ─────────── Helper: image upload ─────────── */

function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* Resize image to reduce localStorage footprint (banner images can be several MB) */
async function fileToResizedDataURL(file: File, maxWidth = 1200, quality = 0.8): Promise<string> {
  const dataUrl = await fileToDataURL(file);
  return resizeImageToDataURL(dataUrl, maxWidth, quality);
}

/* ════════════════════════════════════════════ */
/*                  MAIN PAGE                     */
/* ════════════════════════════════════════════ */

export default function PartnerEditPage() {
  const t = useTranslations("partnerEdit");
  const [org, setOrg] = useState<OrganizationData | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    setOrg(getOrganization());
    setMembers(getMembers());
    const unsubOrg = subscribeToOrganization((d) => setOrg({ ...d }));
    const unsubMem = subscribeToMembers((m) => setMembers(m));
    return () => {
      unsubOrg();
      unsubMem();
    };
  }, []);

  const handleSave = useCallback(async (updated: Partial<OrganizationData>) => {
    const success = await saveOrganizationWithCloudUpload(updated);
    if (success) {
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    } else {
      setShowError(true);
      setTimeout(() => setShowError(false), 4000);
    }
  }, []);

  if (!org) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#C62828]/10">
            <Building2 className="w-6 h-6 text-[#C62828]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black">{t("title")}</h1>
            <p className="text-sm text-gray-500">{t("subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/partner"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C62828] text-white text-sm font-medium hover:bg-[#a52020] transition-colors"
          >
            <Eye className="w-4 h-4" />
            {t("viewPartner")}
          </Link>
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#C62828] text-[#C62828] text-sm font-medium hover:bg-[#C62828] hover:text-white transition-colors"
          >
            <Pencil className="w-4 h-4" />
            {isEditMode ? t("preview") : t("edit")}
          </button>
        </div>
      </motion.div>

      {/* Saved toast */}
      <AnimatePresence>
        {showSaved && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500 text-white shadow-lg"
          >
            <Check className="w-5 h-5" />
            {t("saved")}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error toast */}
      <AnimatePresence>
        {showError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500 text-white shadow-lg"
          >
            <X className="w-5 h-5" />
            {t("saveError")}
          </motion.div>
        )}
      </AnimatePresence>

      {isEditMode ? (
        <EditMode org={org} onSave={handleSave} t={t} />
      ) : (
        <PreviewMode org={org} members={members} t={t} />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════ */
/*               PREVIEW MODE                    */
/* ════════════════════════════════════════════ */

function PreviewMode({
  org,
  members,
  t,
}: {
  org: OrganizationData;
  members: Member[];
  t: ReturnType<typeof useTranslations<"partnerEdit">>;
}) {
  const sections = getSections(t);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100">
        <Eye className="w-5 h-5 text-blue-500 shrink-0" />
        <p className="text-sm text-blue-700">{t("previewHint")}</p>
      </div>

      {/* Section visibility overview */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-bold text-black mb-3">{t("sectionStatus")}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {sections.map((sec) => {
            const visible = org.sectionVisibility[sec.key];
            const Icon = sec.icon;
            return (
              <div
                key={sec.key}
                className={`flex items-center gap-2 p-3 rounded-xl border ${
                  visible
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${visible ? "text-green-500" : "text-gray-400"}`}
                />
                <span
                  className={`text-xs font-medium ${visible ? "text-green-700" : "text-gray-400"}`}
                >
                  {sec.label}
                </span>
                {sec.locked && (
                  <Lock className="w-3 h-3 text-gray-400 ml-auto" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mini preview - scaled down partner page */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <span className="text-xs text-gray-400 ml-2">/partner</span>
        </div>
        <div className="max-h-[600px] overflow-y-auto bg-[#F6F1E8]">
          <PartnerPreview org={org} members={members} t={t} />
        </div>
      </div>
    </div>
  );
}

/* ─────────── Partner Preview (mini) ─────────── */

function PartnerPreview({
  org,
  members,
  t,
}: {
  org: OrganizationData;
  members: Member[];
  t: ReturnType<typeof useTranslations<"partnerEdit">>;
}) {
  const sections = getSections(t);
  const founder = members.find((m) => m.role === "Founder");
  const coFounders = members.filter((m) => m.role === "Co-Founder");
  const teamMembers = members.filter(
    (m) => m.role !== "Founder" && m.role !== "Co-Founder"
  );

  const sectionLabel = (key: SectionKey) =>
    sections.find((s) => s.key === key)?.label || key;

  return (
    <div className="p-4 space-y-6">
      {/* Overview */}
      {org.sectionVisibility.overview && (
        <div className="rounded-xl overflow-hidden bg-white border border-gray-100">
          <div
            className="w-full bg-gradient-to-r from-red-50 via-orange-50 to-amber-50"
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
                <Building2 className="w-12 h-12 text-[#C62828]/20" />
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-end gap-3 -mt-8">
              <div className="w-16 h-16 rounded-xl border-2 border-white shadow-md overflow-hidden bg-white shrink-0">
                {org.avatarUrl ? (
                  <img src={org.avatarUrl} alt={org.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#C62828] flex items-center justify-center text-white font-bold text-xl">
                    {org.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="pb-1">
                <h2 className="text-lg font-bold text-[#2D2D2D]">{org.name}</h2>
                <p className="text-xs text-[#C62828] font-medium">{org.tagline}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ad Banner */}
      {org.sectionVisibility.adBanner && org.adBannerUrl && (
        <div
          className="rounded-xl overflow-hidden border border-gray-100"
          style={{ aspectRatio: "8 / 3" }}
        >
          <img
            src={org.adBannerUrl}
            alt="Ad Banner"
            className="w-full h-full object-cover"
            style={{ objectPosition: org.adBannerPosition || "center center" }}
          />
        </div>
      )}

      {/* Story */}
      {org.sectionVisibility.story && (
        <div className="rounded-xl bg-white border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-[#2D2D2D] mb-2">
            {sectionLabel("story")}
          </h3>
          <p className="text-xs text-gray-600 line-clamp-3">{org.story}</p>
        </div>
      )}

      {/* Members */}
      {org.sectionVisibility.members && (
        <div className="rounded-xl bg-white border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-[#2D2D2D] mb-3">
            {sectionLabel("members")}
          </h3>
          <div className="space-y-2">
            {founder && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-[#C62828]">
                  {founder.fullName.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-medium text-black">{founder.fullName}</p>
                  <p className="text-[10px] text-[#C62828]">{founder.role}</p>
                </div>
              </div>
            )}
            {coFounders.map((cf) => (
              <div key={cf.id} className="flex items-center gap-2 p-2 rounded-lg bg-amber-50">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-amber-600">
                  {cf.fullName.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-medium text-black">{cf.fullName}</p>
                  <p className="text-[10px] text-amber-600">{cf.role}</p>
                </div>
              </div>
            ))}
            {teamMembers.slice(0, 4).map((m) => (
              <div key={m.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                  {m.fullName.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-medium text-black">{m.fullName}</p>
                  <p className="text-[10px] text-gray-400">{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Partners */}
      {org.sectionVisibility.partners && (
        <div className="rounded-xl bg-white border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-[#2D2D2D] mb-3">
            {sectionLabel("partners")}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {org.partners.map((p) => (
              <div key={p.id} className="flex flex-col items-center p-2 rounded-lg border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-[#C62828]/10 flex items-center justify-center mb-1">
                  <span className="text-xs font-bold text-[#C62828]">{p.name.charAt(0)}</span>
                </div>
                <span className="text-[10px] text-gray-600 text-center">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback */}
      {org.sectionVisibility.feedback && org.feedbackImages.length > 0 && (
        <div className="rounded-xl bg-white border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-[#2D2D2D] mb-3">
            {t("feedback.title")}
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {org.feedbackImages.slice(0, 10).map((fb) => (
              <div key={fb.id} className="rounded-lg overflow-hidden border border-gray-100">
                <div className="aspect-square bg-gray-100">
                  <img src={fb.imageUrl} alt={fb.fullName} className="w-full h-full object-cover" />
                </div>
                <div className="p-1">
                  <p className="text-[8px] font-medium text-black truncate">{fb.fullName}</p>
                  <p className="text-[7px] text-gray-400 truncate">
                    {fb.age} {t("yearsOld")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificates */}
      {org.sectionVisibility.certificates && org.certificateImages.length > 0 && (
        <div className="rounded-xl bg-white border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-[#2D2D2D] mb-3">
            {t("certificates.title")}
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {org.certificateImages.slice(0, 10).map((cert) => (
              <div key={cert.id} className="rounded-lg overflow-hidden border border-gray-100">
                <div className="aspect-square bg-gray-100">
                  <img src={cert.imageUrl} alt={cert.fullName} className="w-full h-full object-cover" />
                </div>
                <div className="p-1">
                  <p className="text-[8px] font-medium text-black truncate">{cert.fullName}</p>
                  <p className="text-[7px] text-gray-400 truncate">
                    {cert.age} {t("yearsOld")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden sections hint */}
      {Object.entries(org.sectionVisibility)
        .filter(([, v]) => !v)
        .map(([key]) => key)
        .length > 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 p-4 text-center">
          <p className="text-xs text-gray-400">
            {t("hiddenSections")}:{" "}
            {Object.entries(org.sectionVisibility)
              .filter(([, v]) => !v)
              .map(([k]) => sectionLabel(k as SectionKey))
              .join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════ */
/*                 EDIT MODE                     */
/* ════════════════════════════════════════════ */

function EditMode({
  org,
  onSave,
  t,
}: {
  org: OrganizationData;
  onSave: (data: Partial<OrganizationData>) => void;
  t: ReturnType<typeof useTranslations<"partnerEdit">>;
}) {
  const sections = getSections(t);
  const [visibility, setVisibility] = useState<SectionVisibility>({
    ...org.sectionVisibility,
  });
  const [feedbackImages, setFeedbackImgs] = useState<FeedbackImage[]>(
    org.feedbackImages
  );
  const [certificateImages, setCertificateImgs] = useState<CertificateImage[]>(
    org.certificateImages
  );
  const [backgroundUrl, setBackgroundUrl] = useState(org.backgroundUrl || "");
  const [adBannerUrl, setAdBannerUrl] = useState(org.adBannerUrl || "");
  const [adBannerPosition, setAdBannerPosition] = useState(
    org.adBannerPosition || "center center"
  );

  const toggleSection = (key: keyof SectionVisibility) => {
    const secDef = sections.find((s) => s.key === key);
    if (secDef?.locked) return;
    setVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveAll = () => {
    onSave({
      sectionVisibility: visibility,
      feedbackImages,
      certificateImages,
      backgroundUrl,
      adBannerUrl,
      adBannerPosition,
    });
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<FeedbackImage[] | CertificateImage[]>>,
    prefix: string
  ) => {
    const files = Array.from(e.target.files || []);
    const existing = prefix === "fb" ? feedbackImages : certificateImages;
    const remaining = 10 - existing.length;
    const toProcess = files.slice(0, remaining);

    for (const file of toProcess) {
      if (!file.type.startsWith("image/")) continue;
      const dataUrl = await fileToResizedDataURL(file, 800, 0.75);
      const newItem: any = {
        id: `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        imageUrl: dataUrl,
        fullName: "",
        age: "",
        description: "",
      };
      setter((prev: any) => [...prev, newItem]);
    }
    e.target.value = "";
  };

  const parsePosition = (pos?: string) => {
    if (!pos) return { x: 50, y: 50 };
    const parts = pos.split(" ");
    const parse = (v: string) => {
      if (v.endsWith("%")) return parseInt(v);
      if (v === "left" || v === "top") return 0;
      if (v === "center") return 50;
      if (v === "right" || v === "bottom") return 100;
      return 50;
    };
    return { x: parse(parts[0] || "center"), y: parse(parts[1] || "center") };
  };

  const handleAdPosChange = (axis: "x" | "y", value: number) => {
    const current = parsePosition(adBannerPosition);
    const newPos =
      axis === "x"
        ? `${value}% ${current.y}%`
        : `${current.x}% ${value}%`;
    setAdBannerPosition(newPos);
  };

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100">
        <Pencil className="w-5 h-5 text-amber-500 shrink-0" />
        <p className="text-sm text-amber-700">{t("editHint")}</p>
      </div>

      {/* Section toggles */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h3 className="font-bold text-black">{t("displayContent")}</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {sections.map((sec) => {
            const checked = visibility[sec.key];
            const Icon = sec.icon;
            return (
              <div
                key={sec.key}
                className={`flex items-center gap-3 px-5 py-4 ${
                  checked ? "bg-white" : "bg-gray-50/50"
                }`}
              >
                <button
                  onClick={() => toggleSection(sec.key)}
                  disabled={sec.locked}
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                    checked
                      ? "bg-[#C62828] border-[#C62828] text-white"
                      : "bg-white border-gray-300 text-transparent hover:border-[#C62828]"
                  } ${sec.locked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  {checked && <Check className="w-4 h-4" />}
                </button>
                <div className="p-2 rounded-lg bg-gray-100">
                  <Icon className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-black">{sec.label}</span>
                    {sec.locked && (
                      <span className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        <Lock className="w-2.5 h-2.5" />
                        {t("locked")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{sec.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feedback Images Editor */}
      {visibility.feedback && (
        <ImageGalleryEditor
          title={t("feedback.title")}
          icon={MessageSquare}
          images={feedbackImages}
          onChange={(imgs) => setFeedbackImgs(imgs as FeedbackImage[])}
          onUpload={(e) => handleFileUpload(e, setFeedbackImgs as any, "fb")}
          maxItems={10}
          t={t}
          sectionKey="feedback"
        />
      )}

      {/* Certificate Images Editor */}
      {visibility.certificates && (
        <ImageGalleryEditor
          title={t("certificates.title")}
          icon={Award}
          images={certificateImages}
          onChange={(imgs) => setCertificateImgs(imgs as CertificateImage[])}
          onUpload={(e) => handleFileUpload(e, setCertificateImgs as any, "cert")}
          maxItems={10}
          t={t}
          sectionKey="certificates"
        />
      )}

      {/* Background Editor */}
      {true && (
        <BackgroundEditor
          backgroundUrl={backgroundUrl}
          onChange={setBackgroundUrl}
          t={t}
        />
      )}

      {/* Ad Banner Editor - always visible (like Background) so users can upload before toggling */}
      {true && (
        <AdBannerEditor
          adBannerUrl={adBannerUrl}
          adBannerPosition={adBannerPosition}
          onUrlChange={setAdBannerUrl}
          onPositionChange={handleAdPosChange}
          parsePosition={parsePosition}
          t={t}
        />
      )}

      {/* Save button */}
      <div className="sticky bottom-4 flex justify-end">
        <button
          onClick={handleSaveAll}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C62828] text-white text-sm font-bold hover:bg-[#a52020] transition-colors shadow-lg"
        >
          <Save className="w-4 h-4" />
          {t("saveAll")}
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════ */
/*          IMAGE GALLERY EDITOR                 */
/* ════════════════════════════════════════════ */

function ImageGalleryEditor({
  title,
  icon: Icon,
  images,
  onChange,
  onUpload,
  maxItems,
  t,
  sectionKey,
}: {
  title: string;
  icon: React.ElementType;
  images: FeedbackImage[] | CertificateImage[];
  onChange: (imgs: FeedbackImage[] | CertificateImage[]) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxItems: number;
  t: ReturnType<typeof useTranslations<"partnerEdit">>;
  sectionKey: "feedback" | "certificates";
}) {
  const updateField = (id: string, field: string, value: string) => {
    onChange(
      images.map((img) => (img.id === id ? { ...img, [field]: value } : img))
    );
  };

  const removeImage = (id: string) => {
    onChange(images.filter((img) => img.id !== id));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#C62828]/10">
            <Icon className="w-4 h-4 text-[#C62828]" />
          </div>
          <h3 className="font-bold text-black">{title}</h3>
        </div>
        <span className="text-xs text-gray-400">
          {images.length}/{maxItems} {t(`${sectionKey}.slots`)}
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Upload button */}
        {images.length < maxItems && (
          <label className="flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#C62828] cursor-pointer transition-colors">
            <Upload className="w-6 h-6 text-gray-400" />
            <span className="text-sm text-gray-500">
              {t("uploadSlot", { count: maxItems - images.length })}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onUpload}
              className="hidden"
            />
          </label>
        )}

        {/* Image grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {images.map((img, idx) => (
            <div
              key={img.id}
              className="rounded-xl border border-gray-200 overflow-hidden"
            >
              <div className="relative aspect-video bg-gray-100">
                <img
                  src={img.imageUrl}
                  alt={img.fullName || `Image ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={img.fullName}
                    onChange={(e) => updateField(img.id, "fullName", e.target.value)}
                    placeholder={t(`${sectionKey}.fullNamePlaceholder`)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-black focus:border-[#C62828] outline-none"
                  />
                  <input
                    type="text"
                    value={img.age}
                    onChange={(e) => updateField(img.id, "age", e.target.value)}
                    placeholder={t(`${sectionKey}.agePlaceholder`)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-black focus:border-[#C62828] outline-none"
                  />
                </div>
                <textarea
                  value={img.description}
                  onChange={(e) => updateField(img.id, "description", e.target.value)}
                  placeholder={t(`${sectionKey}.descriptionPlaceholder`)}
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-black focus:border-[#C62828] outline-none resize-none"
                />
              </div>
            </div>
          ))}
        </div>

        {images.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-4">
            {t(`${sectionKey}.empty`)}
          </p>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════ */
/*            BACKGROUND EDITOR                  */
/* ════════════════════════════════════════════ */

function BackgroundEditor({
  backgroundUrl,
  onChange,
  t,
}: {
  backgroundUrl: string;
  onChange: (url: string) => void;
  t: ReturnType<typeof useTranslations<"partnerEdit">>;
}) {
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const dataUrl = await fileToResizedDataURL(file, 1200, 0.8);
      onChange(dataUrl);
    }
    e.target.value = "";
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-[#C62828]/10">
          <Palette className="w-4 h-4 text-[#C62828]" />
        </div>
        <h3 className="font-bold text-black">{t("background.title")}</h3>
      </div>
      <div className="p-5 space-y-3">
        <p className="text-sm text-gray-500">{t("background.hint")}</p>
        <label className="flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#C62828] cursor-pointer transition-colors">
          {backgroundUrl ? (
            <div className="w-full max-w-md h-32 rounded-lg overflow-hidden">
              <img
                src={backgroundUrl}
                alt="Background"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <>
              <Upload className="w-6 h-6 text-gray-400" />
              <span className="text-sm text-gray-500">{t("background.uploadHint")}</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </label>
        {backgroundUrl && (
          <button
            onClick={() => onChange("")}
            className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t("background.remove")}
          </button>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════ */
/*            AD BANNER EDITOR                   */
/* ════════════════════════════════════════════ */

function AdBannerEditor({
  adBannerUrl,
  adBannerPosition,
  onUrlChange,
  onPositionChange,
  parsePosition,
  t,
}: {
  adBannerUrl: string;
  adBannerPosition: string;
  onUrlChange: (url: string) => void;
  onPositionChange: (axis: "x" | "y", value: number) => void;
  parsePosition: (pos?: string) => { x: number; y: number };
  t: ReturnType<typeof useTranslations<"partnerEdit">>;
}) {
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const dataUrl = await fileToResizedDataURL(file, 1200, 0.8);
      onUrlChange(dataUrl);
    }
    e.target.value = "";
  };

  const pos = parsePosition(adBannerPosition);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-[#C62828]/10">
          <Megaphone className="w-4 h-4 text-[#C62828]" />
        </div>
        <h3 className="font-bold text-black">{t("adBanner.title")}</h3>
      </div>
      <div className="p-5 space-y-4">
        {/* Upload / Preview */}
        <label className="block cursor-pointer">
          {adBannerUrl ? (
            <div
              className="w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-100"
              style={{ aspectRatio: "8 / 3" }}
            >
              <img
                src={adBannerUrl}
                alt="Ad Banner"
                className="w-full h-full object-cover"
                style={{ objectPosition: adBannerPosition }}
              />
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#C62828] py-8"
              style={{ aspectRatio: "8 / 3" }}
            >
              <Upload className="w-6 h-6 text-gray-400" />
              <span className="text-sm text-gray-500">{t("adBanner.uploadHint")}</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </label>

        {/* Position sliders */}
        {adBannerUrl && (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                {t("adBanner.positionX")}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={pos.x}
                onChange={(e) => onPositionChange("x", parseInt(e.target.value))}
                className="w-full accent-[#C62828]"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                <span>{t("adBanner.left")}</span>
                <span>{t("adBanner.centerX")}</span>
                <span>{t("adBanner.right")}</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                {t("adBanner.positionY")}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={pos.y}
                onChange={(e) => onPositionChange("y", parseInt(e.target.value))}
                className="w-full accent-[#C62828]"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                <span>{t("adBanner.top")}</span>
                <span>{t("adBanner.centerY")}</span>
                <span>{t("adBanner.bottom")}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
