"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

export interface Member {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  birthDate: string;
  team: string;
  role: string;
  avatarUrl?: string;
  joinDate: string;
  bio?: string;
}

const STORAGE_KEY = "huayu-hub-members";

// Default initial data (used as fallback when Supabase is not available)
const defaultMembers: Member[] = [
  {
    id: "founder",
    fullName: "Pham Cong Tai",
    email: "founder@huayuhub.com",
    phone: "0901234567",
    birthDate: "1985-03-15",
    team: "Executive",
    role: "Founder",
    joinDate: "2020-01-01",
    bio: "Visionary leader and founder of HuaYu Hub",
  },
  {
    id: "co-founder",
    fullName: "Tran Minh CoFounder",
    email: "cofounder@huayuhub.com",
    phone: "0912345678",
    birthDate: "1987-07-20",
    team: "Executive",
    role: "Co-Founder",
    joinDate: "2020-01-01",
    bio: "Co-founder driving strategic growth",
  },
];

let membersStore: Member[] = [...defaultMembers];
const listeners = new Set<(members: Member[]) => void>();

function notify() {
  listeners.forEach((fn) => fn([...membersStore]));
}

function saveToStorage() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(membersStore));
    } catch (e) {
      console.error("Failed to save members to storage:", e);
    }
  }
}

function loadFromStorage(): Member[] | null {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load members from storage:", e);
    }
  }
  return null;
}

const stored = loadFromStorage();
if (stored) {
  membersStore = stored;
}

export function updateMember(id: string, updates: Partial<Member>) {
  membersStore = membersStore.map((m) =>
    m.id === id ? { ...m, ...updates } : m
  );
  saveToStorage();
  notify();
}

// ============================================
// Supabase: Fetch from profiles table
// ============================================
export async function fetchMembersFromSupabase(): Promise<Member[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetch failed, using local store:", error.message);
      return getMembers();
    }

    if (data && data.length > 0) {
      const mapped: Member[] = data.map((row: any) => ({
        id: row.id,
        fullName: row.full_name || "",
        email: row.email || "",
        phone: row.phone || "",
        birthDate: row.date_of_birth || "",
        team: row.team || "Other",
        role: row.role || "Member",
        avatarUrl: row.avatar_url,
        joinDate: row.joined_date || row.created_at?.split("T")[0] || "",
        bio: row.bio,
      }));
      membersStore = mapped;
      saveToStorage();
      notify();
      return mapped;
    }
    return getMembers();
  } catch (e) {
    console.warn("Supabase not available, using local store:", e);
    return getMembers();
  }
}

// ============================================
// Supabase: Update profile
// ============================================
export async function updateMemberInSupabase(
  id: string,
  updates: Partial<Member>
): Promise<boolean> {
  try {
    const supabase = createClient();
    const updateData: Record<string, unknown> = {};
    if (updates.fullName !== undefined) updateData.full_name = updates.fullName;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.birthDate !== undefined)
      updateData.date_of_birth = updates.birthDate;
    if (updates.team !== undefined) updateData.team = updates.team;
    if (updates.role !== undefined) updateData.role = updates.role;
    if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl;
    if (updates.bio !== undefined) updateData.bio = updates.bio;

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.warn("Supabase update failed:", error.message);
      return false;
    }

    // If birthDate was updated, sync birthday_events table
    if (updates.birthDate !== undefined) {
      try {
        // The DB trigger sync_birthday_event should handle this automatically.
        // But we also call it client-side as fallback in case trigger doesn't exist.
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, full_name, date_of_birth")
          .eq("id", id)
          .single();

        if (profile?.date_of_birth) {
          await syncBirthdayEventClient(profile.id, profile.full_name, profile.date_of_birth);
        }
      } catch (e) {
        console.warn("Birthday sync after update failed:", e);
      }
    }

    return true;
  } catch (e) {
    console.warn("Supabase not available:", e);
    return false;
  }
}

// Local store functions
export function getMembers(): Member[] {
  return [...membersStore];
}

export function addMember(member: Member) {
  membersStore = [member, ...membersStore];
  saveToStorage();
  notify();
}

export async function deleteMember(id: string): Promise<boolean> {
  // Delete from local store first
  membersStore = membersStore.filter((m) => m.id !== id);
  saveToStorage();
  notify();

  // Delete from Supabase profiles
  try {
    const supabase = createClient();
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) console.warn("deleteMember profiles failed:", error.message);
  } catch (e) {
    console.warn("deleteMember profiles error:", e);
  }

  // Delete from birthday_events
  try {
    const supabase = createClient();
    const { error } = await supabase.from("birthday_events").delete().eq("user_id", id);
    if (error) console.warn("deleteMember birthday_events failed:", error.message);
  } catch (e) {
    console.warn("deleteMember birthday_events error:", e);
  }

  // Delete related tasks
  try {
    const supabase = createClient();
    const { error } = await supabase.from("tasks").delete().eq("assigned_to", id);
    if (error) console.warn("deleteMember tasks failed:", error.message);
  } catch (e) {
    console.warn("deleteMember tasks error:", e);
  }

  return true;
}

export function subscribeToMembers(fn: (members: Member[]) => void) {
  listeners.add(fn);
  fn([...membersStore]);
  return () => {
    listeners.delete(fn);
  };
}

// Hook for React components
export function useMemberStore() {
  const [members, setMembers] = useState<Member[]>(membersStore);

  useEffect(() => {
    const unsubscribe = subscribeToMembers(setMembers);
    // Try to sync with Supabase on mount
    fetchMembersFromSupabase().then((fetched) => {
      if (fetched.length !== membersStore.length) {
        setMembers(fetched);
      }
    });
    return unsubscribe;
  }, []);

  return {
    members,
    addMember,
    deleteMember,
    updateMember,
    updateMemberInSupabase,
    fetchMembersFromSupabase,
  };
}

/**
 * Client-side sync of birthday_events table.
 * Acts as fallback when the DB trigger sync_birthday_event() is not available.
 */
export async function syncBirthdayEventClient(
  userId: string,
  fullName: string,
  birthDate: string
): Promise<void> {
  try {
    const supabase = createClient();
    const now = new Date();
    const currentYear = now.getFullYear();
    const [byear, bmonth, bday] = birthDate.split("-").map(Number);

    if (!bmonth || !bday) return;

    // Calculate birthday for current year
    let eventDate = new Date(currentYear, bmonth - 1, bday);
    if (eventDate < now) {
      eventDate = new Date(currentYear + 1, bmonth - 1, bday);
    }

    const eventDateStr = eventDate.toISOString().split("T")[0];
    const eventYear = eventDate.getFullYear();

    // Upsert birthday event
    await supabase
      .from("birthday_events")
      .upsert(
        {
          user_id: userId,
          full_name: fullName,
          birth_date: birthDate,
          event_date: eventDateStr,
          year: eventYear,
        },
        { onConflict: "user_id,year" }
      );
  } catch (e) {
    console.warn("syncBirthdayEventClient error:", e);
  }
}
