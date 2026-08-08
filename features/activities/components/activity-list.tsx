"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Plus, CalendarDays } from "lucide-react";
import { ActivityCard, Activity } from "./activity-card";
import { ActivityFiltersComponent, ActivityFilters } from "./activity-filters";
import { CreateActivityDialog } from "./create-activity-dialog";
import { subscribeToActivities, addActivityToStore, deleteActivityFromStore } from "@/lib/activity-store";

export function ActivityList() {
  const t = useTranslations("activities");
  const [filters, setFilters] = useState<ActivityFilters>({
    search: "",
    month: "",
    week: "",
    topic: "",
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Subscribe to the shared activity store
  useEffect(() => {
    const unsubscribe = subscribeToActivities(setActivities);
    return unsubscribe;
  }, []);

  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    // Search filter
    if (
      filters.search &&
      !activity.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      !activity.organization
        .toLowerCase()
        .includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    // Month filter
    if (filters.month) {
      const activityMonth = new Date(activity.date).getMonth() + 1;
      if (activityMonth !== parseInt(filters.month)) return false;
    }

    // Week filter (simplified - week of month)
    if (filters.week) {
      const day = new Date(activity.date).getDate();
      const weekOfMonth = Math.ceil(day / 7);
      if (weekOfMonth !== parseInt(filters.week)) return false;
    }

    // Topic filter
    if (filters.topic && activity.topic !== filters.topic) {
      return false;
    }

    return true;
  });

  const handleCreateActivity = (data: any) => {
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      name: data.name,
      date: data.date,
      time: data.time,
      organization: data.organization,
      topic: data.topic,
      status: "upcoming",
      description: data.description,
      referenceLink: data.referenceLink || undefined,
      registrationLink: data.registrationLink || undefined,
    };
    addActivityToStore(newActivity);
  };

  const handleDeleteActivity = (id: string) => {
    deleteActivityFromStore(id);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gray-100">
            <CalendarDays className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black">
              {t("activities")}
            </h1>
            <p className="text-sm text-gray-600">{t("subtitle")}</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C62828] text-white font-medium shadow-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t("addActivity")}
        </motion.button>
      </div>

      {/* Filters */}
      <ActivityFiltersComponent filters={filters} onFilterChange={setFilters} />

      {/* Activity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredActivities.map((activity, index) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              index={index}
              onDelete={handleDeleteActivity}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredActivities.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <CalendarDays className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-lg font-medium text-gray-700">{t("noActivities")}</p>
          <p className="text-sm text-gray-500 mt-1">{t("adjustFilters")}</p>
        </motion.div>
      )}

      {/* Create Dialog */}
      <CreateActivityDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreateActivity}
      />
    </div>
  );
}
