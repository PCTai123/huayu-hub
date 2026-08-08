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

export interface OrganizationData {
  id: string;
  name: string;
  tagline: string;
  location: string;
  email: string;
  website: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bannerPosition?: string; // CSS object-position, e.g. "center 30%"
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
    "Huayu Hub được thành lập từ niềm đam mê với AI và ngôn ngữ Trung Quốc, với mong muốn xây dựng một cộng đồng học tập hiện đại, sáng tạo và kết nối.",
  history:
    "Từ những buổi học nhỏ lẻ, Huayu Hub dần phát triển thành một cộng đồng học tập và nghiên cứu AI – Tiếng Trung uy tín và chuyên nghiệp.",
  mission:
    "Kết nối tri thức – Phát triển con người – Ứng dụng AI để thay đổi cách chúng ta học tập và làm việc với ngôn ngữ Trung Quốc.",
  achievements: [
    "Hơn 100+ thành viên tích cực",
    "Tổ chức 30+ sự kiện học thuật",
    "Hợp tác với 10+ trường đại học",
    "Được truyền thông và cộng đồng đánh giá cao",
  ],
  partners: [
    { id: "p1", name: "Datawhale", website: "https://datawhale.cn", logoUrl: "" },
    { id: "p2", name: "SenseTime", website: "https://www.sensetime.com", logoUrl: "" },
    { id: "p3", name: "Tencent", website: "https://www.tencent.com", logoUrl: "" },
    { id: "p4", name: "Bilibili", website: "https://www.bilibili.com", logoUrl: "" },
    { id: "p5", name: "Netease", website: "https://www.163.com", logoUrl: "" },
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
