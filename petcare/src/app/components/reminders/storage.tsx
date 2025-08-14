import { Reminder } from "./types";

const KEY = "petcare.reminders.v1";

export function loadReminders(): Reminder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Reminder[]) : [];
  } catch {
    return [];
  }
}

export function saveReminders(items: Reminder[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
}
