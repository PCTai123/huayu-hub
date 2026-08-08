"use client";

import { useTranslations } from "next-intl";
import { OrgChartTree } from "@/features/org-chart/components/org-chart-tree";
import { Users } from "lucide-react";

export default function OrgChartPage() {
  const t = useTranslations("orgChart");

  return (
    <div className="w-full min-h-screen p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl bg-amber-100/50">
          <Users className="w-6 h-6 text-amber-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-amber-900">
            {t("orgChart")}
          </h1>
          <p className="text-sm text-amber-600">{t("subtitle")}</p>
        </div>
      </div>

      {/* Org Chart Tree */}
      <OrgChartTree />
    </div>
  );
}
