"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Task,
  getTasks,
  completeTask,
} from "@/lib/task-service";
import { TaskCard } from "@/features/tasks/components/task-card";
import { CreateTaskDialog } from "@/features/tasks/components/create-task-dialog";
import { fetchMembersFromSupabase, Member } from "@/lib/member-service";
import { useAuthContext } from "@/features/auth/providers/auth-provider";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Clock,
  User,
  Users,
  Flag,
  Link as LinkIcon,
  CalendarDays,
  ClipboardList,
} from "lucide-react";

interface MemberOption {
  id: string;
  name: string;
}

const TEAMS = [
  "Media",
  "Design",
  "Content",
  "Teaching Assistant",
  "Operation",
  "Partner",
  "Executive",
];

export default function TasksPage() {
  const t = useTranslations("tasks");
  const { user } = useAuthContext();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const data = await getTasks();
    setTasks(data);
    setLoading(false);
  }, []);

  const fetchMembers = useCallback(async () => {
    const data = await fetchMembersFromSupabase();
    setMembers(
      data.map((m: Member) => ({
        id: m.id,
        name: m.fullName,
      }))
    );
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchMembers();
  }, [fetchTasks, fetchMembers]);

  const handleComplete = async (id: string) => {
    const updated = await completeTask(id);
    if (updated) {
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const groupTasksByTeam = (tasks: Task[]): Record<string, Task[]> => {
    const grouped: Record<string, Task[]> = {};
    TEAMS.forEach((team) => {
      grouped[team] = [];
    });
    tasks.forEach((task) => {
      if (!grouped[task.team]) {
        grouped[task.team] = [];
      }
      grouped[task.team].push(task);
    });
    // Sort each team's tasks by start_date descending (newest first)
    Object.keys(grouped).forEach((team) => {
      grouped[team].sort(
        (a, b) =>
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      );
    });
    return grouped;
  };

  const groupedTasks = groupTasksByTeam(tasks);

  const getMemberName = (id: string | null) => {
    if (!id) return null;
    const m = members.find((mem) => mem.id === id);
    return m?.name || id;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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

  return (
    <div className="min-h-screen bg-[#F6F1E8]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-black">{t("pageTitle")}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {t("pageSubtitle", { count: tasks.length })}
            </p>
          </div>
          <button
            onClick={() => setDialogOpen(true)}
            className="px-4 py-2.5 bg-[#C62828] text-white text-sm font-semibold rounded-lg hover:bg-[#a02222] transition-colors shadow-sm"
          >
            {t("newTaskButton")}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-[#C62828] border-t-transparent rounded-full animate-spin" />
            <p className="mt-3 text-sm text-gray-500">{t("loading")}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && tasks.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" strokeWidth={1} />
            <p className="text-gray-500">{t("noTasks")}</p>
            <button
              onClick={() => setDialogOpen(true)}
              className="mt-4 px-4 py-2 text-sm text-[#C62828] font-medium hover:underline"
            >
              {t("createFirstTask")}
            </button>
          </div>
        )}

        {/* Task Groups */}
        {!loading &&
          TEAMS.map((team) => {
            const teamTasks = groupedTasks[team] || [];
            if (teamTasks.length === 0) return null;

            return (
              <div key={team} className="mb-8">
                {/* Team Header */}
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-lg font-bold text-black">{team}</h2>
                  <span className="px-2 py-0.5 bg-[#C62828]/10 text-[#C62828] text-xs font-semibold rounded-full">
                    {teamTasks.length}
                  </span>
                </div>

                {/* Task Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={handleTaskClick}
                      onComplete={handleComplete}
                    />
                  ))}
                </div>
              </div>
            );
          })}

        {/* Create Task Dialog */}
        <CreateTaskDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          members={members}
          currentUserId={user?.id}
          onSuccess={fetchTasks}
        />

        {/* Task Detail Modal */}
        <AnimatePresence>
          {selectedTask && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="absolute inset-0 bg-black/40"
                onClick={() => setSelectedTask(null)}
              />
              <motion.div
                className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
              >
                {/* Header */}
                <div className="p-6 bg-[#C62828]/5 border-b border-[#C62828]/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#C62828]/10">
                        <ClipboardList className="w-5 h-5 text-[#C62828]" strokeWidth={1.5} />
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          {t("statusLabel")}
                        </span>
                        <h2 className="text-xl font-bold text-gray-900">
                          {selectedTask.title}
                        </h2>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedTask(null)}
                      className="p-2 rounded-lg hover:bg-black/5 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                  {/* Assignee */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100">
                      <User className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        {t("assigneeLabel")}
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {getMemberName(selectedTask.assigned_to) || t("unassigned")}
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
                        {t("teamLabel")}
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {selectedTask.team}
                      </p>
                    </div>
                  </div>

                  {/* Status + Priority */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100">
                      <Flag className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500">
                          {t("statusLabel")}
                        </p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${(statusLabels[selectedTask.status] || statusLabels.pending).bg} ${(statusLabels[selectedTask.status] || statusLabels.pending).text}`}>
                          {(statusLabels[selectedTask.status] || statusLabels.pending).label}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">
                          {t("priorityLabel")}
                        </p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${(priorityLabels[selectedTask.priority] || priorityLabels.medium).bg} ${(priorityLabels[selectedTask.priority] || priorityLabels.medium).text}`}>
                          {(priorityLabels[selectedTask.priority] || priorityLabels.medium).label}
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
                        {t("startDateLabel")}
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {formatDate(selectedTask.start_date)}
                      </p>
                    </div>
                  </div>

                  {/* Due Date */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100">
                      <Clock className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        {t("dueDateLabel")}
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {formatDate(selectedTask.due_date)}
                      </p>
                    </div>
                  </div>

                  {/* Related Link */}
                  {selectedTask.related_link && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-100">
                        <LinkIcon className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-500">
                          {t("linkLabel")}
                        </p>
                        <a
                          href={selectedTask.related_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-[#C62828] hover:underline truncate block"
                        >
                          {selectedTask.related_link}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {selectedTask.description && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        {t("descriptionLabel")}
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {selectedTask.description}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
