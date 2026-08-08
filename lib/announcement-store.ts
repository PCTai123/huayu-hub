export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: {
    name: string;
    avatar?: string;
  };
  createdAt: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  createdAt: number;
}

const ANNOUNCEMENTS_KEY = "huayu-hub-announcements";
const NOTIFICATIONS_KEY = "huayu-hub-notifications";
const NOTIFICATIONS_READ_KEY = "huayu-hub-notifications-read";

let announcements: Announcement[] = [];
let notifications: NotificationItem[] = [];
let lastReadTime = 0;
let listeners = new Set<() => void>();
let notificationListeners = new Set<() => void>();

function loadAnnouncements() {
  if (typeof window === "undefined") return;
  try {
    const saved = localStorage.getItem(ANNOUNCEMENTS_KEY);
    if (saved) {
      announcements = JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load announcements:", e);
  }
}

function saveAnnouncements() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
  } catch (e) {
    console.error("Failed to save announcements:", e);
  }
}

function loadNotifications() {
  if (typeof window === "undefined") return;
  try {
    const saved = localStorage.getItem(NOTIFICATIONS_KEY);
    if (saved) {
      notifications = JSON.parse(saved);
    }
    const read = localStorage.getItem(NOTIFICATIONS_READ_KEY);
    if (read) {
      lastReadTime = parseInt(read, 10);
    }
  } catch (e) {
    console.error("Failed to load notifications:", e);
  }
}

function saveNotifications() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  } catch (e) {
    console.error("Failed to save notifications:", e);
  }
}

function saveReadTime() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NOTIFICATIONS_READ_KEY, String(lastReadTime));
  } catch (e) {
    console.error("Failed to save read time:", e);
  }
}

function notify() {
  listeners.forEach((fn) => fn());
}

function notifyNotificationListeners() {
  notificationListeners.forEach((fn) => fn());
}

export function getAnnouncements(): Announcement[] {
  loadAnnouncements();
  return [...announcements];
}

export function getNotifications(): NotificationItem[] {
  loadNotifications();
  return [...notifications];
}

export function getUnreadCount(): number {
  loadNotifications();
  return notifications.filter((n) => n.unread && n.createdAt > lastReadTime).length;
}

export function addAnnouncement(data: { title: string; content: string; authorName: string; authorAvatar?: string }) {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const newAnnouncement: Announcement = {
    id: `ann-${Date.now()}`,
    title: data.title,
    content: data.content,
    date: dateStr,
    author: {
      name: data.authorName,
      avatar: data.authorAvatar,
    },
    createdAt: Date.now(),
  };
  loadAnnouncements();
  announcements.unshift(newAnnouncement);
  saveAnnouncements();
  notify();

  // Also create notification
  const newNotif: NotificationItem = {
    id: `notif-${Date.now()}`,
    title: data.title,
    message: data.content.substring(0, 60) + (data.content.length > 60 ? "..." : ""),
    time: "Vừa xong",
    unread: true,
    createdAt: Date.now(),
  };
  loadNotifications();
  notifications.unshift(newNotif);
  saveNotifications();
  notifyNotificationListeners();
}

export function markAllNotificationsAsRead() {
  lastReadTime = Date.now();
  saveReadTime();
  notifyNotificationListeners();
}

export function subscribeToAnnouncements(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function subscribeToNotifications(fn: () => void) {
  notificationListeners.add(fn);
  return () => notificationListeners.delete(fn);
}

// Default seed data
const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "1",
    title: "Thông báo họp tháng 8",
    content:
      "Cuộc họp tháng 8 sẽ được tổ chức vào ngày 15/08/2026 tại phòng họp A. Tất cả thành viên vui lòng tham dự đúng giờ.",
    date: "2026-08-01",
    author: { name: "Nguyen Van A", avatar: undefined },
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
  },
  {
    id: "2",
    title: "Kế hoạch team building",
    content:
      "Team building sẽ diễn ra vào cuối tuần này tại Đà Lạt. Mọi người chuẩn bị hành lý và tinh thần vui vẻ nhé!",
    date: "2026-08-05",
    author: { name: "Tran Thi B", avatar: undefined },
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
  {
    id: "3",
    title: "Cập nhật quy định mới",
    content:
      "Ban quản lý vừa ban hành quy định mới về thời gian làm việc. Vui lòng đọc kỹ và tuân thủ.",
    date: "2026-08-07",
    author: { name: "Le Van C", avatar: undefined },
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
  },
];

// Seed on first run
if (typeof window !== "undefined") {
  const saved = localStorage.getItem(ANNOUNCEMENTS_KEY);
  if (!saved) {
    announcements = DEFAULT_ANNOUNCEMENTS;
    saveAnnouncements();
  }
}
