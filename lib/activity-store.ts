"use client";

import { useState, useCallback, useEffect } from "react";
import { Activity } from "@/features/activities/components/activity-card";

const STORAGE_KEY = "huayu-hub-activities";

const mockActivities: Activity[] = [
  {
    id: "1",
    name: "Workshop Ky nang thuyet trinh",
    date: "2026-08-15",
    time: "09:00",
    organization: "Hoa Nhai Truc",
    topic: "Workshop",
    status: "upcoming",
    description:
      "Workshop giup sinh vien phat trien ky nang thuyet trinh chuyen nghiep.",
    referenceLink: "https://example.com/ref1",
    registrationLink: "https://example.com/reg1",
  },
  {
    id: "2",
    name: "Hoi thao Du hoc Han Quoc",
    date: "2026-08-10",
    time: "14:00",
    organization: "DH Quoc gia",
    topic: "Hoi thao",
    status: "ongoing",
    description:
      "Chia se thong tin ve chuong trinh hoc bong du hoc Han Quoc 2026.",
  },
  {
    id: "3",
    name: "Cuoc thi Van nghe Xuan",
    date: "2026-01-20",
    time: "18:00",
    organization: "Hoa Nhai Truc",
    topic: "Cuoc thi",
    status: "ended",
    description: "Cuoc thi van nghe chao mung nam moi.",
  },
  {
    id: "4",
    name: "Chuong trinh Tinh nguyen Mua he",
    date: "2026-07-01",
    time: "07:30",
    organization: "Hoi SV",
    topic: "Tinh nguyen",
    status: "ended",
    description: "Hoat dong tinh nguyen tai vung sau vung xa.",
  },
  {
    id: "5",
    name: "Giao luu Van hoa Viet - Han",
    date: "2026-09-05",
    time: "10:00",
    organization: "DH Ngoai ngu",
    topic: "Giao luu",
    status: "upcoming",
    description: "Giao luu van hoa giua sinh vien Viet Nam va Han Quoc.",
    registrationLink: "https://example.com/reg5",
  },
];

// Load from storage
function loadFromStorage(): Activity[] {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load activities from storage:", e);
    }
  }
  return [...mockActivities];
}

function saveToStorage(activities: Activity[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
    } catch (e) {
      console.error("Failed to save activities to storage:", e);
    }
  }
}

// Singleton store with subscription pattern
let activitiesStore: Activity[] = loadFromStorage();
const listeners = new Set<(activities: Activity[]) => void>();

function notify() {
  listeners.forEach((fn) => fn([...activitiesStore]));
}

export function useActivityStore() {
  const [activities, setActivities] = useState<Activity[]>(activitiesStore);

  useEffect(() => {
    listeners.add(setActivities);
    return () => {
      listeners.delete(setActivities);
    };
  }, []);

  const addActivity = useCallback((activity: Activity) => {
    activitiesStore = [activity, ...activitiesStore];
    saveToStorage(activitiesStore);
    notify();
  }, []);

  const deleteActivity = useCallback((id: string) => {
    activitiesStore = activitiesStore.filter((a) => a.id !== id);
    saveToStorage(activitiesStore);
    notify();
  }, []);

  return { activities, addActivity, deleteActivity };
}

// Direct access functions
export function getActivities() {
  return [...activitiesStore];
}

export function addActivityToStore(activity: Activity) {
  activitiesStore = [activity, ...activitiesStore];
  saveToStorage(activitiesStore);
  notify();
}

export function deleteActivityFromStore(id: string) {
  activitiesStore = activitiesStore.filter((a) => a.id !== id);
  saveToStorage(activitiesStore);
  notify();
}

export function subscribeToActivities(fn: (activities: Activity[]) => void) {
  listeners.add(fn);
  fn([...activitiesStore]);
  return () => {
    listeners.delete(fn);
  };
}
