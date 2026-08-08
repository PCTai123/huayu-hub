// features/calendar/types.ts
// Types cho calendar events

export type CalendarEventType = "task" | "birthday" | "activity" | "event";

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  type: CalendarEventType;
  description?: string | null;
  allDay?: boolean;
  color?: string;
}

export interface TaskEvent extends CalendarEvent {
  type: "task";
  task_id: string;
  assigned_to: string | null;
  team: string;
}

export interface BirthdayEvent extends CalendarEvent {
  type: "birthday";
  person_name: string;
}

export interface ActivityEvent extends CalendarEvent {
  type: "activity";
  location?: string;
  organizer?: string;
}

export interface EventCalendarEvent extends CalendarEvent {
  type: "event";
  location?: string;
  organizer?: string;
}
