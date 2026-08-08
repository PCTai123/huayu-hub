"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthContext } from "../providers/auth-provider";

interface ForgotPasswordDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ForgotPasswordDialog({
  open,
  onClose,
}: ForgotPasswordDialogProps) {
  const t = useTranslations("auth");
  const { forgotPassword, isLoading } = useAuthContext();

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch {
      // Error is handled by auth context
    }
  };

  const handleClose = () => {
    setEmail("");
    setSubmitted(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/20 bg-white/30 p-8 shadow-2xl backdrop-blur-xl"
          >
            <div className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-[#C62828]/10 blur-2xl" />

            <div className="relative">
              <div className="mb-6 text-center">
                <h2
                  className="text-2xl font-bold text-[#2D2D2D]"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {t("resetPassword")}
                </h2>
                <p className="mt-1 text-sm text-[#5A5A5A]">
                  {t("resetPasswordSubtitle")}
                </p>
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
                  <p className="text-sm text-[#5A5A5A]">{t("resetSent")}</p>
                  <button
                    onClick={handleClose}
                    className="mt-6 w-full rounded-xl bg-[#C62828] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#C62828]/25 transition-all hover:bg-[#A02222]"
                  >
                    {t("backToLogin")}
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="reset-email"
                      className="mb-1.5 block text-sm font-medium text-[#2D2D2D]"
                    >
                      {t("emailLabel")}
                    </label>
                    <input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full rounded-xl border border-white/30 bg-white/40 px-4 py-3 text-[#2D2D2D] placeholder-[#9A9A9A] shadow-sm outline-none transition-all duration-300 focus:border-[#C62828]/50 focus:bg-white/60 focus:ring-2 focus:ring-[#C62828]/20"
                      placeholder={t("emailPlaceholder")}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 rounded-xl border border-white/30 bg-white/20 px-4 py-3 text-sm font-medium text-[#2D2D2D] transition-all hover:bg-white/40"
                    >
                      {t("cancel")}
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#C62828] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#C62828]/25 transition-all hover:bg-[#A02222] disabled:opacity-60"
                    >
                      {isLoading && (
                        <svg
                          className="h-4 w-4 animate-spin"
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
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
