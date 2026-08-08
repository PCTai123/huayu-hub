"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { useAuthContext } from "../providers/auth-provider";
import Link from "next/link";

export function RegisterForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const pathname = usePathname();
  const { register, error, clearError, isLoading } = useAuthContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [team, setTeam] = useState("");
  const [role, setRole] = useState("Member");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const locale = pathname.split("/")[1] || "vi";

  const teams = [
    "Media",
    "Design",
    "Content",
    "Teaching Assistant",
    "Operation",
    "Partner",
    "Other",
  ];

  const roles = [
    { value: "Member", label: "Member" },
    { value: "Founder", label: "Founder" },
    { value: "Co-Founder", label: "Co-Founder" },
    { value: "Admin", label: "Admin" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setPasswordError(null);

    // Client-side validation
    if (password.length < 6) {
      setPasswordError(t("passwordTooShort"));
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError(t("passwordMismatch"));
      return;
    }

    try {
      const newUser = await register({
        email,
        password,
        fullName,
        team: team || "Other",
        role,
        dateOfBirth: dateOfBirth || undefined,
      });
      setSuccess(true);
      // Auto-redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        router.push(`/${locale}/`);
      }, 1500);
    } catch {
      // Error is handled by auth context
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md mx-auto"
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/25 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-green-400/10 blur-3xl" />

          <div className="relative text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100/50 backdrop-blur-sm">
              <svg
                className="h-10 w-10 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h3 className="mb-2 text-2xl font-bold text-gray-900">
              {t("registerSuccess")}
            </h3>
            <p className="text-gray-600">
              {t("registerSuccessDesc")}
            </p>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="mt-6 h-1 rounded-full bg-gradient-to-r from-green-400 to-emerald-400"
            />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-md mx-auto"
    >
      <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/25 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#C62828]/10 blur-3xl" />

        <div className="relative">
          {/* Header */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              {t("registerTitle")}
            </h2>
            <p className="mt-2 text-gray-600">{t("registerSubtitle")}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="mb-1.5 block text-sm font-medium text-[#2D2D2D]">
                {t("fullNameLabel")}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("fullNamePlaceholder")}
                required
                className="w-full rounded-xl border border-white/30 bg-white/40 px-4 py-3 text-[#2D2D2D] shadow-sm outline-none transition-all duration-300 focus:border-[#C62828]/50 focus:bg-white/60 focus:ring-2 focus:ring-[#C62828]/20"
              />
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="mb-1.5 block text-sm font-medium text-[#2D2D2D]">
                {t("emailLabel")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                required
                className="w-full rounded-xl border border-white/30 bg-white/40 px-4 py-3 text-[#2D2D2D] shadow-sm outline-none transition-all duration-300 focus:border-[#C62828]/50 focus:bg-white/60 focus:ring-2 focus:ring-[#C62828]/20"
              />
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="mb-1.5 block text-sm font-medium text-[#2D2D2D]">
                {t("passwordLabel")}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("passwordPlaceholder")}
                required
                className="w-full rounded-xl border border-white/30 bg-white/40 px-4 py-3 text-[#2D2D2D] shadow-sm outline-none transition-all duration-300 focus:border-[#C62828]/50 focus:bg-white/60 focus:ring-2 focus:ring-[#C62828]/20"
              />
            </motion.div>

            {/* Confirm Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="mb-1.5 block text-sm font-medium text-[#2D2D2D]">
                {t("confirmPasswordLabel")}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t("confirmPasswordPlaceholder")}
                required
                className="w-full rounded-xl border border-white/30 bg-white/40 px-4 py-3 text-[#2D2D2D] shadow-sm outline-none transition-all duration-300 focus:border-[#C62828]/50 focus:bg-white/60 focus:ring-2 focus:ring-[#C62828]/20"
              />
            </motion.div>

            {/* Team */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="mb-1.5 block text-sm font-medium text-[#2D2D2D]">
                {t("teamLabel")}
              </label>
              <select
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="w-full rounded-xl border border-white/30 bg-white/40 px-4 py-3 text-[#2D2D2D] shadow-sm outline-none transition-all duration-300 focus:border-[#C62828]/50 focus:bg-white/60 focus:ring-2 focus:ring-[#C62828]/20"
              >
                <option value="">{t("selectTeam")}</option>
                {teams.map((tName) => (
                  <option key={tName} value={tName}>
                    {tName}
                  </option>
                ))}
              </select>
            </motion.div>

            {/* Role */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.52 }}
            >
              <label className="mb-1.5 block text-sm font-medium text-[#2D2D2D]">
                {t("roleLabel")}
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl border border-white/30 bg-white/40 px-4 py-3 text-[#2D2D2D] shadow-sm outline-none transition-all duration-300 focus:border-[#C62828]/50 focus:bg-white/60 focus:ring-2 focus:ring-[#C62828]/20"
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </motion.div>

            {/* Birth Date */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 }}
            >
              <label className="mb-1.5 block text-sm font-medium text-[#2D2D2D]">
                {t("birthDateLabel")}
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
                className="w-full rounded-xl border border-white/30 bg-white/40 px-4 py-3 text-[#2D2D2D] shadow-sm outline-none transition-all duration-300 focus:border-[#C62828]/50 focus:bg-white/60 focus:ring-2 focus:ring-[#C62828]/20"
              />
            </motion.div>

            {/* Error Messages */}
            <AnimatePresence>
              {(error || passwordError) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
                >
                  {error || passwordError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-[#C62828] px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#a02222] focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  {t("registering")}
                </span>
              ) : (
                t("register")
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-600">
            {t("alreadyHaveAccount")}{" "}
            <Link
              href={`/${locale}/login`}
              className="font-semibold text-[#C62828] transition-colors hover:text-[#a02222]"
            >
              {t("signInHere")}
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
