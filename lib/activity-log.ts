"use client";

/**
 * Member Activity Log Service
 * Tracks member actions: register, post, comment, like, join activity, task assigned.
 * Stored in localStorage for immediate display on Dashboard Timeline.
 */

export type ActivityType =
  | "register"
  | "post"
  | "comment"
  | "like"
  | "join_activity"
  | "task_assigned"
  | "task_completed"
  | "announcement";

export interface MemberActivity {
  id: string;
  type: ActivityType;
  actorName: string;
  actorId?: string;
  title: string;
  timestamp: number;
  route: string;
}

const STORAGE_KEY = "huayu-hub-activity-log";
const MAX_ENTRIES = 50;

let activities: MemberActivity[] = [];
let listeners = new Set<(activities: MemberActivity[]) => void>();

function load() {
  if (typeof window === "undefined") return;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      activities = JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load activity log:", e);
  }
}

function save() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  } catch (e) {
    console.error("Failed to save activity log:", e);
  }
}

function notify() {
  listeners.forEach((fn) => fn([...activities]));
}

load();

export function logActivity(entry: Omit<MemberActivity, "id" | "timestamp"> & { timestamp?: number }) {
  load();
  const newEntry: MemberActivity = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: entry.timestamp || Date.now(),
    type: entry.type,
    actorName: entry.actorName,
    actorId: entry.actorId,
    title: entry.title,
    route: entry.route,
  };
  activities.unshift(newEntry);
  if (activities.length > MAX_ENTRIES) {
    activities = activities.slice(0, MAX_ENTRIES);
  }
  save();
  notify();
}

export function getActivities(): MemberActivity[] {
  load();
  return [...activities];
}

export function getRecentActivities(limit: number = 10): MemberActivity[] {
  load();
  return activities.slice(0, limit);
}

export function subscribeToActivityLog(fn: (activities: MemberActivity[]) => void) {
  listeners.add(fn);
  fn([...activities]);
  return () => {
    listeners.delete(fn);
  };
}

/**
 * Format timestamp to relative time string in Vietnamese.
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "Vua xong";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} phut truoc`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} gio truoc`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} ngay truoc`;
  return new Date(timestamp).toLocaleDateString("vi-VN");
}

/**
 * Get icon name for an activity type (used by UI components).
 */
export function getActivityIcon(type: ActivityType): string {
  switch (type) {
    case "register": return "UserPlus";
    case "post": return "FileText";
    case "comment": return "MessageSquare";
    case "like": return "Heart";
    case "join_activity": return "CalendarDays";
    case "task_assigned": return "ClipboardList";
    case "task_completed": return "CheckCircle";
    case "announcement": return "Megaphone";
    default: return "Activity";
  }
}

/**
 * Get color for an activity type.
 */
export function getActivityColor(type: ActivityType): string {
  switch (type) {
    case "register": return "#4A7C59";
    case "post": return "#2E6B8A";
    case "comment": return "#6B5B95";
    case "like": return "#E91E63";
    case "join_activity": return "#D4A843";
    case "task_assigned": return "#C62828";
    case "task_completed": return "#2E7D32";
    case "announcement": return "#C62828";
    default: return "#757575";
  }
}
