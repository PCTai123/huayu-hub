"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ProfileCard } from "@/features/profile/components/profile-card";
import { EditProfileDialog } from "@/features/profile/components/edit-profile-dialog";
import { UserCircle } from "lucide-react";
import { updateMember, updateMemberInSupabase } from "@/lib/member-service";
import { useAuthContext } from "@/features/auth/providers/auth-provider";

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

const defaultProfile: ProfileData = {
  id: "founder",
  avatar: undefined,
  name: "Nguyen Thanh Founder",
  birthDate: "1985-03-15",
  team: "Executive",
  position: "Founder",
  joinDate: "2020-01-01",
  phone: "0901234567",
  email: "founder@huayuhub.com",
  bio: "Visionary leader and founder of HuaYu Hub",
};

function loadProfile(): ProfileData {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load profile:", e);
    }
  }
  return defaultProfile;
}

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
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const loaded = loadProfile();
    /* If auth user has data, merge it */
    if (user) {
      setProfile((prev) => ({
        ...prev,
        ...loaded,
        id: user.id,
        name: loaded.name || user.fullName || "",
        email: loaded.email || user.email || "",
        birthDate: loaded.birthDate || user.dateOfBirth || "",
        team: loaded.team || user.team || "",
      }));
    } else {
      setProfile(loaded);
    }
    setMounted(true);
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

    /* Sync Supabase profiles + birthday_events (via trigger + client fallback) */
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

      /* Also update auth context so user.dateOfBirth stays in sync */
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
        initial={{ opacity: 0, y: -20 }}
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
