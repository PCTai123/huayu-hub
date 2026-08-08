"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Send,
  Reply,
  ChevronDown,
  ChevronUp,
  AtSign,
} from "lucide-react";

interface Author {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface Comment {
  id: string;
  author: Author;
  content: string;
  createdAt: string;
  replies?: Comment[];
}

interface CommentSectionProps {
  comments: Comment[];
  currentUserId: string;
  onAddComment: (content: string, parentId?: string) => void;
}

export function CommentSection({ comments, currentUserId, onAddComment }: CommentSectionProps) {
  const t = useTranslations("newsFeed");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [mentionSearch, setMentionSearch] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  // Mock users for mention - replace with actual API call
  const mockUsers = [
    { id: "1", name: "Alice Chen", avatarUrl: "" },
    { id: "2", name: "Bob Wang", avatarUrl: "" },
    { id: "3", name: "Carol Li", avatarUrl: "" },
  ];

  const filteredUsers = mockUsers.filter((u) =>
    u.name.toLowerCase().includes(mentionSearch.toLowerCase())
  );

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    isReply: boolean = false
  ) => {
    const value = e.target.value;
    if (isReply) {
      setReplyContent(value);
    }

    const lastAtIndex = value.lastIndexOf("@");
    if (lastAtIndex !== -1 && lastAtIndex === value.length - 1) {
      setShowMentions(true);
      setMentionSearch("");
    } else if (lastAtIndex !== -1) {
      const afterAt = value.slice(lastAtIndex + 1);
      if (!afterAt.includes(" ")) {
        setMentionSearch(afterAt);
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (userName: string, isReply: boolean = false) => {
    const ref = isReply ? replyInputRef : inputRef;
    if (!ref.current) return;

    const value = isReply ? replyContent : ref.current.value;
    const lastAtIndex = value.lastIndexOf("@");
    const newValue = value.slice(0, lastAtIndex) + `@${userName} `;

    if (isReply) {
      setReplyContent(newValue);
    } else {
      ref.current.value = newValue;
    }
    setShowMentions(false);
    ref.current?.focus();
  };

  const handleSubmitComment = (parentId?: string) => {
    const content = parentId ? replyContent : inputRef.current?.value || "";
    if (!content.trim()) return;

    onAddComment(content.trim(), parentId);

    if (parentId) {
      setReplyContent("");
      setReplyTo(null);
    } else if (inputRef.current) {
      inputRef.current.value = "";
    }
    setShowMentions(false);
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  return (
    <div className="px-5 py-4 sm:px-6">
      {/* Comment Input */}
      <div className="relative mb-4">
        <div className="flex gap-3">
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full">
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-xs font-bold text-white">
              Me
            </div>
          </div>
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              onChange={(e) => handleInputChange(e)}
              onFocus={() => setActiveInput("main")}
              rows={2}
              className="w-full resize-none rounded-xl border border-gray-200 bg-white/50 px-3 py-2 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:ring-blue-900/30"
              placeholder={t("writeComment")}
            />
            {/* Mention Dropdown */}
            <AnimatePresence>
              {showMentions && activeInput === "main" && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute left-0 top-full z-20 mt-1 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
                >
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => insertMention(user.name, false)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <div className="relative h-6 w-6 overflow-hidden rounded-full">
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-[10px] font-bold text-white">
                          {user.name.charAt(0)}
                        </div>
                      </div>
                      {user.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSubmitComment()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white shadow-md transition-colors hover:bg-blue-600"
          >
            <Send className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* Comment List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            depth={0}
            onReply={setReplyTo}
            replyTo={replyTo}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            expandedReplies={expandedReplies}
            toggleReplies={toggleReplies}
            formatTime={formatTime}
            handleSubmitComment={handleSubmitComment}
            handleInputChange={handleInputChange}
            showMentions={showMentions}
            activeInput={activeInput}
            setActiveInput={setActiveInput}
            insertMention={insertMention}
            filteredUsers={filteredUsers}
            t={t}
            replyInputRef={replyInputRef}
          />
        ))}
      </div>
    </div>
  );
}

/* ──────────── Sub-components ──────────── */

interface CommentItemProps {
  comment: Comment;
  depth: number;
  onReply: (id: string | null) => void;
  replyTo: string | null;
  replyContent: string;
  setReplyContent: (v: string) => void;
  expandedReplies: Set<string>;
  toggleReplies: (id: string) => void;
  formatTime: (s: string) => string;
  handleSubmitComment: (parentId?: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>, isReply?: boolean) => void;
  showMentions: boolean;
  activeInput: string | null;
  setActiveInput: (id: string | null) => void;
  insertMention: (name: string, isReply?: boolean) => void;
  filteredUsers: { id: string; name: string }[];
  t: ReturnType<typeof useTranslations>;
  replyInputRef: React.RefObject<HTMLTextAreaElement | null>;
}

function CommentItem({
  comment,
  depth,
  onReply,
  replyTo,
  replyContent,
  setReplyContent,
  expandedReplies,
  toggleReplies,
  formatTime,
  handleSubmitComment,
  handleInputChange,
  showMentions,
  activeInput,
  setActiveInput,
  insertMention,
  filteredUsers,
  t,
  replyInputRef,
}: CommentItemProps) {
  const hasReplies = comment.replies && comment.replies.length > 0;
  const isExpanded = expandedReplies.has(comment.id);
  const isReplying = replyTo === comment.id;

  return (
    <div className={depth > 0 ? "ml-8 border-l-2 border-gray-100 pl-4 dark:border-gray-800" : ""}>
      <div className="flex gap-3">
        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full">
          {comment.author.avatarUrl ? (
            <Image
              src={comment.author.avatarUrl}
              alt={comment.author.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-400 to-gray-500 text-xs font-bold text-white">
              {comment.author.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="rounded-xl bg-gray-50/80 px-3 py-2 dark:bg-gray-800/50">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {comment.author.name}
            </p>
            <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
          </div>
          <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
            <span>{formatTime(comment.createdAt)}</span>
            <button
              onClick={() => onReply(isReplying ? null : comment.id)}
              className="flex items-center gap-1 font-medium text-gray-500 transition-colors hover:text-blue-500 dark:text-gray-400"
            >
              <Reply className="h-3 w-3" />
              {t("reply")}
            </button>
          </div>

          {/* Reply Input */}
          <AnimatePresence>
            {isReplying && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 overflow-hidden"
              >
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <textarea
                      ref={replyInputRef}
                      value={replyContent}
                      onChange={(e) => {
                        setReplyContent(e.target.value);
                        handleInputChange(e, true);
                      }}
                      onFocus={() => setActiveInput(comment.id)}
                      rows={2}
                      autoFocus
                      className="w-full resize-none rounded-xl border border-gray-200 bg-white/50 px-3 py-2 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:ring-blue-900/30"
                      placeholder={t("writeReply")}
                    />
                    {/* Mention Dropdown for reply */}
                    <AnimatePresence>
                      {showMentions && activeInput === comment.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute left-0 top-full z-20 mt-1 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
                        >
                          {filteredUsers.map((user) => (
                            <button
                              key={user.id}
                              onClick={() => insertMention(user.name, true)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                              <AtSign className="h-3.5 w-3.5 text-gray-400" />
                              {user.name}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSubmitComment(comment.id)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white shadow-md transition-colors hover:bg-blue-600"
                  >
                    <Send className="h-4 w-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nested Replies */}
          {hasReplies && (
            <div className="mt-2">
              <button
                onClick={() => toggleReplies(comment.id)}
                className="flex items-center gap-1 text-xs font-medium text-blue-500 transition-colors hover:text-blue-600"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3" />
                    {t("hideReplies", { count: comment.replies!.length })}
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" />
                    {t("showReplies", { count: comment.replies!.length })}
                  </>
                )}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 overflow-hidden space-y-3"
                  >
                    {comment.replies!.map((reply) => (
                      <CommentItem
                        key={reply.id}
                        comment={reply}
                        depth={depth + 1}
                        onReply={onReply}
                        replyTo={replyTo}
                        replyContent={replyContent}
                        setReplyContent={setReplyContent}
                        expandedReplies={expandedReplies}
                        toggleReplies={toggleReplies}
                        formatTime={formatTime}
                        handleSubmitComment={handleSubmitComment}
                        handleInputChange={handleInputChange}
                        showMentions={showMentions}
                        activeInput={activeInput}
                        setActiveInput={setActiveInput}
                        insertMention={insertMention}
                        filteredUsers={filteredUsers}
                        t={t}
                        replyInputRef={replyInputRef}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
