"use client";

import { useMemo, useState } from "react";
import { HealthRecord, HealthEventType } from "./types";

type Props = {
  records: HealthRecord[];
  onDelete: (id: string) => void;
};

export default function HealthList({ records, onDelete }: Props) {
  const [q, setQ] = useState("");
  const [type, setType] = useState<HealthEventType | "All">("All");

  const filtered = useMemo(() => {
    return records
      .filter((r) => (type === "All" ? true : r.type === type))
      .filter((r) => {
        if (!q.trim()) return true;
        const hay = `${r.title} ${r.type} ${r.vetName ?? ""} ${r.clinic ?? ""} ${r.diagnosis ?? ""} ${r.result ?? ""} ${r.notes ?? ""}`.toLowerCase();
        return hay.includes(q.toLowerCase());
      })
      .sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1)); // newest first
  }, [records, q, type]);

  return (
    <div className="rounded-2xl border p-4 shadow-sm bg-white/70 backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold">Records</h3>
        <div className="flex gap-2">
          <input
            type="search"
            placeholder="Search title/vet/clinic/notes"
            className="rounded-lg border px-3 py-2 w-56"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search health records"
          />
          <select
            className="rounded-lg border px-3 py-2"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            aria-label="Filter by type"
          >
            <option>All</option>
            <option>Vaccination</option>
            <option>VetVisit</option>
            <option>Medication</option>
            <option>Allergy</option>
            <option>Condition</option>
            <option>Surgery</option>
            <option>LabResult</option>
          </select>
        </div>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left">
            <tr className="border-b">
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Title</th>
              <th className="py-2 pr-4">Details</th>
              <th className="py-2 pr-4">Follow-up</th>
              <th className="py-2 pr-4">Notes</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-gray-500">
                  No health records yet.
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="border-b last:border-none align-top">
                <td className="py-2 pr-4 whitespace-nowrap">
                  {new Date(r.dateISO).toLocaleDateString()}
                </td>
                <td className="py-2 pr-4">{r.type}</td>
                <td className="py-2 pr-4">{r.title}</td>
                <td className="py-2 pr-4">
                  {r.vetName ? `Vet: ${r.vetName}. ` : ""}
                  {r.clinic ? `Clinic: ${r.clinic}. ` : ""}
                  {r.dosage ? `Dosage: ${r.dosage}. ` : ""}
                  {r.diagnosis ? `Dx: ${r.diagnosis}. ` : ""}
                  {r.result ? `Result: ${r.result}. ` : ""}
                  {r.attachmentUrl ? (
                    <>
                      {" "}
                      <a className="underline" href={r.attachmentUrl} target="_blank" rel="noreferrer">
                        Attachment
                      </a>
                    </>
                  ) : ""}
                </td>
                <td className="py-2 pr-4 whitespace-nowrap">
                  {r.followUpISO ? new Date(r.followUpISO).toLocaleDateString() : "-"}
                </td>
                <td className="py-2 pr-4">{r.notes ?? "-"}</td>
                <td className="py-2 pr-4">
                  <button
                    onClick={() => onDelete(r.id)}
                    className="rounded-lg border px-3 py-1 text-xs hover:shadow"
                    aria-label={`Delete ${r.type} record "${r.title}"`}
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
