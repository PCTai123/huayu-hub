"use client";

import { useTranslations } from "next-intl";
import { Task, TaskStatus, TaskPriority } from "@/lib/task-service";

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  onComplete?: (id: string) => void;
}

const statusConfig: Record<TaskStatus, { label: string; bg: string; text: string }> = {
  pending: { label: "Cho xu ly", bg: "bg-yellow-100", text: "text-yellow-800" },
  in_progress: { label: "Dang thuc hien", bg: "bg-blue-100", text: "text-blue-800" },
  completed: { label: "Hoan thanh", bg: "bg-green-100", text: "text-green-800" },
  overdue: { label: "Qua han", bg: "bg-red-100", text: "text-red-800" },
};

const priorityConfig: Record<TaskPriority, { label: string; bg: string; text: string }> = {
  low: { label: "Thap", bg: "bg-gray-100", text: "text-gray-600" },
  medium: { label: "Trung binh", bg: "bg-yellow-100", text: "text-yellow-700" },
  high: { label: "Cao", bg: "bg-orange-100", text: "text-orange-700" },
  urgent: { label: "Khan cap", bg: "bg-red-100", text: "text-[#C62828]" },
};

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function isOverdue(dueDate: string, status: TaskStatus): boolean {
  if (status === "completed") return false;
  return new Date(dueDate) < new Date();
}

export function TaskCard({ task, onClick, onComplete }: TaskCardProps) {
  const t = useTranslations("tasks");
  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];
  const overdue = isOverdue(task.due_date, task.status);

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick?.(task)}
    >
      {/* Header: Title + Status */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-bold text-[#C62828] text-base leading-snug line-clamp-2 flex-1">
          {task.title}
        </h3>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
            {t(`status.${task.status}`)}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priority.bg} ${priority.text}`}>
            {t(`priority.${task.priority}`)}
          </span>
        </div>
      </div>

      {/* Assignee + Avatar */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-[#C62828] text-white flex items-center justify-center text-xs font-semibold">
          {task.assigned_to ? task.assigned_to.charAt(0).toUpperCase() : "?"}
        </div>
        <span className="text-sm text-gray-700">
          {task.assigned_to || t("unassigned")}
        </span>
      </div>

      {/* Deadline */}
      <div className={`text-sm mb-2 ${overdue ? "text-[#C62828] font-semibold" : "text-gray-500"}`}>
        {t("deadline")}: {formatDate(task.due_date)}
        {overdue && <span className="ml-1">({t("overdue")})</span>}
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      {/* Action buttons */}
      {task.status !== "completed" && onComplete && (
        <button
          className="mt-1 px-3 py-1.5 bg-[#C62828] text-white text-sm rounded-md hover:bg-[#a02222] transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onComplete(task.id);
          }}
        >
          {t("mark_complete")}
        </button>
      )}

      {task.status === "completed" && task.completed_at && (
        <div className="text-xs text-gray-400 mt-1">
          {t("completed_at")}: {formatDate(task.completed_at)}
        </div>
      )}
    </div>
  );
}
