"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export default function ResetPasswordPage() {
  const t = useTranslations("auth");

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Vietnam cultural background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/vietnam-bg.png')`,
        }}
      />
      {/* Subtle overlay to ensure form readability */}
      <div className="absolute inset-0 bg-[#F6F1E8]/40" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#C62828] shadow-xl shadow-[#C62828]/30">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1
            className="text-2xl font-bold text-[#2D2D2D] sm:text-3xl drop-shadow-sm"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            {t("appName")}
          </h1>
        </motion.div>

        <ResetPasswordForm />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-xs text-[#5A5A5A] drop-shadow-sm"
        >
          {t("copyright")}
        </motion.p>
      </div>
    </div>
  );
}
