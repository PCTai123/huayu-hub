"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { CalendarView } from "@/features/calendar/components/calendar-view";
import { CalendarEventCard } from "@/features/calendar/components/calendar-event-card";
import {
  CalendarDays,
  X,
  Clock,
  MapPin,
  Activity as ActivityIcon,
  AlertCircle,
  Cake,
  ClipboardList,
  Plus,
  Link as LinkIcon,
  User,
  Users,
  Flag,
} from "lucide-react";
import { subscribeToActivities } from "@/lib/activity-store";
import { Activity } from "@/features/activities/components/activity-card";
import { getTasks, Task } from "@/lib/task-service";
import { getBirthdayEvents, BirthdayEvent } from "@/lib/birthday-service";
import { CreateTaskDialog } from "@/features/tasks/components/create-task-dialog";
import { fetchMembersFromSupabase, Member } from "@/lib/member-service";
import { useAuthContext } from "@/features/auth/providers/auth-provider";

interface CalendarEventItem {
  id: string;
  title: string;
  date: Date;
  type: "activity" | "deadline" | "birthday" | "task";
  time?: string;
  description?: string;
  location?: string;
  person?: {
    name: string;
    age?: number;
    team?: string;
  };
  task?: {
    id: string;
    title: string;
    assigned_to: string | null;
    team: string;
    status: string;
    priority: string;
    due_date: string;
    start_date: string;
    description: string | null;
    related_link: string | null;
  };
}

export default function CalendarPage() {
  const t = useTranslations("calendar");
  const tTasks = useTranslations("tasks");
  const { user } = useAuthContext();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventItem | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [birthdays, setBirthdays] = useState<BirthdayEvent[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [taskData, bdayData, memberData] = await Promise.all([
        getTasks(),
        getBirthdayEvents(),
        fetchMembersFromSupabase(),
      ]);
      setTasks(taskData || []);
      setBirthdays(bdayData || []);
      setMembers(memberData || []);
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  /* Subscribe to activities */
  useEffect(() => {
    const unsubscribe = subscribeToActivities(setActivities);
    return unsubscribe;
  }, []);

  /* Fetch tasks, birthdays, members */
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  /* Convert activities to calendar events */
  const activityEvents: CalendarEventItem[] = useMemo(() => {
    return activities.map((act) => {
      const [year, month, day] = act.date.split("-").map(Number);
      return {
        id: act.id,
        title: act.name,
        date: new Date(year, month - 1, day),
        type: "activity" as const,
        time: act.time,
        description: act.description,
        location: act.organization,
      };
    });
  }, [activities]);

  /* Convert tasks to calendar events (use due_date) */
  const taskEvents: CalendarEventItem[] = useMemo(() => {
    return tasks.map((task) => ({
      id: `task-${task.id}`,
      title: task.title,
      date: new Date(task.due_date),
      type: "task" as const,
      time: "Deadline",
      description: task.description || "",
      task: {
        id: task.id,
        title: task.title,
        assigned_to: task.assigned_to,
        team: task.team,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date,
        start_date: task.start_date,
        description: task.description,
        related_link: task.related_link,
      },
    }));
  }, [tasks]);

  /* Convert birthdays to calendar events */
  const birthdayEvents: CalendarEventItem[] = useMemo(() => {
    return birthdays.map((bday) => {
      let age: number | undefined;
      if (bday.birth_date) {
        const birthYear = new Date(bday.birth_date).getFullYear();
        const eventYear = new Date(bday.event_date).getFullYear();
        age = eventYear - birthYear;
      }
      return {
        id: `birthday-${bday.id}`,
        title: `Sinh nhat: ${bday.full_name}`,
        date: new Date(bday.event_date),
        type: "birthday" as const,
        time: "All day",
        person: {
          name: bday.full_name,
          age,
          team: bday.team || "",
        },
      };
    });
  }, [birthdays]);

  /* Combine all events */
  const allEvents: CalendarEventItem[] = useMemo(() => {
    return [...activityEvents, ...taskEvents, ...birthdayEvents];
  }, [activityEvents, taskEvents, birthdayEvents]);

  const handleEventClick = (event: CalendarEventItem) => {
    setSelectedEvent(event);
  };

  const getTypeConfig = (type: CalendarEventItem["type"]) => {
    switch (type) {
      case "activity":
        return {
          icon: <ActivityIcon className="w-5 h-5 text-blue-500" />,
          label: t("activity"),
          bg: "bg-blue-50",
          border: "border-blue-200",
        };
      case "deadline":
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          label: t("deadline"),
          bg: "bg-red-50",
          border: "border-red-200",
        };
      case "birthday":
        return {
          icon: <Cake className="w-5 h-5 text-yellow-500" />,
          label: t("birthday"),
          bg: "bg-yellow-50",
          border: "border-yellow-200",
        };
      case "task":
        return {
          icon: <ClipboardList className="w-5 h-5 text-[#C62828]" />,
          label: t("task") || "Nhiem vu",
          bg: "bg-red-50",
          border: "border-red-200",
        };
    }
  };

  const statusLabels: Record<string, { label: string; bg: string; text: string }> = {
    pending: { label: "Cho xu ly", bg: "bg-yellow-100", text: "text-yellow-800" },
    in_progress: { label: "Dang thuc hien", bg: "bg-blue-100", text: "text-blue-800" },
    completed: { label: "Hoan thanh", bg: "bg-green-100", text: "text-green-800" },
    overdue: { label: "Qua han", bg: "bg-red-100", text: "text-red-800" },
  };

  const priorityLabels: Record<string, { label: string; bg: string; text: string }> = {
    low: { label: "Thap", bg: "bg-gray-100", text: "text-gray-600" },
    medium: { label: "Trung binh", bg: "bg-yellow-100", text: "text-yellow-700" },
    high: { label: "Cao", bg: "bg-orange-100", text: "text-orange-700" },
    urgent: { label: "Khan cap", bg: "bg-red-100", text: "text-[#C62828]" },
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getMemberName = (id: string | null) => {
    if (!id) return null;
    const m = members.find((mem) => mem.id === id);
    return m?.fullName || id;
  };

  /* Upcoming events sorted by date */
  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return allEvents
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 6);
  }, [allEvents]);

  return (
    <div className="space-y-6">
      {/* Header with Create Task button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-[20px] bg-[#C62828] shadow-lg">
            <CalendarDays className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black">{t("title")}</h1>
            <p className="text-gray-600 mt-1">{t("subtitle")}</p>
          </div>
        </div>
        <button
          onClick={() => setTaskDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#C62828] text-white text-sm font-semibold rounded-lg hover:bg-[#a02222] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>{tTasks("newTaskButton") || "Giao task"}</span>
        </button>
      </motion.div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-2 border-[#C62828] border-t-transparent rounded-full animate-spin" />
          <p className="mt-3 text-sm text-gray-500">{tTasks("loading")}</p>
        </div>
      )}

      {/* Calendar + Events below */}
      {!loading && (
        <div className="space-y-6">
          {/* Calendar View */}
          <CalendarView events={allEvents as any} onEventClick={handleEventClick as any} />

          {/* Upcoming Events */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-black">{t("upcomingEvents")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, index) => (
                  <CalendarEventCard
                    key={event.id}
                    event={event as any}
                    index={index}
                    onClick={handleEventClick as any}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-8 bg-white rounded-xl border border-gray-200">
                  <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-2" strokeWidth={1} />
                  <p className="text-sm text-gray-500">{t("noUpcomingEvents") || "Khong co su kien sap toi"}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Event/Task Detail Dialog */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/40"
              onClick={() => setSelectedEvent(null)}
            />
            <motion.div
              className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
            >
              {/* Header */}
              <div
                className={`p-6 ${getTypeConfig(selectedEvent.type).bg} border-b ${
                  getTypeConfig(selectedEvent.type).border
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTypeConfig(selectedEvent.type).icon}
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {getTypeConfig(selectedEvent.type).label}
                      </span>
                      <h2 className="text-xl font-bold text-gray-900">
                        {selectedEvent.title}
                      </h2>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="p-2 rounded-lg hover:bg-black/5 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                {/* Time */}
                {selectedEvent.time && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100">
                      <Clock className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        {t("time")}
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {selectedEvent.time}
                      </p>
                    </div>
                  </div>
                )}

                {/* Date */}
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <CalendarDays className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">{t("date")}</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {selectedEvent.date.toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>

                {/* Location (for activities) */}
                {selectedEvent.location && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100">
                      <MapPin className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        {t("location")}
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {selectedEvent.location}
                      </p>
                    </div>
                  </div>
                )}

                {/* Person (for birthdays) */}
                {selectedEvent.person && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-100">
                      <User className="w-4 h-4 text-yellow-600" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">{t("person")}</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {selectedEvent.person.name}
                        {selectedEvent.person.age !== undefined &&
                          ` - ${selectedEvent.person.age} ${t("yearsOld")}`}
                        {selectedEvent.person.team && ` (${selectedEvent.person.team})`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Task Details */}
                {selectedEvent.task && (
                  <>
                    {/* Assignee */}
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-100">
                        <User className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">
                          {tTasks("assigneeLabel") || "Nguoi phu trach"}
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                          {getMemberName(selectedEvent.task.assigned_to) ||
                            (tTasks("unassigned") || "Chua gan")}
                        </p>
                      </div>
                    </div>

                    {/* Team */}
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-100">
                        <Users className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">
                          {tTasks("teamLabel") || "Team"}
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                          {selectedEvent.task.team}
                        </p>
                      </div>
                    </div>

                    {/* Status + Priority */}
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-100">
                        <Flag className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                      </div>
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="text-xs font-medium text-gray-500">
                            {tTasks("statusLabel") || "Trang thai"}
                          </p>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                              (statusLabels[selectedEvent.task.status] || statusLabels.pending).bg
                            } ${
                              (statusLabels[selectedEvent.task.status] || statusLabels.pending).text
                            }`}
                          >
                            {(statusLabels[selectedEvent.task.status] || statusLabels.pending).label}
                          </span>
                        </div>
                        <div className="ml-4">
                          <p className="text-xs font-medium text-gray-500">
                            {tTasks("priorityLabel") || "Do uu tien"}
                          </p>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                              (priorityLabels[selectedEvent.task.priority] || priorityLabels.medium).bg
                            } ${
                              (priorityLabels[selectedEvent.task.priority] || priorityLabels.medium).text
                            }`}
                          >
                            {(priorityLabels[selectedEvent.task.priority] || priorityLabels.medium).label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Start Date */}
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-100">
                        <CalendarDays className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">
                          {tTasks("startDateLabel") || "Ngay bat dau"}
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                          {formatDate(selectedEvent.task.start_date)}
                        </p>
                      </div>
                    </div>

                    {/* Related Link */}
                    {selectedEvent.task.related_link && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-100">
                          <LinkIcon className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-500">
                            {tTasks("linkLabel") || "Link"}
                          </p>
                          <a
                            href={selectedEvent.task.related_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-[#C62828] hover:underline truncate block"
                          >
                            {selectedEvent.task.related_link}
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {selectedEvent.task.description && (
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          {tTasks("descriptionLabel") || "Mo ta"}
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {selectedEvent.task.description}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Description (for non-task events) */}
                {!selectedEvent.task && selectedEvent.description && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      {t("description")}
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedEvent.description}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        members={members.map((m) => ({ id: m.id, name: m.fullName }))}
        currentUserId={user?.id}
        onSuccess={fetchAllData}
      />
    </div>
  );
}
