"use client";

import { useMemo, useState } from "react";
import { Reminder, ReminderType } from "./types";

type StatusFilter = "All" | "Upcoming" | "Overdue" | "Completed";

type Props = {
  items: Reminder[];
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onSnooze: (id: string, minutes: number) => void;
};

export default function ReminderList({ items, onDelete, onToggleComplete, onSnooze }: Props) {
  const [q, setQ] = useState("");
  const [type, setType] = useState<ReminderType | "All">("All");
  const [status, setStatus] = useState<StatusFilter>("All");

  const filtered = useMemo(() => {
    const now = Date.now();

    return items
      .filter((r) => (type === "All" ? true : r.type === type))
      .filter((r) => {
        if (status === "All") return true;
        if (status === "Completed") return !!r.completedAtISO;
        const overdue = !r.completedAtISO && new Date(r.dueISO).getTime() < now;
        if (status === "Overdue") return overdue;
        if (status === "Upcoming") return !r.completedAtISO && !overdue;
        return true;
      })
      .filter((r) => {
        if (!q.trim()) return true;
        const hay = `${r.title} ${r.type} ${r.notes ?? ""}`.toLowerCase();
        return hay.includes(q.toLowerCase());
      })
      .sort((a, b) => new Date(a.dueISO).getTime() - new Date(b.dueISO).getTime()); // oldest first
  }, [items, q, type, status]);

  return (
    <div className="rounded-2xl border p-4 shadow-sm bg-white/70 backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold">Reminders</h3>
        <div className="flex gap-2">
          <input
            type="search"
            placeholder="Search title/notes"
            className="rounded-lg border px-3 py-2 w-56"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search reminders"
          />
          <select
            className="rounded-lg border px-3 py-2"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            aria-label="Filter by type"
          >
            <option>All</option>
            <option>Medication</option>
            <option>VetVisit</option>
            <option>Feeding</option>
            <option>Grooming</option>
            <option>Walk</option>
            <option>Training</option>
            <option>Custom</option>
          </select>

          <select
            className="rounded-lg border px-3 py-2"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            aria-label="Filter by status"
          >
            <option>All</option>
            <option>Upcoming</option>
            <option>Overdue</option>
            <option>Completed</option>
          </select>
        </div>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left">
            <tr className="border-b">
              <th className="py-2 pr-4">Due</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Title</th>
              <th className="py-2 pr-4">Priority</th>
              <th className="py-2 pr-4">Notes</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-500">
                  No reminders yet.
                </td>
              </tr>
            )}

            {filtered.map((r) => {
              const isOverdue = !r.completedAtISO && new Date(r.dueISO).getTime() < Date.now();
              const rowClass = r.completedAtISO
                ? "opacity-60"
                : isOverdue
                ? "bg-red-50"
                : "";

              return (
                <tr key={r.id} className={`border-b last:border-none ${rowClass}`}>
                  <td className="py-2 pr-4 whitespace-nowrap">
                    {new Date(r.dueISO).toLocaleString()}
                  </td>
                  <td className="py-2 pr-4">{r.type}</td>
                  <td className="py-2 pr-4">{r.title}</td>
                  <td className="py-2 pr-4">{r.priority}</td>
                  <td className="py-2 pr-4">{r.notes ?? "-"}</td>
                  <td className="py-2 pr-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onToggleComplete(r.id)}
                        className="rounded-lg border px-3 py-1 text-xs hover:shadow"
                        aria-label={r.completedAtISO ? "Mark as not completed" : "Mark as completed"}
                      >
                        {r.completedAtISO ? "Undo" : "Complete"}
                      </button>
                      {!r.completedAtISO && (
                        <>
                          <button
                            onClick={() => onSnooze(r.id, 60)}
                            className="rounded-lg border px-3 py-1 text-xs hover:shadow"
                            aria-label="Snooze 1 hour"
                          >
                            Snooze 1h
                          </button>
                          <button
                            onClick={() => onSnooze(r.id, 24 * 60)}
                            className="rounded-lg border px-3 py-1 text-xs hover:shadow"
                            aria-label="Snooze 1 day"
                          >
                            Snooze 1d
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => onDelete(r.id)}
                        className="rounded-lg border px-3 py-1 text-xs hover:shadow"
                        aria-label="Delete reminder"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
