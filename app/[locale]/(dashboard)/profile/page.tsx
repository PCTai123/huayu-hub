"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ProfileCard } from "@/features/profile/components/profile-card";
import { EditProfileDialog } from "@/features/profile/components/edit-profile-dialog";
import { UserCircle } from "lucide-react";
import { updateMember, updateMemberInSupabase } from "@/lib/member-service";
import { useAuthContext } from "@/features/auth/providers/auth-provider";
import { createClient } from "@/lib/supabase";

const STORAGE_KEY = "huayu-hub-profile";

interface ProfileData {
  id: string;
  avatar?: string;
  name: string;
  birthDate: string;
  team: string;
  position: string;
  joinDate: string;
  phone: string;
  email: string;
  bio: string;
}

/* Fallback for guests (not logged in) */
const guestProfile: ProfileData = {
  id: "guest",
  avatar: undefined,
  name: "",
  birthDate: "",
  team: "",
  position: "",
  joinDate: "",
  phone: "",
  email: "",
  bio: "",
};

function saveProfile(data: ProfileData) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save profile:", e);
    }
  }
}

export default function ProfilePage() {
  const t = useTranslations("profile");
  const { user, updateProfile } = useAuthContext();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData>(guestProfile);
  const [mounted, setMounted] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    async function loadProfile() {
      if (user) {
        /* Logged in: fetch full profile from Supabase for up-to-date data */
        try {
          const supabase = createClient();
          const { data: profileRow, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profileRow && !error) {
            setProfile({
              id: user.id,
              avatar: profileRow.avatar_url || undefined,
              name: profileRow.full_name || user.fullName || "",
              birthDate: profileRow.date_of_birth || "",
              team: profileRow.team || "",
              position: profileRow.role || "",
              joinDate: profileRow.joined_date || "",
              phone: profileRow.phone || "",
              email: profileRow.email || user.email || "",
              bio: profileRow.bio || "",
            });
            setMounted(true);
            return;
          }
        } catch (e) {
          console.warn("Failed to fetch profile from Supabase:", e);
        }

        /* Fallback: use what we have from auth context */
        setProfile({
          id: user.id,
          avatar: user.avatarUrl || undefined,
          name: user.fullName || "",
          birthDate: user.dateOfBirth || "",
          team: user.team || "",
          position: user.role || "",
          joinDate: "",
          phone: "",
          email: user.email || "",
          bio: "",
        });
      } else {
        /* Not logged in: check localStorage */
        if (typeof window !== "undefined") {
          try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
              setProfile(JSON.parse(saved));
              setMounted(true);
              return;
            }
          } catch (e) {
            console.error("Failed to load profile:", e);
          }
        }
        setProfile(guestProfile);
      }
      setMounted(true);
    }

    loadProfile();
  }, [user]);

  const handleSave = async (data: Partial<ProfileData>) => {
    const updated: ProfileData = { ...profile, ...data };
    setProfile(updated);
    saveProfile(updated);

    /* Sync local member store */
    updateMember(updated.id, {
      fullName: updated.name,
      email: updated.email,
      phone: updated.phone,
      birthDate: updated.birthDate,
      bio: updated.bio,
      avatarUrl: updated.avatar,
    });

    /* Sync Supabase profiles + birthday_events */
    const birthDateChanged = profile.birthDate !== updated.birthDate;
    try {
      await updateMemberInSupabase(updated.id, {
        fullName: updated.name,
        email: updated.email,
        phone: updated.phone,
        birthDate: updated.birthDate,
        bio: updated.bio,
        avatarUrl: updated.avatar,
      });

      if (birthDateChanged && updated.birthDate) {
        await updateProfile({ dateOfBirth: updated.birthDate });
      }
    } catch (e) {
      console.warn("Supabase sync failed, local only:", e);
    }
  };

  if (!mounted) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto pt-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-[20px] bg-[#C62828]">
            <UserCircle className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <div className="h-8 w-32 bg-gray-200 rounded mb-1" />
            <div className="h-4 w-48 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="h-96 bg-gray-100 rounded-[20px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pt-4">
      {/* Header */}
      <motion.div
        initial={isClient ? { opacity: 0, y: -20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-4"
      >
        <div className="p-3 rounded-[20px] bg-[#C62828] shadow-lg">
          <UserCircle className="w-8 h-8 text-white" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-black">{t("title")}</h1>
          <p className="text-gray-600 mt-1">{t("subtitle")}</p>
        </div>
      </motion.div>

      {/* Profile Card */}
      <ProfileCard
        {...profile}
        onEdit={() => setIsEditOpen(true)}
      />

      {/* Edit Dialog */}
      <EditProfileDialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        profile={profile}
        onSave={handleSave}
      />
    </div>
  );
}
