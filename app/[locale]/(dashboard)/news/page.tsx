"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { PenSquare, Calendar, Filter, X } from "lucide-react";
import { PostCard } from "@/features/news-feed/components/post-card";
import { CreatePostDialog } from "@/features/news-feed/components/create-post-dialog";
import { MiniCalendarSidebar } from "@/features/news-feed/components/mini-calendar-sidebar";
import {
  useNewsFeedStore,
  fetchPostsFromSupabase,
} from "@/lib/news-feed-store";

const CURRENT_USER_ID = "current-user";

interface CreatePostInput {
  title: string;
  content: string;
  images: string[];
  imageFiles: File[];
  visibility: "public" | "team_only";
}

export default function NewsFeedPage() {
  const { posts, addPost, deletePost, toggleLike, addComment } = useNewsFeedStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPostsFromSupabase();
  }, []);

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

  const filteredPosts = posts.filter((post) => {
    const postDate = new Date(post.createdAt);
    if (filterMonth && (postDate.getMonth() + 1).toString() !== filterMonth) {
      return false;
    }
    if (filterYear && postDate.getFullYear().toString() !== filterYear) {
      return false;
    }
    return true;
  });

  const handleCreatePost = useCallback(
    async (data: CreatePostInput) => {
      await addPost({
        title: data.title,
        content: data.content,
        images: data.images,
        author: { id: CURRENT_USER_ID, name: "You", avatarUrl: "" },
        views: 0,
        comments: [],
        likes: 0,
        isLiked: false,
        visibility: data.visibility,
      });
    },
    [addPost]
  );

  const handleLike = useCallback(
    (postId: string) => {
      toggleLike(postId);
    },
    [toggleLike]
  );

  const handleEdit = useCallback((postId: string) => {
    console.log("Edit post:", postId);
  }, []);

  const handleDelete = useCallback(
    (postId: string) => {
      if (window.confirm("Ban co chac muon xoa bai viet nay?")) {
        deletePost(postId);
      }
    },
    [deletePost]
  );

  const handleAddComment = useCallback(
    (postId: string, content: string, parentId?: string) => {
      addComment(postId, content, parentId);
    },
    [addComment]
  );

  const clearFilters = () => {
    setFilterMonth("");
    setFilterYear("");
  };

  const hasActiveFilters = filterMonth || filterYear;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gray-100">
            <PenSquare className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black">Bang tin</h1>
            <p className="text-sm text-gray-600">Cac bai dang moi nhat</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium shadow-md transition-colors ${
              showFilters || hasActiveFilters
                ? "bg-[#C62828] text-white hover:bg-red-700"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            <Filter className="h-4 w-4" />
            Loc
            {hasActiveFilters && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-[#C62828]">
                !
              </span>
            )}
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[#C62828] px-4 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-red-700"
          >
            <PenSquare className="h-4 w-4" />
            Tao bai viet
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Loc theo:</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-[#C62828] focus:outline-none"
              >
                <option value="">Tat ca thang</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={String(i + 1)}>
                    Thang {i + 1}
                  </option>
                ))}
              </select>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-[#C62828] focus:outline-none"
              >
                <option value="">Tat ca nam</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year.toString()}>
                    Nam {year}
                  </option>
                ))}
              </select>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Xoa loc
              </button>
            )}
            <div className="ml-auto text-sm text-gray-500">
              {filteredPosts.length} bai viet
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Feed */}
        <div className="space-y-6 lg:col-span-2">
          {/* Create Post Trigger Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => setIsCreateOpen(true)}
            className="w-full cursor-pointer overflow-hidden rounded-[20px] border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-sm font-bold text-white">
                Me
              </div>
              <div className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 transition-colors hover:border-gray-300">
                Ban muon chia se dieu gi?
              </div>
            </div>
          </motion.div>

          {/* Posts List */}
          {filteredPosts.length === 0 ? (
            <div className="rounded-[20px] border border-gray-200 bg-white p-8 text-center text-gray-500">
              <p className="text-lg font-medium">Hien chua co bai viet nao</p>
              <p className="text-sm text-gray-400 mt-1">
                {hasActiveFilters
                  ? "Thay doi bo loc de xem bai viet khac"
                  : "Hay tao bai viet dau tien cua ban!"}
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={CURRENT_USER_ID}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onLike={handleLike}
                onAddComment={handleAddComment}
              />
            ))
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block">
          <MiniCalendarSidebar />
        </div>
      </div>

      {/* Create Post Dialog */}
      <CreatePostDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  );
}
