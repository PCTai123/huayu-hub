"use client";

import { createClient } from "@/lib/supabase";
import { fetchMembersFromSupabase, getMembers, Member } from "@/lib/member-service";

export interface BirthdayEvent {
  id: string;
  user_id: string | null;
  full_name: string;
  birth_date: string;
  event_date: string;
  year: number;
  team?: string;
}

/**
 * Fetch birthday events from Supabase birthday_events table.
 * Falls back to computing from member profiles if table is empty.
 */
export async function getBirthdayEvents(): Promise<BirthdayEvent[]> {
  try {
    const supabase = createClient();
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("birthday_events")
      .select("*")
      .gte("event_date", today)
      .order("event_date", { ascending: true });

    if (error) {
      console.warn("birthday_events fetch failed, computing from members:", error.message);
      return computeBirthdaysFromMembers();
    }

    if (data && data.length > 0) {
      // Enrich with team info from members
      const members = getMembers();
      const memberMap = new Map(members.map((m) => [m.id, m]));
      return data.map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        full_name: row.full_name,
        birth_date: row.birth_date,
        event_date: row.event_date,
        year: row.year,
        team: memberMap.get(row.user_id)?.team || "",
      }));
    }

    // Fallback: compute from members
    return computeBirthdaysFromMembers();
  } catch (e) {
    console.warn("Birthday service error, computing from members:", e);
    return computeBirthdaysFromMembers();
  }
}

/**
 * Compute upcoming birthday events from local member data.
 * Used as fallback when Supabase birthday_events table is not populated.
 */
function computeBirthdaysFromMembers(): BirthdayEvent[] {
  const members = getMembers();
  const now = new Date();
  const currentYear = now.getFullYear();
  const events: BirthdayEvent[] = [];

  for (const m of members) {
    if (!m.birthDate) continue;
    const [byear, bmonth, bday] = m.birthDate.split("-").map(Number);
    if (!bmonth || !bday) continue;

    // Calculate birthday for current year
    let eventDate = new Date(currentYear, bmonth - 1, bday);
    // If birthday already passed this year, use next year
    if (eventDate < now) {
      eventDate = new Date(currentYear + 1, bmonth - 1, bday);
    }

    events.push({
      id: `bday-${m.id}-${eventDate.getFullYear()}`,
      user_id: m.id,
      full_name: m.fullName,
      birth_date: m.birthDate,
      event_date: eventDate.toISOString().split("T")[0],
      year: eventDate.getFullYear(),
      team: m.team,
    });
  }

  // Sort by event_date ascending
  events.sort((a, b) => a.event_date.localeCompare(b.event_date));
  return events;
}

/**
 * Check for upcoming birthdays (7 days and 1 day before) and create
 * notifications in Supabase + local store.
 */
export async function checkAndCreateBirthdayNotifications(): Promise<void> {
  try {
    const events = await getBirthdayEvents();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const supabase = createClient();

    for (const event of events) {
      const eventDate = new Date(event.event_date);
      eventDate.setHours(0, 0, 0, 0);
      const diffDays = Math.round((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 7 || diffDays === 1) {
        // Check if notification already exists
        const { data: existing } = await supabase
          .from("notifications")
          .select("id")
          .eq("related_id", event.id)
          .eq("type", "birthday")
          .gte("created_at", new Date(Date.now() - diffDays * 24 * 60 * 60 * 1000).toISOString());

        if (existing && existing.length > 0) continue;

        // Create notification in Supabase
        const title = diffDays === 1 ? "Sinh nhat ngay mai!" : "Sinh nhat sap den!";
        const message = `${event.full_name} se co sinh nhat sau ${diffDays} ngay nua (${event.event_date})`;

        await supabase.from("notifications").insert({
          user_id: event.user_id,
          title,
          message,
          type: "birthday",
          related_id: event.id,
          related_type: "birthday_event",
          is_read: false,
        });

        // Also push to local notification store for immediate display
        pushBirthdayNotificationToLocal(title, message);
      }
    }
  } catch (e) {
    console.warn("checkAndCreateBirthdayNotifications error:", e);
  }
}

/**
 * Push a birthday notification to local store (announcement-store).
 */
function pushBirthdayNotificationToLocal(title: string, message: string) {
  if (typeof window === "undefined") return;
  try {
    const KEY = "huayu-hub-notifications";
    const saved = localStorage.getItem(KEY);
    const notifications = saved ? JSON.parse(saved) : [];

    // Check if this notification already exists (by title + message)
    const exists = notifications.some(
      (n: any) => n.title === title && n.message === message
    );
    if (exists) return;

    notifications.unshift({
      id: `bday-notif-${Date.now()}`,
      title,
      message,
      time: "Vua xong",
      unread: true,
      createdAt: Date.now(),
    });

    localStorage.setItem(KEY, JSON.stringify(notifications));
  } catch (e) {
    console.warn("pushBirthdayNotificationToLocal error:", e);
  }
}

/**
 * Fetch notifications from Supabase notifications table.
 * Merges with local store notifications.
 */
export async function getSupabaseNotifications(): Promise<any[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .or(`user_id.is.null`)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.warn("Notifications fetch failed:", error.message);
      return [];
    }

    return (data || []).map((n: any) => ({
      id: n.id,
      title: n.title,
      message: n.message || "",
      time: formatRelativeTime(n.created_at),
      unread: !n.is_read,
      createdAt: new Date(n.created_at).getTime(),
    }));
  } catch (e) {
    console.warn("getSupabaseNotifications error:", e);
    return [];
  }
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
