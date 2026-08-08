"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Eye,
  MessageCircle,
  Heart,
  Pencil,
  Trash2,
  Globe,
  Users,
  Clock,
} from "lucide-react";
import { CommentSection } from "./comment-section";

export type PostVisibility = "public" | "team_only";

interface Author {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  images: string[];
  author: Author;
  createdAt: string;
  views: number;
  comments: Comment[];
  likes: number;
  isLiked: boolean;
  visibility: PostVisibility;
}

interface Comment {
  id: string;
  author: Author;
  content: string;
  createdAt: string;
  replies?: Comment[];
}

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onEdit: (postId: string) => void;
  onDelete: (postId: string) => void;
  onLike: (postId: string) => void;
  onAddComment: (postId: string, content: string, parentId?: string) => void;
}

export function PostCard({
  post,
  currentUserId,
  onEdit,
  onDelete,
  onLike,
  onAddComment,
}: PostCardProps) {
  const t = useTranslations("newsFeed");
  const router = useRouter();
  const [showComments, setShowComments] = useState(false);
  const isAuthor = post.author.id === currentUserId || post.author.id === "admin-1";

  const formatTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("time.justNow");
    if (diffMins < 60) return t("time.minutesAgo", { count: diffMins });
    if (diffHours < 24) return t("time.hoursAgo", { count: diffHours });
    if (diffDays < 7) return t("time.daysAgo", { count: diffDays });
    return date.toLocaleDateString();
  }, [t]);

  const getImageGridClass = (count: number) => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count === 3) return "grid-cols-2 sm:grid-cols-3";
    if (count === 4) return "grid-cols-2";
    return "grid-cols-2 sm:grid-cols-3";
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full overflow-hidden rounded-[20px] border border-white/20 bg-white/70 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-black/40"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border border-gray-200 dark:border-gray-700">
            {post.author.avatarUrl ? (
              <Image
                src={post.author.avatarUrl}
                alt={post.author.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-sm font-bold text-white">
                {post.author.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {post.author.name}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              {formatTime(post.createdAt)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {post.visibility === "public" ? (
            <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <Globe className="h-3 w-3" />
              {t("visibility.public")}
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
              <Users className="h-3 w-3" />
              {t("visibility.teamOnly")}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-4 sm:px-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          {post.title}
        </h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          {post.content}
        </p>
      </div>

      {/* Image Gallery */}
      {post.images.length > 0 && (
        <div className={`grid gap-1 px-5 sm:px-6 ${getImageGridClass(post.images.length)}`}>
          {post.images.map((img, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02 }}
              className={`relative overflow-hidden rounded-xl ${
                post.images.length === 1 ? "aspect-video" : "aspect-square"
              }`}
            >
              <Image src={img} alt={`Post image ${idx + 1}`} fill className="object-cover" />
            </motion.div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="mt-3 flex items-center gap-4 px-5 text-xs text-gray-500 dark:text-gray-400 sm:px-6">
        <span className="flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" />
          {post.views.toLocaleString()} {t("views")}
        </span>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1 transition-colors hover:text-blue-500"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          {post.comments.length} {t("comments")}
        </button>
      </div>

      {/* Action Bar */}
      <div className="mt-3 flex items-center justify-between border-t border-gray-100 px-5 py-3 dark:border-gray-800 sm:px-6">
        <div className="flex items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
              post.isLiked
                ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            <Heart className={`h-4 w-4 ${post.isLiked ? "fill-current" : ""}`} />
            {post.likes > 0 && <span>{post.likes}</span>}
            <span className="sr-only">{t("like")}</span>
          </motion.button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <MessageCircle className="h-4 w-4" />
            {t("comment")}
          </button>
        </div>

        {isAuthor && (
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onEdit(post.id)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
            >
              <Pencil className="h-4 w-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete(post.id)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
            </motion.button>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-gray-100 dark:border-gray-800"
          >
            <CommentSection
              comments={post.comments}
              currentUserId={currentUserId}
              onAddComment={(content, parentId) => onAddComment(post.id, content, parentId)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
