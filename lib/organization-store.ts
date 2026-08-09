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
  adBanner: boolean;
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
  adBannerUrl?: string;
  adBannerPosition?: string;
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
    adBanner: saved.adBanner ?? defaults.adBanner,
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
  adBannerUrl: "",
  adBannerPosition: "center center",
  sectionVisibility: {
    overview: true,
    story: true,
    members: true,
    partners: true,
    feedback: false,
    certificates: false,
    adBanner: false,
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

export function updateOrganization(updates: Partial<OrganizationData>): boolean {
  orgData = mergeOrganizationData(orgData, updates);
  const success = saveToStorage(orgData);
  if (success) {
    notify();
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
