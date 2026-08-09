"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
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

        {/* Login Form Card */}
        <LoginForm />

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
