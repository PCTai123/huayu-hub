"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";

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

let postsStore: Post[] = [];
const listeners = new Set<(posts: Post[]) => void>();

function notify() {
  listeners.forEach((fn) => fn([...postsStore]));
}

/**
 * Fetch all posts from Supabase (including comments nested)
 */
export async function fetchPostsFromSupabase(): Promise<Post[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("posts")
      .select("*, post_comments(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("fetchPostsFromSupabase failed:", error.message);
      return postsStore;
    }

    const fetched: Post[] = (data || []).map((row: any) => {
      const comments: Comment[] = (row.post_comments || [])
        .filter((c: any) => !c.parent_id) // top-level only for now
        .map((c: any) => ({
          id: c.id,
          author: {
            id: c.author_id || "",
            name: c.author_name || "You",
            avatarUrl: c.author_avatar || "",
          },
          content: c.content,
          createdAt: c.created_at,
        }));

      return {
        id: row.id,
        title: row.title,
        content: row.content,
        images: row.images || [],
        author: {
          id: row.author_id || "",
          name: row.author_name || "Admin",
          avatarUrl: row.author_avatar || "",
        },
        createdAt: row.created_at,
        views: row.views || 0,
        comments,
        likes: row.likes || 0,
        isLiked: false,
        visibility: (row.visibility as any) || "public",
      };
    });

    postsStore = fetched;
    notify();
    return fetched;
  } catch (e) {
    console.warn("fetchPostsFromSupabase error:", e);
    return postsStore;
  }
}

/**
 * Insert a new post into Supabase + create notification for all users
 */
export async function addPostToSupabase(
  post: Omit<Post, "id" | "createdAt">
): Promise<Post | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("posts")
      .insert({
        title: post.title,
        content: post.content,
        images: post.images || [],
        author_id: post.author.id,
        author_name: post.author.name,
        author_avatar: post.author.avatarUrl,
        views: 0,
        likes: 0,
        visibility: post.visibility || "public",
      })
      .select()
      .single();

    if (error || !data) {
      console.warn("addPostToSupabase failed:", error?.message);
      return null;
    }

    const newPost: Post = {
      id: data.id,
      title: data.title,
      content: data.content,
      images: data.images || [],
      author: {
        id: data.author_id || "",
        name: data.author_name || "Admin",
        avatarUrl: data.author_avatar || "",
      },
      createdAt: data.created_at,
      views: 0,
      comments: [],
      likes: 0,
      isLiked: false,
      visibility: (data.visibility as any) || "public",
    };

    postsStore = [newPost, ...postsStore];
    notify();

    // Create notification for all users
    await createNotification({
      title: `Bai viet moi: ${post.title}`,
      message: post.content.substring(0, 80) + (post.content.length > 80 ? "..." : ""),
      type: "post",
      related_id: data.id,
      related_type: "post",
    });

    return newPost;
  } catch (e) {
    console.warn("addPostToSupabase error:", e);
    return null;
  }
}

/**
 * Delete a post from Supabase
 */
export async function deletePostFromSupabase(id: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      console.warn("deletePostFromSupabase failed:", error.message);
      return false;
    }
    postsStore = postsStore.filter((p) => p.id !== id);
    notify();
    return true;
  } catch (e) {
    console.warn("deletePostFromSupabase error:", e);
    return false;
  }
}

/**
 * Toggle like on a post in Supabase
 */
export async function toggleLikeInSupabase(id: string, userId?: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const post = postsStore.find((p) => p.id === id);
    if (!post) return false;

    const newLikes = post.isLiked ? Math.max(0, post.likes - 1) : post.likes + 1;
    const { error } = await supabase
      .from("posts")
      .update({ likes: newLikes })
      .eq("id", id);

    if (error) {
      console.warn("toggleLikeInSupabase failed:", error.message);
      return false;
    }

    postsStore = postsStore.map((p) =>
      p.id === id ? { ...p, isLiked: !p.isLiked, likes: newLikes } : p
    );
    notify();
    return true;
  } catch (e) {
    console.warn("toggleLikeInSupabase error:", e);
    return false;
  }
}

/**
 * Add a comment to a post in Supabase
 */
export async function addCommentToSupabase(
  postId: string,
  content: string,
  author?: Author,
  parentId?: string
): Promise<Comment | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("post_comments")
      .insert({
        post_id: postId,
        author_id: author?.id || "current-user",
        author_name: author?.name || "You",
        author_avatar: author?.avatarUrl || "",
        content,
        parent_id: parentId || null,
      })
      .select()
      .single();

    if (error || !data) {
      console.warn("addCommentToSupabase failed:", error?.message);
      return null;
    }

    const newComment: Comment = {
      id: data.id,
      author: {
        id: data.author_id || "",
        name: data.author_name || "You",
        avatarUrl: data.author_avatar || "",
      },
      content: data.content,
      createdAt: data.created_at,
    };

    postsStore = postsStore.map((p) => {
      if (p.id !== postId) return p;
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

    notify();
    return newComment;
  } catch (e) {
    console.warn("addCommentToSupabase error:", e);
    return null;
  }
}

/**
 * Create a notification in Supabase (global for all users if user_id is null)
 */
export async function createNotification(data: {
  title: string;
  message: string;
  type?: string;
  related_id?: string;
  related_type?: string;
  user_id?: string | null;
}): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("notifications").insert({
      user_id: data.user_id || null,
      title: data.title,
      message: data.message,
      type: data.type || "announcement",
      related_id: data.related_id || null,
      related_type: data.related_type || null,
      is_read: false,
    });

    if (error) {
      console.warn("createNotification failed:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn("createNotification error:", e);
    return false;
  }
}

/**
 * Hook for React components (auto-fetches from Supabase on mount)
 */
export function useNewsFeedStore() {
  const [posts, setPosts] = useState<Post[]>(postsStore);

  useEffect(() => {
    listeners.add(setPosts);
    // Fetch from Supabase on mount
    fetchPostsFromSupabase();
    return () => {
      listeners.delete(setPosts);
    };
  }, []);

  const addPost = useCallback(async (post: Omit<Post, "id" | "createdAt">) => {
    await addPostToSupabase(post);
  }, []);

  const deletePost = useCallback(async (id: string) => {
    await deletePostFromSupabase(id);
  }, []);

  const toggleLike = useCallback(async (id: string) => {
    await toggleLikeInSupabase(id);
  }, []);

  const addComment = useCallback(
    async (postId: string, content: string, parentId?: string) => {
      await addCommentToSupabase(postId, content, undefined, parentId);
    },
    []
  );

  return { posts, addPost, deletePost, toggleLike, addComment };
}

// Direct access functions (backward compat)
export function getPosts() {
  return [...postsStore];
}

export function addPostToStore(post: Post) {
  // Deprecated: use addPostToSupabase instead
  postsStore = [post, ...postsStore];
  notify();
}

export function deletePostFromStore(id: string) {
  postsStore = postsStore.filter((p) => p.id !== id);
  notify();
}

export function toggleLikeInStore(id: string) {
  postsStore = postsStore.map((p) => {
    if (p.id !== id) return p;
    const isLiked = !p.isLiked;
    return { ...p, isLiked, likes: isLiked ? p.likes + 1 : p.likes - 1 };
  });
  notify();
}

export function subscribeToPosts(fn: (posts: Post[]) => void) {
  listeners.add(fn);
  fn([...postsStore]);
  return () => {
    listeners.delete(fn);
  };
}
