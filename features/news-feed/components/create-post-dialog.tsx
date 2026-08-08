"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  X,
  Send,
  ImagePlus,
  Globe,
  Users,
  Loader2,
} from "lucide-react";

export type PostVisibility = "public" | "team_only";

interface CreatePostData {
  title: string;
  content: string;
  images: string[];
  imageFiles: File[];
  visibility: PostVisibility;
}

interface CreatePostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePostData) => Promise<void>;
}

export function CreatePostDialog({ isOpen, onClose, onSubmit }: CreatePostDialogProps) {
  const t = useTranslations("newsFeed");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [visibility, setVisibility] = useState<PostVisibility>("public");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = t("validation.titleRequired");
    if (!content.trim()) newErrors.content = t("validation.contentRequired");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) return;
      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setImageFiles((prev) => [...prev, ...newFiles]);
    setImages((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(images[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        images,
        imageFiles,
        visibility,
      });
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    images.forEach((url) => URL.revokeObjectURL(url));
    setTitle("");
    setContent("");
    setImages([]);
    setImageFiles([]);
    setVisibility("public");
    setErrors({});
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[20px] border border-white/20 bg-white/90 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/90"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/90 px-6 py-4 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/90">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("createPost")}
              </h2>
              <button
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {/* Title */}
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors((p) => ({ ...p, title: "" }));
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-base font-bold text-gray-900 outline-none transition-colors placeholder:font-normal placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:ring-blue-900/30"
                  placeholder={t("placeholders.postTitle")}
                />
                {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
              </div>

              {/* Content */}
              <div>
                <textarea
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (errors.content) setErrors((p) => ({ ...p, content: "" }));
                  }}
                  rows={5}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:ring-blue-900/30"
                  placeholder={t("placeholders.postContent")}
                />
                {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content}</p>}
              </div>

              {/* Image Gallery Preview */}
              {images.length > 0 && (
                <div className={`grid gap-2 ${images.length > 1 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1"}`}>
                  {images.map((img, idx) => (
                    <div key={idx} className="group relative aspect-square overflow-hidden rounded-xl">
                      <Image src={img} alt={`Upload ${idx + 1}`} fill className="object-cover" />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-blue-500 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    <ImagePlus className="h-5 w-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />

                  {/* Visibility Toggle */}
                  <div className="flex items-center rounded-xl border border-gray-200 p-1 dark:border-gray-700">
                    <button
                      onClick={() => setVisibility("public")}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        visibility === "public"
                          ? "bg-blue-500 text-white"
                          : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                      }`}
                    >
                      <Globe className="h-3.5 w-3.5" />
                      {t("visibility.public")}
                    </button>
                    <button
                      onClick={() => setVisibility("team_only")}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        visibility === "team_only"
                          ? "bg-blue-500 text-white"
                          : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                      }`}
                    >
                      <Users className="h-3.5 w-3.5" />
                      {t("visibility.teamOnly")}
                    </button>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-blue-600 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {isSubmitting ? t("publishing") : t("publish")}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
