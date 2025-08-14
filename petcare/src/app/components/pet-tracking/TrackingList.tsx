"use client";

import { useMemo, useState } from "react";
import { TrackingEntry, TrackingType } from "./types";

type Props = {
  entries: TrackingEntry[];
  onDelete: (id: string) => void;
};

export default function TrackingList({ entries, onDelete }: Props) {
  const [q, setQ] = useState("");
  const [type, setType] = useState<TrackingType | "All">("All");

  const filtered = useMemo(() => {
    return entries
      .filter((e) => (type === "All" ? true : e.type === type))
      .filter((e) => {
        if (!q.trim()) return true;
        const hay = `${e.type} ${e.notes ?? ""} ${e.amount ?? ""} ${e.locationLabel ?? ""}`.toLowerCase();
        return hay.includes(q.toLowerCase());
      })
      .sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1));
  }, [entries, q, type]);

  return (
    <div className="rounded-2xl border p-4 shadow-sm bg-white/70 backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold">History</h3>
        <div className="flex gap-2">
          <input
            type="search"
            placeholder="Search notes/type/location"
            className="rounded-lg border px-3 py-2 w-56"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search entries"
          />
          <select
            className="rounded-lg border px-3 py-2"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            aria-label="Filter by type"
          >
            <option>All</option>
            <option>Walk</option>
            <option>Feeding</option>
            <option>Medication</option>
            <option>Weight</option>
            <option>Grooming</option>
            <option>Note</option>
          </select>
        </div>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left">
            <tr className="border-b">
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Details</th>
              <th className="py-2 pr-4">Notes</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-500">
                  No entries yet.
                </td>
              </tr>
            )}
            {filtered.map((e) => (
              <tr key={e.id} className="border-b last:border-none">
                <td className="py-2 pr-4 whitespace-nowrap">
                  {new Date(e.dateISO).toLocaleString()}
                </td>
                <td className="py-2 pr-4">{e.type}</td>
                <td className="py-2 pr-4">
                  {e.durationMin ? `Duration: ${e.durationMin} min ` : ""}
                  {e.amount ? `Amount: ${e.amount} ` : ""}
                  {typeof e.weightKg === "number" ? `Weight: ${e.weightKg} kg ` : ""}
                  {e.locationLabel ? `@ ${e.locationLabel}` : ""}
                </td>
                <td className="py-2 pr-4">{e.notes ?? "-"}</td>
                <td className="py-2 pr-4">
                  <button
                    onClick={() => onDelete(e.id)}
                    className="rounded-lg border px-3 py-1 text-xs hover:shadow"
                    aria-label={`Delete ${e.type} entry from ${new Date(e.dateISO).toLocaleString()}`}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
