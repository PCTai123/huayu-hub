"use client";

import { useState, useEffect, useCallback } from "react";

export interface Author {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface Comment {
  id: string;
  author: Author;
  content: string;
  createdAt: string;
  replies?: Comment[];
}

export interface Post {
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
  visibility: "public" | "team_only";
}

const STORAGE_KEY = "huayu-hub-news-feed";

const initialPosts: Post[] = [
  {
    id: "1",
    title: "Chao mung den voi Huayu Hub",
    content:
      "Day la bai dang dau tien tren bang tin moi cua chung ta. Hy vong moi nguoi se thich khong gian nay de chia se thong tin va ket noi voi nhau!",
    images: [],
    author: { id: "admin-1", name: "Admin", avatarUrl: "" },
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    views: 42,
    comments: [
      {
        id: "c1",
        author: { id: "u2", name: "Alice Chen" },
        content: "Rat tuyet! Minh rat vui khi thay bang tin moi.",
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      },
    ],
    likes: 5,
    isLiked: false,
    visibility: "public",
  },
  {
    id: "2",
    title: "Lich hop tuan nay",
    content:
      "Chung ta se co buoi hop vao thu Sau luc 14:00. Moi nguoi nho sap xep thoi gian nhe!",
    images: [],
    author: { id: "admin-1", name: "Admin", avatarUrl: "" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    views: 28,
    comments: [],
    likes: 3,
    isLiked: true,
    visibility: "team_only",
  },
];

let postsStore: Post[] = [...initialPosts];
const listeners = new Set<(posts: Post[]) => void>();

function notify() {
  listeners.forEach((fn) => fn([...postsStore]));
}

function saveToStorage() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(postsStore));
    } catch (e) {
      console.error("Failed to save news feed to storage:", e);
    }
  }
}

function loadFromStorage(): Post[] | null {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load news feed from storage:", e);
    }
  }
  return null;
}

// Load from storage on first access
const stored = loadFromStorage();
if (stored) {
  postsStore = stored;
}

export function useNewsFeedStore() {
  const [posts, setPosts] = useState<Post[]>(postsStore);

  useEffect(() => {
    listeners.add(setPosts);
    return () => {
      listeners.delete(setPosts);
    };
  }, []);

  const addPost = useCallback((post: Post) => {
    postsStore = [post, ...postsStore];
    saveToStorage();
    notify();
  }, []);

  const deletePost = useCallback((id: string) => {
    postsStore = postsStore.filter((p) => p.id !== id);
    saveToStorage();
    notify();
  }, []);

  const updatePost = useCallback((id: string, updates: Partial<Post>) => {
    postsStore = postsStore.map((p) => (p.id === id ? { ...p, ...updates } : p));
    saveToStorage();
    notify();
  }, []);

  const toggleLike = useCallback((id: string, userId: string) => {
    postsStore = postsStore.map((p) => {
      if (p.id !== id) return p;
      const isLiked = !p.isLiked;
      return {
        ...p,
        isLiked,
        likes: isLiked ? p.likes + 1 : p.likes - 1,
      };
    });
    saveToStorage();
    notify();
  }, []);

  const addComment = useCallback(
    (postId: string, content: string, parentId?: string) => {
      postsStore = postsStore.map((p) => {
        if (p.id !== postId) return p;
        const newComment: Comment = {
          id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          author: { id: userId, name: "You", avatarUrl: "" },
          content,
          createdAt: new Date().toISOString(),
        };

        if (parentId) {
          const addReply = (comments: Comment[]): Comment[] =>
            comments.map((c) =>
              c.id === parentId
                ? { ...c, replies: [...(c.replies || []), newComment] }
                : { ...c, replies: addReply(c.replies || []) }
            );
          return { ...p, comments: addReply(p.comments) };
        }

        return { ...p, comments: [...p.comments, newComment] };
      });
      saveToStorage();
      notify();
    },
    []
  );

  return { posts, addPost, deletePost, updatePost, toggleLike, addComment };
}

const userId = "current-user";

// Direct access functions
export function getPosts() {
  return [...postsStore];
}

export function addPostToStore(post: Post) {
  postsStore = [post, ...postsStore];
  saveToStorage();
  notify();
}

export function deletePostFromStore(id: string) {
  postsStore = postsStore.filter((p) => p.id !== id);
  saveToStorage();
  notify();
}

export function toggleLikeInStore(id: string) {
  postsStore = postsStore.map((p) => {
    if (p.id !== id) return p;
    const isLiked = !p.isLiked;
    return {
      ...p,
      isLiked,
      likes: isLiked ? p.likes + 1 : p.likes - 1,
    };
  });
  saveToStorage();
  notify();
}

export function subscribeToPosts(fn: (posts: Post[]) => void) {
  listeners.add(fn);
  fn([...postsStore]);
  return () => {
    listeners.delete(fn);
  };
}
