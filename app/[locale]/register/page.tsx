"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
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

      {/* Content - centered both horizontally and vertically */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        {/* Logo / Brand */}
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
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

        {/* Register Form Card */}
        <RegisterForm />

        {/* Footer */}
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
