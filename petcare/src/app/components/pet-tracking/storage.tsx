import { TrackingEntry } from "./types";

const KEY = "petcare.tracking.v1";

export function loadEntries(): TrackingEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as TrackingEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveEntries(entries: TrackingEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(entries));
}
