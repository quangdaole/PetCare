import { HealthRecord } from "./types";

const KEY = "petcare.health.v1";

export function loadHealth(): HealthRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HealthRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveHealth(records: HealthRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(records));
}
