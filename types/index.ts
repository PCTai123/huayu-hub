// types/index.ts
// Core types cho Huayu Hub application

export type Locale = "vi" | "en" | "zh";

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  bio?: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
  department?: string;
  position?: string;
  organization_id?: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  leader_id: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  team_id?: string;
  status: "draft" | "published" | "archived";
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  link?: string;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  team_id?: string;
  organizer_id: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  event_id: string;
  user_id: string;
  reminder_minutes?: number;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author_id: string;
  priority: "low" | "normal" | "high" | "urgent";
  pinned: boolean;
  published_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  team_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export type Role = "admin" | "moderator" | "member" | "guest";

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ApiResponse<T> {
  data: T;
  error: null | { message: string; code: string };
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
