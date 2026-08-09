import { createClient } from "@/lib/supabase";

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

/* ── In-memory cache (same pattern as member-service) ── */
let announcementsCache: Announcement[] = [];
let notificationsCache: NotificationItem[] = [];
let lastReadTime = 0;
let listeners = new Set<() => void>();
let notificationListeners = new Set<() => void>();

/* ── localStorage fallback keys ── */
const READ_KEY = "huayu-hub-notifications-read";

function loadReadTime() {
  if (typeof window === "undefined") return;
  try {
    const saved = localStorage.getItem(READ_KEY);
    if (saved) lastReadTime = parseInt(saved, 10);
  } catch {}
}

function saveReadTime() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(READ_KEY, String(lastReadTime));
  } catch {}
}

function notify() {
  listeners.forEach((fn) => fn());
}

function notifyNotificationListeners() {
  notificationListeners.forEach((fn) => fn());
}

/* ── Supabase helpers ── */

/**
 * Fetch announcements from Supabase
 */
export async function fetchAnnouncementsFromSupabase(): Promise<Announcement[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("fetchAnnouncements failed:", error.message);
      return announcementsCache;
    }

    announcementsCache = (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      date: row.date || row.created_at?.split("T")[0] || "",
      author: {
        name: row.author_name || "Admin",
        avatar: row.author_avatar || undefined,
      },
      createdAt: new Date(row.created_at).getTime(),
    }));

    notify();
    return announcementsCache;
  } catch (e) {
    console.warn("fetchAnnouncements error:", e);
    return announcementsCache;
  }
}

/**
 * Fetch notifications from Supabase
 */
export async function fetchNotificationsFromSupabase(): Promise<NotificationItem[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.warn("fetchNotifications failed:", error.message);
      return notificationsCache;
    }

    notificationsCache = (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      message: row.message || "",
      time: formatRelativeTime(row.created_at),
      unread: !row.is_read,
      createdAt: new Date(row.created_at).getTime(),
    }));

    notifyNotificationListeners();
    return notificationsCache;
  } catch (e) {
    console.warn("fetchNotifications error:", e);
    return notificationsCache;
  }
}

/* ── Public API ── */

export function getAnnouncements(): Announcement[] {
  return [...announcementsCache];
}

export function getNotifications(): NotificationItem[] {
  loadReadTime();
  return [...notificationsCache];
}

export function getUnreadCount(): number {
  loadReadTime();
  return notificationsCache.filter(
    (n) => n.unread && n.createdAt > lastReadTime
  ).length;
}

/**
 * Add an announcement to Supabase + create a notification
 */
export async function addAnnouncement(data: {
  title: string;
  content: string;
  authorName: string;
  authorAvatar?: string;
}): Promise<Announcement | null> {
  try {
    const supabase = createClient();
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];

    const { data: row, error } = await supabase
      .from("announcements")
      .insert({
        title: data.title,
        content: data.content,
        author_name: data.authorName,
        author_avatar: data.authorAvatar || null,
        date: dateStr,
      })
      .select()
      .single();

    if (error || !row) {
      console.warn("addAnnouncement failed:", error?.message);
      return null;
    }

    const ann: Announcement = {
      id: row.id,
      title: row.title,
      content: row.content,
      date: row.date,
      author: {
        name: row.author_name,
        avatar: row.author_avatar || undefined,
      },
      createdAt: new Date(row.created_at).getTime(),
    };

    announcementsCache = [ann, ...announcementsCache];
    notify();

    // Also create a notification
    await createNotification({
      title: data.title,
      message: data.content.substring(0, 60) + (data.content.length > 60 ? "..." : ""),
      type: "announcement",
      related_id: row.id,
      related_type: "announcement",
    });

    return ann;
  } catch (e) {
    console.warn("addAnnouncement error:", e);
    return null;
  }
}

/**
 * Create a notification in Supabase (global for all users)
 */
export async function createNotification(data: {
  title: string;
  message: string;
  type?: string;
  related_id?: string;
  related_type?: string;
  user_id?: string | null;
}): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("notifications").insert({
      user_id: data.user_id || null,
      title: data.title,
      message: data.message,
      type: data.type || "announcement",
      related_id: data.related_id || null,
      related_type: data.related_type || null,
      is_read: false,
    });

    if (error) {
      console.warn("createNotification failed:", error.message);
      return false;
    }

    // Refresh cache
    await fetchNotificationsFromSupabase();
    return true;
  } catch (e) {
    console.warn("createNotification error:", e);
    return false;
  }
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

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMin = Math.floor((now - then) / (1000 * 60));
  if (diffMin < 1) return "Vua xong";
  if (diffMin < 60) return `${diffMin} phut truoc`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} gio truoc`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} ngay truoc`;
}

/* Seed on first mount (lazy, not at module init) */
export async function seedDefaultAnnouncementsIfEmpty() {
  if (announcementsCache.length > 0) return;
  await fetchAnnouncementsFromSupabase();
}
