"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ExternalLink, Pencil } from "lucide-react";

interface DocumentCardProps {
  id: string;
  title: string;
  description: string;
  url: string;
  iconType: "drive" | "photos" | "certificate";
  index?: number;
  onEdit?: () => void;
}

function getIconByType(type: DocumentCardProps["iconType"]) {
  switch (type) {
    case "drive":
      return (
        <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none">
          <path
            d="M4.5 16.5L2 12l5.5-9.5h9L22 12l-2.5 4.5H4.5z"
            fill="#4285F4"
            opacity="0.8"
          />
          <path
            d="M7.5 12l2.5-4.5h6.5L19 12l-2.5 4.5H10L7.5 12z"
            fill="#34A853"
            opacity="0.8"
          />
          <path d="M7.5 12l2.5 4.5h6.5L14 12H7.5z" fill="#FBBC04" opacity="0.8" />
          <path d="M10 7.5L7.5 12H14l2.5-4.5H10z" fill="#EA4335" opacity="0.8" />
        </svg>
      );
    case "photos":
      return (
        <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none">
          <circle cx="12" cy="12" r="10" fill="#EA4335" opacity="0.8" />
          <circle cx="12" cy="12" r="6" fill="#FBBC04" opacity="0.8" />
          <circle cx="12" cy="12" r="3" fill="#34A853" opacity="0.8" />
          <circle cx="12" cy="12" r="1.5" fill="#4285F4" opacity="0.8" />
        </svg>
      );
    case "certificate":
      return (
        <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none">
          <rect
            x="3"
            y="4"
            width="18"
            height="14"
            rx="2"
            fill="#34A853"
            opacity="0.8"
          />
          <path
            d="M8 9h8M8 12h6"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M12 18l-2 3v-3H8l4-2 4 2h-2v3l-2-3z"
            fill="#FBBC04"
            opacity="0.9"
          />
        </svg>
      );
  }
}

export function DocumentCard({
  title,
  description,
  url,
  iconType,
  index = 0,
  onEdit,
}: DocumentCardProps) {
  const t = useTranslations("documents");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.15 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="relative overflow-hidden rounded-[20px] bg-white border border-gray-300 shadow-lg p-8 hover:shadow-xl hover:border-gray-400 transition-all duration-300 group"
    >
      {/* Edit Button — top-right corner */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit?.();
        }}
        className="absolute top-3 right-3 rounded-full p-2 bg-gray-100 hover:bg-[#C62828] border border-gray-200 hover:border-[#C62828] transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
        aria-label="Chinh sua link"
      >
        <Pencil className="w-4 h-4 text-gray-600 group-hover:text-white" strokeWidth={1.5} />
      </button>

      {/* Card Content — opens link */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center text-center gap-5 cursor-pointer"
      >
        {/* Icon */}
        <motion.div
          whileHover={{ rotate: 5, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="relative"
        >
          <div className="relative">{getIconByType(iconType)}</div>
        </motion.div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-black leading-tight">{title}</h3>
          <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>

        {/* Open Link */}
        <div className="flex items-center gap-1.5 text-sm text-[#C62828] font-medium hover:text-red-700 transition-colors">
          <span>{t("openDocument")}</span>
          <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
        </div>
      </a>
    </motion.div>
  );
}
