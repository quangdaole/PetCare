"use client";

import { useId, useMemo, useState } from "react";
import { Reminder, ReminderType, Repeat, Priority } from "./types";

const TYPES: ReminderType[] = ["Medication", "VetVisit", "Feeding", "Grooming", "Walk", "Training", "Custom"];
const REPEATS: Repeat[] = ["None", "Daily", "Weekly", "Monthly"];
const PRIORITIES: Priority[] = ["Low", "Normal", "High"];

type Props = {
  petId: string;
  onAdd: (r: Reminder) => void;
};

export default function ReminderForm({ petId, onAdd }: Props) {
  const fid = useId();
  const [type, setType] = useState<ReminderType>("Medication");
  const [title, setTitle] = useState("");
  const [dueLocal, setDueLocal] = useState<string>(() => new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)); // +1h default
  const [repeat, setRepeat] = useState<Repeat>("None");
  const [priority, setPriority] = useState<Priority>("Normal");
  const [notes, setNotes] = useState("");

  const isValid = useMemo(() => title.trim().length > 0 && dueLocal.length > 0, [title, dueLocal]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    const r: Reminder = {
      id: crypto.randomUUID(),
      petId,
      type,
      title: title.trim(),
      dueISO: new Date(dueLocal).toISOString(),
      repeat,
      priority,
      notes: notes || undefined,
      createdAtISO: new Date().toISOString(),
    };

    onAdd(r);
    // reset minimal
    setTitle("");
    setNotes("");
    setType("Medication");
    setRepeat("None");
    setPriority("Normal");
    setDueLocal(new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16));
  }

  return (
    <form
      aria-labelledby={`${fid}-legend`}
      onSubmit={handleSubmit}
      className="w-full rounded-2xl border p-4 shadow-sm bg-white/70 backdrop-blur"
    >
      <h3 id={`${fid}-legend`} className="text-lg font-semibold mb-3">
        Add Reminder
      </h3>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm">Type</span>
          <select
            className="rounded-lg border px-3 py-2"
            value={type}
            onChange={(e) => setType(e.target.value as ReminderType)}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Due (date & time)</span>
          <input
            type="datetime-local"
            className="rounded-lg border px-3 py-2"
            value={dueLocal}
            onChange={(e) => setDueLocal(e.target.value)}
            required
          />
        </label>

        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-sm">Title</span>
          <input
            className="rounded-lg border px-3 py-2"
            placeholder="e.g., Heartworm pill, Annual vaccines, Grooming appointment"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Repeat</span>
          <select
            className="rounded-lg border px-3 py-2"
            value={repeat}
            onChange={(e) => setRepeat(e.target.value as Repeat)}
          >
            {REPEATS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Priority</span>
          <select
            className="rounded-lg border px-3 py-2"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-sm">Notes (optional)</span>
          <textarea
            className="rounded-lg border px-3 py-2"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any extra details…"
          />
        </label>
      </div>

      <div className="mt-4">
        <button
          type="submit"
          disabled={!isValid}
          className="rounded-xl px-4 py-2 border shadow-sm hover:shadow transition disabled:opacity-50"
        >
          Add Reminder
        </button>
      </div>
    </form>
  );
}
