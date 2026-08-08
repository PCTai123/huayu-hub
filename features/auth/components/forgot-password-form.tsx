"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { useAuthContext } from "../providers/auth-provider";
import Link from "next/link";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const pathname = usePathname();
  const { forgotPassword, error, clearError, isLoading } = useAuthContext();

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const locale = pathname.split("/")[1] || "vi";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch {
      // Error is handled by auth context
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-md mx-auto"
    >
      <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/25 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="pointer-events-none absolute -inset-px rounded-3xl border border-white/10" />
        <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-[#C62828]/10 blur-3xl" />

        <div className="relative">
          <div className="mb-8 text-center">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold tracking-tight text-[#2D2D2D] sm:text-4xl"
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              {t("forgotPasswordTitle")}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-2 text-sm text-[#5A5A5A]"
            >
              {t("forgotPasswordSubtitle")}
            </motion.p>
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100/50 backdrop-blur-sm">
                <svg
                  className="h-8 w-8 text-green-600"
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
              <p className="text-sm text-[#5A5A5A]">{t("resetSentLong")}</p>
              <p className="mt-2 text-sm font-medium text-[#2D2D2D]">
                {email}
              </p>
              <button
                onClick={() => router.push(`/${locale}/login`)}
                className="mt-6 w-full rounded-xl bg-[#C62828] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#C62828]/25 transition-all hover:bg-[#A02222]"
              >
                {t("backToLogin")}
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden rounded-xl bg-[#C62828]/10 px-4 py-3 text-sm text-[#C62828] backdrop-blur-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="mb-1.5 block text-sm font-medium text-[#2D2D2D]">
                  {t("emailLabel")}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/30 bg-white/40 px-4 py-3 text-[#2D2D2D] placeholder-[#9A9A9A] shadow-sm outline-none transition-all duration-300 focus:border-[#C62828]/50 focus:bg-white/60 focus:ring-2 focus:ring-[#C62828]/20"
                  placeholder={t("emailPlaceholder")}
                />
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C62828] px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#C62828]/25 transition-all duration-300 hover:bg-[#A02222] hover:shadow-[#C62828]/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading && (
                  <svg
                    className="h-5 w-5 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
                {isLoading ? t("sending") : t("sendResetLink")}
              </motion.button>

              <div className="text-center">
                <Link
                  href={`/${locale}/login`}
                  className="text-sm font-medium text-[#C62828] transition-colors hover:text-[#A02222] hover:underline"
                >
                  {t("backToLogin")}
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
}
