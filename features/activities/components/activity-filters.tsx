"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Search,
  Calendar,
  Tag,
  Filter,
  ChevronDown,
} from "lucide-react";

export interface ActivityFilters {
  search: string;
  month: string;
  week: string;
  topic: string;
}

interface ActivityFiltersProps {
  filters: ActivityFilters;
  onFilterChange: (filters: ActivityFilters) => void;
}

const months = [
  { value: "", label: "Tất cả tháng" },
  { value: "1", label: "Tháng 1" },
  { value: "2", label: "Tháng 2" },
  { value: "3", label: "Tháng 3" },
  { value: "4", label: "Tháng 4" },
  { value: "5", label: "Tháng 5" },
  { value: "6", label: "Tháng 6" },
  { value: "7", label: "Tháng 7" },
  { value: "8", label: "Tháng 8" },
  { value: "9", label: "Tháng 9" },
  { value: "10", label: "Tháng 10" },
  { value: "11", label: "Tháng 11" },
  { value: "12", label: "Tháng 12" },
];

const weeks = [
  { value: "", label: "Tất cả tuần" },
  { value: "1", label: "Tuần 1" },
  { value: "2", label: "Tuần 2" },
  { value: "3", label: "Tuần 3" },
  { value: "4", label: "Tuần 4" },
];

const topics = [
  { value: "", label: "Tất cả chủ đề" },
  { value: "Hội thảo", label: "Hội thảo" },
  { value: "Workshop", label: "Workshop" },
  { value: "Cuộc thi", label: "Cuộc thi" },
  { value: "Tình nguyện", label: "Tình nguyện" },
  { value: "Giao lưu", label: "Giao lưu" },
  { value: "Học bổng", label: "Học bổng" },
  { value: "Khác", label: "Khác" },
];

export function ActivityFiltersComponent({
  filters,
  onFilterChange,
}: ActivityFiltersProps) {
  const t = useTranslations("activities");

  const handleChange = (field: keyof ActivityFilters, value: string) => {
    onFilterChange({ ...filters, [field]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[16px] bg-white border border-gray-200 shadow-sm p-4 mb-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-gray-600" />
        <h3 className="text-sm font-semibold text-gray-800">{t("filters")}</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleChange("search", e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-black placeholder-gray-400 focus:border-[#C62828] focus:outline-none focus:ring-1 focus:ring-red-100"
            placeholder={t("searchPlaceholder")}
          />
        </div>

        {/* Month Filter */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={filters.month}
            onChange={(e) => handleChange("month", e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-300 bg-white text-sm text-black appearance-none cursor-pointer focus:border-[#C62828] focus:outline-none focus:ring-1 focus:ring-red-100"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Week Filter */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={filters.week}
            onChange={(e) => handleChange("week", e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-300 bg-white text-sm text-black appearance-none cursor-pointer focus:border-[#C62828] focus:outline-none focus:ring-1 focus:ring-red-100"
          >
            {weeks.map((w) => (
              <option key={w.value} value={w.value}>
                {w.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Topic Filter */}
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={filters.topic}
            onChange={(e) => handleChange("topic", e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-300 bg-white text-sm text-black appearance-none cursor-pointer focus:border-[#C62828] focus:outline-none focus:ring-1 focus:ring-red-100"
          >
            {topics.map((topic) => (
              <option key={topic.value} value={topic.value}>
                {topic.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </motion.div>
  );
}
