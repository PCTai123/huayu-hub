// lib/organization-store.ts
// Organization data management — auto-syncs with Supabase DB when available,
// falls back to localStorage when offline.

import {
  uploadImageToStorage,
  uploadImagesToStorage,
} from "@/lib/image-upload";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";

export interface Partner {
  id: string;
  name: string;
  logoUrl?: string;
  website: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface FeedbackImage {
  id: string;
  imageUrl: string;
  fullName: string;
  age: string;
  description: string;
}

export interface CertificateImage {
  id: string;
  imageUrl: string;
  fullName: string;
  age: string;
  description: string;
}

export interface SectionVisibility {
  overview: boolean;
  story: boolean;
  members: boolean;
  partners: boolean;
  feedback: boolean;
  certificates: boolean;
  adBannerTop: boolean;
  adBannerBottom: boolean;
}

export interface OrganizationData {
  id: string;
  name: string;
  tagline: string;
  location: string;
  email: string;
  website: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bannerPosition?: string;
  story: string;
  history: string;
  mission: string;
  achievements: string[];
  partners: Partner[];
  socialLinks: SocialLink[];
  stats: {
    members: number;
    teams: number;
    activities: number;
    yearsActive: number;
  };
  // Partner page custom fields
  feedbackImages: FeedbackImage[];
  certificateImages: CertificateImage[];
  backgroundUrl?: string;
  // Ad banners (top = above content, bottom = before footer)
  adBannerTopUrl?: string;
  adBannerTopPosition?: string;
  adBannerBottomUrl?: string;
  adBannerBottomPosition?: string;
  sectionVisibility: SectionVisibility;
}

const STORAGE_KEY = "huayu-hub-organization";

/* ── Helper: resize image before saving ── */
export function resizeImageToDataURL(dataUrl: string, maxWidth = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      if (img.width <= maxWidth) {
        // Re-compress even if not resized, to reduce storage footprint
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
        return;
      }
      const canvas = document.createElement("canvas");
      const scale = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/* ── Helper: deep merge sectionVisibility ── */
function mergeSectionVisibility(
  defaults: SectionVisibility,
  saved: Partial<SectionVisibility> | undefined
): SectionVisibility {
  if (!saved) return { ...defaults };
  return {
    overview: saved.overview ?? defaults.overview,
    story: saved.story ?? defaults.story,
    members: saved.members ?? defaults.members,
    partners: saved.partners ?? defaults.partners,
    feedback: saved.feedback ?? defaults.feedback,
    certificates: saved.certificates ?? defaults.certificates,
    adBannerTop: saved.adBannerTop ?? saved.adBanner ?? defaults.adBannerTop,
    adBannerBottom: saved.adBannerBottom ?? defaults.adBannerBottom,
  };
}

/* ── Helper: deep merge organization data ── */
function mergeOrganizationData(defaults: OrganizationData, saved: Partial<OrganizationData>): OrganizationData {
  return {
    ...defaults,
    ...saved,
    sectionVisibility: mergeSectionVisibility(
      defaults.sectionVisibility,
      saved.sectionVisibility
    ),
    stats: { ...defaults.stats, ...(saved.stats || {}) },
  };
}

const DEFAULT_DATA: OrganizationData = {
  id: "huayu-hub",
  name: "Huayu Hub",
  tagline: "AI x Chinese Learning Community",
  location: "Ho Chi Minh City, Vietnam",
  email: "contact@huayuhub.com",
  website: "https://huayuhub.com",
  avatarUrl: "",
  bannerUrl: "",
  story:
    "Huayu Hub duoc thanh lap tu niem dam me voi AI va ngon ngu Trung Quoc, voi mong muon xay dung mot cong dong hoc tap hien dai, sang tao va ket noi.",
  history:
    "Tu nhung buoi hoc nho le, Huayu Hub dan phat trien thanh mot cong dong hoc tap va nghien cuu AI - Tieng Trung uy tin va chuyen nghiep.",
  mission:
    "Ket noi tri thuc - Phat trien con nguoi - Ung dung AI de thay doi cach chung ta hoc tap va lam viec voi ngon ngu Trung Quoc.",
  achievements: [
    "Hon 100+ thanh vien tich cuc",
    "To chuc 30+ su kien hoc thuat",
    "Hop tac voi 10+ truong dai hoc",
    "Duoc truyen thong va cong dong danh gia cao",
  ],
  partners: [
    { id: "p1", name: "Datawhale", website: "https://datawhale.cn", logoUrl: "" },
    { id: "p2", name: "SenseTime", website: "https://www.sensetime.com", logoUrl: "" },
    { id: "p3", name: "Tencent", website: "https://www.tencent.com", logoUrl: "" },
    { id: "p4", name: "Bilibili", website: "https://www.bilibili.com", logoUrl: "" },
    { id: "p5", name: "Netease", website: "https://163.com", logoUrl: "" },
  ],
  socialLinks: [
    { platform: "Facebook", url: "facebook.com/huayuhub" },
    { platform: "TikTok", url: "tiktok.com/@huayuhub" },
    { platform: "Instagram", url: "instagram.com/huayuhub" },
    { platform: "YouTube", url: "youtube.com/huayuhub" },
    { platform: "Website", url: "huayuhub.com" },
  ],
  stats: {
    members: 42,
    teams: 6,
    activities: 38,
    yearsActive: 2,
  },
  feedbackImages: [],
  certificateImages: [],
  backgroundUrl: "",
  adBannerTopUrl: "",
  adBannerTopPosition: "50% 50%",
  adBannerBottomUrl: "",
  adBannerBottomPosition: "50% 50%",
  sectionVisibility: {
    overview: true,
    story: true,
    members: true,
    partners: true,
    feedback: false,
    certificates: false,
    adBannerTop: false,
    adBannerBottom: false,
  },
};

function loadFromStorage(): OrganizationData | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return mergeOrganizationData(DEFAULT_DATA, parsed);
    }
  } catch (e) {
    console.error("Failed to load org data:", e);
  }
  return null;
}

function saveToStorage(data: OrganizationData): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("Failed to save org data (likely storage quota exceeded):", e);
    return false;
  }
}

// Initialize with default if empty
let orgData: OrganizationData = DEFAULT_DATA;

if (typeof window !== "undefined") {
  const saved = loadFromStorage();
  if (saved) {
    orgData = saved;
  } else {
    saveToStorage(DEFAULT_DATA);
  }
}

const listeners = new Set<(data: OrganizationData) => void>();

function notify() {
  listeners.forEach((fn) => fn(orgData));
}

export function getOrganization(): OrganizationData {
  const saved = loadFromStorage();
  if (saved) orgData = saved;
  return { ...orgData };
}

/**
 * Fetch organization data from Supabase (overrides localStorage).
 * Call this on mount to ensure fresh data from the database.
 */
export async function fetchOrganizationFromSupabase(): Promise<OrganizationData> {
  const synced = await syncFromSupabase();
  if (synced) {
    orgData = synced;
    return { ...orgData };
  }
  // fallback to localStorage
  const saved = loadFromStorage();
  if (saved) orgData = saved;
  return { ...orgData };
}

export function updateOrganization(updates: Partial<OrganizationData>): boolean {
  orgData = mergeOrganizationData(orgData, updates);
  const success = saveToStorage(orgData);
  if (success) {
    notify();
  }
  // Fire-and-forget sync to Supabase
  if (isSupabaseConfigured && typeof window !== "undefined") {
    syncToSupabase(updates).catch(() => {});
  }
  return success;
}

export function addPartner(partner: Omit<Partner, "id">): boolean {
  const newPartner: Partner = { ...partner, id: `p-${Date.now()}` };
  orgData.partners = [...orgData.partners, newPartner];
  const success = saveToStorage(orgData);
  if (success) notify();
  return success;
}

export function updatePartner(id: string, updates: Partial<Partner>): boolean {
  orgData.partners = orgData.partners.map((p) => (p.id === id ? { ...p, ...updates } : p));
  const success = saveToStorage(orgData);
  if (success) notify();
  return success;
}

export function deletePartner(id: string): boolean {
  orgData.partners = orgData.partners.filter((p) => p.id !== id);
  const success = saveToStorage(orgData);
  if (success) notify();
  return success;
}

export function updateSocialLink(platform: string, url: string): boolean {
  const existing = orgData.socialLinks.find((s) => s.platform === platform);
  if (existing) {
    orgData.socialLinks = orgData.socialLinks.map((s) =>
      s.platform === platform ? { ...s, url } : s
    );
  } else {
    orgData.socialLinks = [...orgData.socialLinks, { platform, url }];
  }
  const success = saveToStorage(orgData);
  if (success) notify();
  return success;
}

export function subscribeToOrganization(fn: (data: OrganizationData) => void) {
  listeners.add(fn);
  fn(orgData);
  return () => listeners.delete(fn);
}

// ── Feedback Images ──
export function addFeedbackImage(img: Omit<FeedbackImage, "id">): boolean {
  const newItem: FeedbackImage = { ...img, id: `fb-${Date.now()}` };
  orgData.feedbackImages = [...orgData.feedbackImages, newItem];
  const success = saveToStorage(orgData);
  if (success) notify();
  return success;
}

export function updateFeedbackImage(id: string, updates: Partial<FeedbackImage>): boolean {
  orgData.feedbackImages = orgData.feedbackImages.map((f) =>
    f.id === id ? { ...f, ...updates } : f
  );
  const success = saveToStorage(orgData);
  if (success) notify();
  return success;
}

export function deleteFeedbackImage(id: string): boolean {
  orgData.feedbackImages = orgData.feedbackImages.filter((f) => f.id !== id);
  const success = saveToStorage(orgData);
  if (success) notify();
  return success;
}

// ── Certificate Images ──
export function addCertificateImage(img: Omit<CertificateImage, "id">): boolean {
  const newItem: CertificateImage = { ...img, id: `cert-${Date.now()}` };
  orgData.certificateImages = [...orgData.certificateImages, newItem];
  const success = saveToStorage(orgData);
  if (success) notify();
  return success;
}

export function updateCertificateImage(id: string, updates: Partial<CertificateImage>): boolean {
  orgData.certificateImages = orgData.certificateImages.map((c) =>
    c.id === id ? { ...c, ...updates } : c
  );
  const success = saveToStorage(orgData);
  if (success) notify();
  return success;
}

export function deleteCertificateImage(id: string): boolean {
  orgData.certificateImages = orgData.certificateImages.filter((c) => c.id !== id);
  const success = saveToStorage(orgData);
  if (success) notify();
  return success;
}

// ── Section Visibility ──
export function updateSectionVisibility(updates: Partial<SectionVisibility>): boolean {
  orgData.sectionVisibility = mergeSectionVisibility(orgData.sectionVisibility, updates);
  const success = saveToStorage(orgData);
  if (success) notify();
  return success;
}

export function setFeedbackImages(images: FeedbackImage[]): boolean {
  orgData.feedbackImages = images.slice(0, 10);
  const success = saveToStorage(orgData);
  if (success) notify();
  return success;
}

export function setCertificateImages(images: CertificateImage[]): boolean {
  orgData.certificateImages = images.slice(0, 10);
  const success = saveToStorage(orgData);
  if (success) notify();
  return success;
}

/* ════════════════════════════════════════════ */
/*         SUPABASE DATABASE SYNC               */
/* ════════════════════════════════════════════ */

let supabaseCache: OrganizationData | null = null;
let isSyncing = false;

function dbToOrg(data: any): OrganizationData {
  return {
    id: data.id || DEFAULT_DATA.id,
    name: data.name || DEFAULT_DATA.name,
    tagline: data.tagline || DEFAULT_DATA.tagline,
    location: data.location || DEFAULT_DATA.location,
    email: data.email || DEFAULT_DATA.email,
    website: data.website || DEFAULT_DATA.website,
    avatarUrl: data.avatar_url || "",
    bannerUrl: data.banner_url || "",
    bannerPosition: data.banner_position || DEFAULT_DATA.bannerPosition,
    story: data.story || "",
    history: data.history || "",
    mission: data.mission || "",
    achievements: Array.isArray(data.achievements) ? data.achievements : [],
    partners: Array.isArray(data.partners) ? data.partners : [],
    socialLinks: Array.isArray(data.social_links) ? data.social_links : [],
    stats: {
      members: data.stats?.members ?? DEFAULT_DATA.stats.members,
      teams: data.stats?.teams ?? DEFAULT_DATA.stats.teams,
      activities: data.stats?.activities ?? DEFAULT_DATA.stats.activities,
      yearsActive: data.stats?.years_active ?? DEFAULT_DATA.stats.yearsActive,
    },
    feedbackImages: Array.isArray(data.feedback_images) ? data.feedback_images : [],
    certificateImages: Array.isArray(data.certificate_images) ? data.certificate_images : [],
    backgroundUrl: data.background_url || "",
    adBannerTopUrl: data.ad_banner_top_url || data.ad_banner_url || "",
    adBannerTopPosition: data.ad_banner_top_position || data.ad_banner_position || DEFAULT_DATA.adBannerTopPosition,
    adBannerBottomUrl: data.ad_banner_bottom_url || "",
    adBannerBottomPosition: data.ad_banner_bottom_position || DEFAULT_DATA.adBannerBottomPosition,
    sectionVisibility: {
      overview: data.section_visibility?.overview ?? true,
      story: data.section_visibility?.story ?? true,
      members: data.section_visibility?.members ?? true,
      partners: data.section_visibility?.partners ?? true,
      feedback: data.section_visibility?.feedback ?? true,
      certificates: data.section_visibility?.certificates ?? true,
      adBannerTop: data.section_visibility?.ad_banner_top ?? data.section_visibility?.ad_banner ?? true,
      adBannerBottom: data.section_visibility?.ad_banner_bottom ?? true,
    },
  };
}

function orgToDb(data: Partial<OrganizationData>): any {
  const db: any = {};
  if (data.name !== undefined) db.name = data.name;
  if (data.tagline !== undefined) db.tagline = data.tagline;
  if (data.location !== undefined) db.location = data.location;
  if (data.email !== undefined) db.email = data.email;
  if (data.website !== undefined) db.website = data.website;
  if (data.avatarUrl !== undefined) db.avatar_url = data.avatarUrl;
  if (data.bannerUrl !== undefined) db.banner_url = data.bannerUrl;
  if (data.bannerPosition !== undefined) db.banner_position = data.bannerPosition;
  if (data.story !== undefined) db.story = data.story;
  if (data.history !== undefined) db.history = data.history;
  if (data.mission !== undefined) db.mission = data.mission;
  if (data.achievements !== undefined) db.achievements = data.achievements;
  if (data.partners !== undefined) db.partners = data.partners;
  if (data.socialLinks !== undefined) db.social_links = data.socialLinks;
  if (data.stats !== undefined) {
    db.stats = {
      members: data.stats.members,
      teams: data.stats.teams,
      activities: data.stats.activities,
      years_active: data.stats.yearsActive,
    };
  }
  if (data.feedbackImages !== undefined) db.feedback_images = data.feedbackImages;
  if (data.certificateImages !== undefined) db.certificate_images = data.certificateImages;
  if (data.backgroundUrl !== undefined) db.background_url = data.backgroundUrl;
  if (data.adBannerTopUrl !== undefined) db.ad_banner_top_url = data.adBannerTopUrl;
  if (data.adBannerTopPosition !== undefined) db.ad_banner_top_position = data.adBannerTopPosition;
  if (data.adBannerBottomUrl !== undefined) db.ad_banner_bottom_url = data.adBannerBottomUrl;
  if (data.adBannerBottomPosition !== undefined) db.ad_banner_bottom_position = data.adBannerBottomPosition;
  if (data.sectionVisibility !== undefined) {
    db.section_visibility = {
      overview: data.sectionVisibility.overview,
      story: data.sectionVisibility.story,
      members: data.sectionVisibility.members,
      partners: data.sectionVisibility.partners,
      feedback: data.sectionVisibility.feedback,
      certificates: data.sectionVisibility.certificates,
      ad_banner_top: data.sectionVisibility.adBannerTop,
      ad_banner_bottom: data.sectionVisibility.adBannerBottom,
    };
  }
  return db;
}

async function syncFromSupabase(): Promise<OrganizationData | null> {
  if (!isSupabaseConfigured || typeof window === "undefined") return null;
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", "huayu-hub")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Row not found — create default
        await supabase.from("organizations").insert([{ id: "huayu-hub", name: "Huayu Hub" }]);
        return DEFAULT_DATA;
      }
      console.warn("Supabase sync failed:", error.message);
      return null;
    }

    if (data) {
      const synced = dbToOrg(data);
      // Save to localStorage as cache
      orgData = synced;
      saveToStorage(orgData);
      return synced;
    }
  } catch (err) {
    console.warn("Supabase sync error:", err);
  }
  return null;
}

async function syncToSupabase(updates: Partial<OrganizationData>): Promise<boolean> {
  if (!isSupabaseConfigured || typeof window === "undefined") return false;
  try {
    const supabase = createClient();
    const dbData = orgToDb(updates);
    if (Object.keys(dbData).length === 0) return true;

    const { error } = await supabase
      .from("organizations")
      .update(dbData)
      .eq("id", "huayu-hub");

    if (error) {
      console.warn("Supabase save failed:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Supabase save error:", err);
    return false;
  }
}

/* ════════════════════════════════════════════ */
/*           CLOUD UPLOAD (Supabase)             */
/* ════════════════════════════════════════════ */

/**
 * Upload all base64 images to Supabase Storage and update localStorage with URLs.
 * Call this before save to ensure images are stored in cloud, not localStorage.
 */
export async function migrateImagesToCloud(): Promise<boolean> {
  const updates: Partial<OrganizationData> = {};

  // 1. Background
  if (orgData.backgroundUrl?.startsWith("data:image")) {
    const url = await uploadImageToStorage(orgData.backgroundUrl, "backgrounds");
    if (url && !url.startsWith("data:")) updates.backgroundUrl = url;
  }

  // 2. Top Banner
  if (orgData.adBannerTopUrl?.startsWith("data:image")) {
    const url = await uploadImageToStorage(orgData.adBannerTopUrl, "banners");
    if (url && !url.startsWith("data:")) updates.adBannerTopUrl = url;
  }

  // 3. Bottom Banner
  if (orgData.adBannerBottomUrl?.startsWith("data:image")) {
    const url = await uploadImageToStorage(orgData.adBannerBottomUrl, "banners");
    if (url && !url.startsWith("data:")) updates.adBannerBottomUrl = url;
  }

  // 3. Feedback images
  const feedbackBase64 = orgData.feedbackImages.filter((i) => i.imageUrl.startsWith("data:image"));
  if (feedbackBase64.length > 0) {
    const migrated = await uploadImagesToStorage(feedbackBase64, "feedback");
    const urlMap = new Map(migrated.map((m) => [m.id, m.imageUrl]));
    updates.feedbackImages = orgData.feedbackImages.map((i) =>
      urlMap.has(i.id) ? { ...i, imageUrl: urlMap.get(i.id)! } : i
    );
  }

  // 4. Certificate images
  const certBase64 = orgData.certificateImages.filter((i) => i.imageUrl.startsWith("data:image"));
  if (certBase64.length > 0) {
    const migrated = await uploadImagesToStorage(certBase64, "certificates");
    const urlMap = new Map(migrated.map((m) => [m.id, m.imageUrl]));
    updates.certificateImages = orgData.certificateImages.map((i) =>
      urlMap.has(i.id) ? { ...i, imageUrl: urlMap.get(i.id)! } : i
    );
  }

  if (Object.keys(updates).length > 0) {
    return updateOrganization(updates);
  }
  return true;
}

/**
 * Save with automatic cloud upload — use this from UI instead of raw updateOrganization.
 * Images that are still base64 will be uploaded to Supabase Storage first.
 */
export async function saveOrganizationWithCloudUpload(
  updates: Partial<OrganizationData>
): Promise<boolean> {
  // Apply updates first
  orgData = mergeOrganizationData(orgData, updates);

  // Upload any new base64 images to cloud
  const cloudUpdates: Partial<OrganizationData> = {};

  if (updates.backgroundUrl?.startsWith("data:image")) {
    const url = await uploadImageToStorage(updates.backgroundUrl, "backgrounds");
    if (url && !url.startsWith("data:")) cloudUpdates.backgroundUrl = url;
  }

  if (updates.adBannerTopUrl?.startsWith("data:image")) {
    const url = await uploadImageToStorage(updates.adBannerTopUrl, "banners");
    if (url && !url.startsWith("data:")) cloudUpdates.adBannerTopUrl = url;
  }

  if (updates.adBannerBottomUrl?.startsWith("data:image")) {
    const url = await uploadImageToStorage(updates.adBannerBottomUrl, "banners");
    if (url && !url.startsWith("data:")) cloudUpdates.adBannerBottomUrl = url;
  }

  if (updates.feedbackImages) {
    const base64Items = updates.feedbackImages.filter((i) => i.imageUrl.startsWith("data:image"));
    if (base64Items.length > 0) {
      const migrated = await uploadImagesToStorage(base64Items, "feedback");
      const urlMap = new Map(migrated.map((m) => [m.id, m.imageUrl]));
      cloudUpdates.feedbackImages = updates.feedbackImages.map((i) =>
        urlMap.has(i.id) ? { ...i, imageUrl: urlMap.get(i.id)! } : i
      );
    }
  }

  if (updates.certificateImages) {
    const base64Items = updates.certificateImages.filter((i) => i.imageUrl.startsWith("data:image"));
    if (base64Items.length > 0) {
      const migrated = await uploadImagesToStorage(base64Items, "certificates");
      const urlMap = new Map(migrated.map((m) => [m.id, m.imageUrl]));
      cloudUpdates.certificateImages = updates.certificateImages.map((i) =>
        urlMap.has(i.id) ? { ...i, imageUrl: urlMap.get(i.id)! } : i
      );
    }
  }

  // Apply cloud URLs
  if (Object.keys(cloudUpdates).length > 0) {
    orgData = mergeOrganizationData(orgData, cloudUpdates);
  }

  // Save to localStorage (now much smaller because images are URLs)
  const success = saveToStorage(orgData);
  if (success) notify();

  // Sync to Supabase DB
  if (isSupabaseConfigured && typeof window !== "undefined") {
    try {
      await syncToSupabase(orgData);
    } catch (e) {
      console.warn("Supabase sync failed in saveOrganizationWithCloudUpload:", e);
    }
  }

  return success;
}

/**
 * Check if any images are still stored as base64 (not yet migrated to cloud)
 */
export function hasBase64Images(): boolean {
  if (orgData.backgroundUrl?.startsWith("data:image")) return true;
  if (orgData.adBannerTopUrl?.startsWith("data:image")) return true;
  if (orgData.adBannerBottomUrl?.startsWith("data:image")) return true;
  if (orgData.feedbackImages.some((i) => i.imageUrl.startsWith("data:image"))) return true;
  if (orgData.certificateImages.some((i) => i.imageUrl.startsWith("data:image"))) return true;
  return false;
}

/**
 * Get storage usage info for debugging
 */
export function getStorageInfo(): { totalKB: number; orgDataKB: number; hasBase64: boolean } {
  let total = 0;
  if (typeof window !== "undefined") {
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += (localStorage.getItem(key) || "").length;
      }
    }
  }
  const orgDataStr = JSON.stringify(orgData);
  return {
    totalKB: Math.round(total / 1024),
    orgDataKB: Math.round(orgDataStr.length / 1024),
    hasBase64: hasBase64Images(),
  };
}
