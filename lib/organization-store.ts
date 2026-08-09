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
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to load org data:", e);
  }
  return null;
}

function saveToStorage(data: OrganizationData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save org data:", e);
  }
}

// Initialize with default if empty
let orgData: OrganizationData = DEFAULT_DATA;

if (typeof window !== "undefined") {
  const saved = loadFromStorage();
  if (saved) {
    orgData = { ...DEFAULT_DATA, ...saved };
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
  if (saved) orgData = { ...DEFAULT_DATA, ...saved };
  return { ...orgData };
}

export function updateOrganization(updates: Partial<OrganizationData>) {
  orgData = { ...orgData, ...updates };
  saveToStorage(orgData);
  notify();
}

export function addPartner(partner: Omit<Partner, "id">) {
  const newPartner: Partner = { ...partner, id: `p-${Date.now()}` };
  orgData.partners = [...orgData.partners, newPartner];
  saveToStorage(orgData);
  notify();
}

export function updatePartner(id: string, updates: Partial<Partner>) {
  orgData.partners = orgData.partners.map((p) => (p.id === id ? { ...p, ...updates } : p));
  saveToStorage(orgData);
  notify();
}

export function deletePartner(id: string) {
  orgData.partners = orgData.partners.filter((p) => p.id !== id);
  saveToStorage(orgData);
  notify();
}

export function updateSocialLink(platform: string, url: string) {
  const existing = orgData.socialLinks.find((s) => s.platform === platform);
  if (existing) {
    orgData.socialLinks = orgData.socialLinks.map((s) =>
      s.platform === platform ? { ...s, url } : s
    );
  } else {
    orgData.socialLinks = [...orgData.socialLinks, { platform, url }];
  }
  saveToStorage(orgData);
  notify();
}

export function subscribeToOrganization(fn: (data: OrganizationData) => void) {
  listeners.add(fn);
  fn(orgData);
  return () => listeners.delete(fn);
}

// ── Feedback Images ──
export function addFeedbackImage(img: Omit<FeedbackImage, "id">) {
  const newItem: FeedbackImage = { ...img, id: `fb-${Date.now()}` };
  orgData.feedbackImages = [...orgData.feedbackImages, newItem];
  saveToStorage(orgData);
  notify();
}

export function updateFeedbackImage(id: string, updates: Partial<FeedbackImage>) {
  orgData.feedbackImages = orgData.feedbackImages.map((f) =>
    f.id === id ? { ...f, ...updates } : f
  );
  saveToStorage(orgData);
  notify();
}

export function deleteFeedbackImage(id: string) {
  orgData.feedbackImages = orgData.feedbackImages.filter((f) => f.id !== id);
  saveToStorage(orgData);
  notify();
}

// ── Certificate Images ──
export function addCertificateImage(img: Omit<CertificateImage, "id">) {
  const newItem: CertificateImage = { ...img, id: `cert-${Date.now()}` };
  orgData.certificateImages = [...orgData.certificateImages, newItem];
  saveToStorage(orgData);
  notify();
}

export function updateCertificateImage(id: string, updates: Partial<CertificateImage>) {
  orgData.certificateImages = orgData.certificateImages.map((c) =>
    c.id === id ? { ...c, ...updates } : c
  );
  saveToStorage(orgData);
  notify();
}

export function deleteCertificateImage(id: string) {
  orgData.certificateImages = orgData.certificateImages.filter((c) => c.id !== id);
  saveToStorage(orgData);
  notify();
}

// ── Section Visibility ──
export function updateSectionVisibility(updates: Partial<SectionVisibility>) {
  orgData.sectionVisibility = { ...orgData.sectionVisibility, ...updates };
  saveToStorage(orgData);
  notify();
}

export function setFeedbackImages(images: FeedbackImage[]) {
  orgData.feedbackImages = images.slice(0, 10);
  saveToStorage(orgData);
  notify();
}

export function setCertificateImages(images: CertificateImage[]) {
  orgData.certificateImages = images.slice(0, 10);
  saveToStorage(orgData);
  notify();
}
