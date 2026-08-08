// lib/task-service.ts
// Service quan ly tasks voi Supabase
import { createClient } from "@/lib/supabase";

export type TaskStatus = "pending" | "in_progress" | "completed" | "overdue";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  assigned_by: string | null;
  team: string;
  status: TaskStatus;
  priority: TaskPriority;
  start_date: string;
  due_date: string;
  completed_at: string | null;
  related_link: string | null;
  created_at: string;
}

export type CreateTaskInput = Omit<Task, "id" | "created_at" | "completed_at" | "status">;
export type UpdateTaskInput = Partial<CreateTaskInput> & { status?: TaskStatus };

const TABLE = "tasks";

/* Validate that a string is a valid UUID (v4 or any version) */
function isValidUUID(str: string | null | undefined): boolean {
  if (!str) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export async function createTask(data: CreateTaskInput): Promise<Task | null> {
  const supabase = createClient();
  
  /* Sanitize: only send UUID fields if they are valid UUIDs, otherwise null */
  const payload = {
    title: data.title,
    description: data.description,
    assigned_to: isValidUUID(data.assigned_to) ? data.assigned_to : null,
    assigned_by: isValidUUID(data.assigned_by) ? data.assigned_by : null,
    team: data.team,
    priority: data.priority,
    start_date: data.start_date ? new Date(data.start_date).toISOString() : new Date().toISOString(),
    due_date: data.due_date ? new Date(data.due_date).toISOString() : null,
    related_link: data.related_link || null,
    status: "pending" as const,
    completed_at: null,
  };
  
  console.log("createTask payload:", JSON.stringify(payload, null, 2));
  
  const { data: result, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("createTask error:", error.message, error.code, error.details, error.hint);
    throw new Error(`Task creation failed: ${error.message} (${error.code})`);
  }
  return result as Task;
}

export async function getTasks(): Promise<Task[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("start_date", { ascending: false });

  if (error) {
    console.error("getTasks error:", error.message);
    return [];
  }
  return (data as Task[]) || [];
}

export async function getTasksByTeam(team: string): Promise<Task[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("team", team)
    .order("start_date", { ascending: false });

  if (error) {
    console.error("getTasksByTeam error:", error.message);
    return [];
  }
  return (data as Task[]) || [];
}

export async function getTasksByAssignee(userId: string): Promise<Task[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("assigned_to", userId)
    .order("start_date", { ascending: false });

  if (error) {
    console.error("getTasksByAssignee error:", error.message);
    return [];
  }
  return (data as Task[]) || [];
}

export async function updateTask(id: string, data: UpdateTaskInput): Promise<Task | null> {
  const supabase = createClient();
  const { data: result, error } = await supabase
    .from(TABLE)
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("updateTask error:", error.message);
    return null;
  }
  return result as Task;
}

export async function deleteTask(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from(TABLE).delete().eq("id", id);

  if (error) {
    console.error("deleteTask error:", error.message);
    return false;
  }
  return true;
}

export async function completeTask(id: string): Promise<Task | null> {
  const supabase = createClient();
  const now = new Date().toISOString();
  const { data: result, error } = await supabase
    .from(TABLE)
    .update({ status: "completed", completed_at: now })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("completeTask error:", error.message);
    return null;
  }
  return result as Task;
}
