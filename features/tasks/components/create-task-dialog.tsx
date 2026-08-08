"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { createTask, CreateTaskInput } from "@/lib/task-service";

interface Member {
  id: string;
  name: string;
  email?: string;
}

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: Member[];
  currentUserId?: string;
  onSuccess?: () => void;
}

const TEAMS = [
  "Media",
  "Design",
  "Content",
  "Teaching Assistant",
  "Operation",
  "Partner",
];

export function CreateTaskDialog({
  open,
  onOpenChange,
  members,
  currentUserId,
  onSuccess,
}: CreateTaskDialogProps) {
  const t = useTranslations("tasks");

  const [title, setTitle] = useState("");
  const [team, setTeam] = useState(TEAMS[0]);
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [relatedLink, setRelatedLink] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const resetForm = useCallback(() => {
    setTitle("");
    setTeam(TEAMS[0]);
    setAssignedTo("");
    setDueDate("");
    setRelatedLink("");
    setDescription("");
    setPriority("medium");
    setErrors({});
  }, []);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) {
      errs.title = t("validation.titleRequired");
    }
    if (!dueDate) {
      errs.dueDate = t("validation.dueDateRequired");
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    /* Format dates properly for Supabase timestamp column */
    const startDateStr = new Date().toISOString();
    const dueDateStr = new Date(dueDate).toISOString();

    const data: CreateTaskInput = {
      title: title.trim(),
      description: description.trim() || null,
      assigned_to: assignedTo || null,
      assigned_by: currentUserId || null,
      team,
      priority,
      start_date: startDateStr,
      due_date: dueDateStr,
      related_link: relatedLink.trim() || null,
    };

    try {
      const result = await createTask(data);
      setLoading(false);

      if (result) {
        resetForm();
        onOpenChange(false);
        onSuccess?.();
      } else {
        setErrors({ submit: t("error.createFailed") });
      }
    } catch (err) {
      setLoading(false);
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("Task creation exception:", errMsg);
      setErrors({ submit: `${t("error.createFailed")}: ${errMsg}` });
    }
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={handleCancel}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#C62828]">
            {t("createTaskTitle")}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("titleLabel")} <span className="text-[#C62828]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("titlePlaceholder")}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C62828]/30 ${
                errors.title ? "border-[#C62828]" : "border-gray-300"
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-[#C62828]">{errors.title}</p>
            )}
          </div>

          {/* Team */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("teamLabel")} <span className="text-[#C62828]">*</span>
            </label>
            <select
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C62828]/30"
            >
              {TEAMS.map((tName) => (
                <option key={tName} value={tName}>
                  {tName}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("assigneeLabel")}
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C62828]/30"
            >
              <option value="">{t("selectAssignee")}</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("priorityLabel")}
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C62828]/30"
            >
              <option value="low">{t("priority.low")}</option>
              <option value="medium">{t("priority.medium")}</option>
              <option value="high">{t("priority.high")}</option>
              <option value="urgent">{t("priority.urgent")}</option>
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("dueDateLabel")} <span className="text-[#C62828]">*</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C62828]/30 ${
                errors.dueDate ? "border-[#C62828]" : "border-gray-300"
              }`}
            />
            {errors.dueDate && (
              <p className="mt-1 text-xs text-[#C62828]">{errors.dueDate}</p>
            )}
          </div>

          {/* Related Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("linkLabel")}
            </label>
            <input
              type="url"
              value={relatedLink}
              onChange={(e) => setRelatedLink(e.target.value)}
              placeholder={t("linkPlaceholder")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C62828]/30"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("descriptionLabel")}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descriptionPlaceholder")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C62828]/30 resize-none"
            />
          </div>

          {/* Start Date (readonly) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("startDateLabel")}
            </label>
            <input
              type="text"
              value={new Date().toLocaleDateString("vi-VN")}
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="mt-0.5 text-xs text-gray-400">{t("startDateAuto")}</p>
          </div>

          {/* Error message */}
          {errors.submit && (
            <p className="text-sm text-[#C62828]">{errors.submit}</p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-[#C62828] rounded-lg hover:bg-[#a02222] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t("creating") : t("createTask")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
