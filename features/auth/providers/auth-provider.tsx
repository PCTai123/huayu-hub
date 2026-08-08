"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { createClient } from "@/lib/supabase";
import { useAuth, AuthUser, RegisterData } from "../hooks/use-auth";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<AuthUser>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (newPassword: string) => Promise<void>;
  updateProfile: (updates: {
    fullName?: string;
    avatarUrl?: string;
    dateOfBirth?: string;
    team?: string;
    role?: string;
    phone?: string;
    bio?: string;
  }) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ============================================
  // Initialize: Check if user is already logged in
  // ============================================
  useEffect(() => {
    let mounted = true;

    const initUser = async () => {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), 5000)
        );

        const currentUser = await Promise.race([
          auth.getUser(),
          timeoutPromise,
        ]);

        if (mounted) {
          setUser(currentUser);
        }
      } catch {
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initUser();

    // Listen for auth state changes (login, logout, token refresh)
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_OUT") {
        if (mounted) setUser(null);
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        const currentUser = await auth.getUser();
        if (mounted) {
          setUser(currentUser);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================
  // Login
  // ============================================
  const login = useCallback(
    async (email: string, password: string) => {
      const loggedInUser = await auth.login(email, password);
      setUser(loggedInUser);
    },
    [auth]
  );

  // ============================================
  // Register
  // ============================================
  const register = useCallback(
    async (data: RegisterData) => {
      const newUser = await auth.register(data);
      // Auto-login: Supabase auto-creates session when email confirmation is OFF
      setUser(newUser);
      return newUser;
    },
    [auth]
  );

  // ============================================
  // Logout
  // ============================================
  const logout = useCallback(async () => {
    await auth.logout();
    setUser(null);
  }, [auth]);

  // ============================================
  // Forgot Password
  // ============================================
  const forgotPassword = useCallback(
    async (email: string) => {
      await auth.forgotPassword(email);
    },
    [auth]
  );

  // ============================================
  // Reset Password
  // ============================================
  const resetPassword = useCallback(
    async (newPassword: string) => {
      await auth.resetPassword(newPassword);
    },
    [auth]
  );

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
      await auth.updateProfile(updates);
      // Refresh user state
      const currentUser = await auth.getUser();
      setUser(currentUser);
    },
    [auth]
  );

  const clearError = useCallback(() => {
    auth.setError(null);
  }, [auth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        updateProfile,
        error: auth.error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
