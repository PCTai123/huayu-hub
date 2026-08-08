"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";

// ============================================
// Types
// ============================================
export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  role?: string;
  team?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  team?: string;
  role?: string;
  dateOfBirth?: string;
}

// ============================================
// Error Translation
// ============================================
function translateAuthError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  // Map common Supabase Auth error messages to Vietnamese
  const errorMap: Record<string, string> = {
    "Invalid login credentials":
      "Email hoac mat khau khong dung. Vui long thu lai.",
    "Email not confirmed":
      "Email chua duoc xac nhan. Vui long kiem tra hop thu va xac nhan email.",
    "User already registered":
      "Email nay da duoc dang ky. Vui long dang nhap hoac dung email khac.",
    "Password should be at least 6 characters":
      "Mat khau phai co it nhat 6 ky tu.",
    "Unable to validate email address":
      "Dia chi email khong hop le.",
    "Email rate limit exceeded":
      "Ban da gui qua nhieu yeu cau. Vui long doi it nhat 60 giay truoc khi thu lai.",
    "New password should be different from the old password":
      "Mat khau moi phai khac voi mat khau cu.",
    "Token has expired or is invalid":
      "Token het han hoac khong hop le. Vui long yeu cau dat lai mat khau moi.",
    "User not found":
      "Khong tim thay nguoi dung voi email nay.",
    "For security purposes, you can only request this after":
      "Ban da gui qua nhieu yeu cau dat lai mat khau. Vui long doi it nhat 60 giay.",
  };

  for (const [key, value] of Object.entries(errorMap)) {
    if (message.includes(key)) {
      return value;
    }
  }

  return message;
}

// ============================================
// Auth Hook
// ============================================
export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // Login
  // ============================================
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        throw authError;
      }

      if (!data.user) {
        throw new Error("Khong nhan duoc thong tin nguoi dung.");
      }

      // Fetch profile data
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.warn("Could not fetch profile:", profileError.message);
      }

      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email || email,
        fullName: profile?.full_name || data.user.email || "",
        role: profile?.role || "Member",
        team: profile?.team,
        avatarUrl: profile?.avatar_url,
        dateOfBirth: profile?.date_of_birth || undefined,
      };

      return user;
    } catch (err) {
      const translated = translateAuthError(err);
      setError(translated);
      throw new Error(translated);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // Register
  // ============================================
  const register = useCallback(async (data: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: data.role || "Member",
            team: data.team || "Other",
            date_of_birth: data.dateOfBirth || null,
          },
          /* Ensure auto sign-in when email confirmation is disabled */
          emailRedirectTo: undefined,
        },
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error("Dang ky khong thanh cong. Vui long thu lai.");
      }

      /* Step 2: Manually create profile row (trigger removed, do it here) */
      try {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: authData.user.id,
            full_name: data.fullName,
            email: data.email,
            role: data.role || "Member",
            team: data.team || "Other",
            date_of_birth: data.dateOfBirth || null,
            joined_date: new Date().toISOString().split("T")[0],
            status: "active",
          });

        if (profileError) {
          console.warn("Profile insert warning (may already exist):", profileError.message);
        }
      } catch (profileErr) {
        console.warn("Profile insert failed (non-critical):", profileErr);
      }

      return {
        id: authData.user.id,
        email: authData.user.email || data.email,
        fullName: data.fullName,
        role: data.role || "Member",
        team: data.team,
        dateOfBirth: data.dateOfBirth,
      } as AuthUser;
    } catch (err) {
      const translated = translateAuthError(err);
      setError(translated);
      throw new Error(translated);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // Logout
  // ============================================
  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signOut();

      if (authError) {
        throw authError;
      }
    } catch (err) {
      const translated = translateAuthError(err);
      setError(translated);
      throw new Error(translated);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // Forgot Password
  // ============================================
  const forgotPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/vi/reset-password`,
        }
      );

      if (authError) {
        throw authError;
      }
    } catch (err) {
      const translated = translateAuthError(err);
      setError(translated);
      throw new Error(translated);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // Reset Password (after clicking email link)
  // ============================================
  const resetPassword = useCallback(async (newPassword: string) => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (authError) {
        throw authError;
      }
    } catch (err) {
      const translated = translateAuthError(err);
      setError(translated);
      throw new Error(translated);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // Get Current User
  // ============================================
  const getUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return null;
      }

      // Fetch profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      return {
        id: user.id,
        email: user.email || "",
        fullName: profile?.full_name || user.email || "",
        role: profile?.role || "Member",
        team: profile?.team,
        avatarUrl: profile?.avatar_url,
        dateOfBirth: profile?.date_of_birth || undefined,
      };
    } catch {
      return null;
    }
  }, []);

  // ============================================
  // Update Profile
  // ============================================
  const updateProfile = useCallback(
    async (updates: {
      fullName?: string;
      avatarUrl?: string;
      dateOfBirth?: string;
      team?: string;
      role?: string;
      phone?: string;
      bio?: string;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("Ban can dang nhap de cap nhat ho so.");
        }

        const updateData: Record<string, unknown> = {};
        if (updates.fullName !== undefined)
          updateData.full_name = updates.fullName;
        if (updates.avatarUrl !== undefined)
          updateData.avatar_url = updates.avatarUrl;
        if (updates.dateOfBirth !== undefined)
          updateData.date_of_birth = updates.dateOfBirth;
        if (updates.team !== undefined) updateData.team = updates.team;
        if (updates.role !== undefined) updateData.role = updates.role;
        if (updates.phone !== undefined) updateData.phone = updates.phone;
        if (updates.bio !== undefined) updateData.bio = updates.bio;

        const { error: updateError } = await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", user.id);

        if (updateError) {
          throw updateError;
        }
      } catch (err) {
        const translated = translateAuthError(err);
        setError(translated);
        throw new Error(translated);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    getUser,
    updateProfile,
    loading,
    error,
    setError,
  };
}
