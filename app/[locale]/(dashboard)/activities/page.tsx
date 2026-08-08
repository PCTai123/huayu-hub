"use client";

import { useTranslations } from "next-intl";
import { ActivityList } from "@/features/activities/components/activity-list";

export default function ActivitiesPage() {
  return (
    <div className="w-full min-h-screen p-6 md:p-8">
      <ActivityList />
    </div>
  );
}
