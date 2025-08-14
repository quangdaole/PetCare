"use client";

import { useEffect, useMemo, useState } from "react";
import ReminderForm from "./ReminderForm";
import ReminderList from "./ReminderList";
import { loadReminders, saveReminders } from "./storage";
import { Reminder, Repeat } from "./types";

type Props = { petId: string; petName: string };

function nextDueISO(currentISO: string, repeat: Repeat): string | null {
  const d = new Date(currentISO);
  if (Number.isNaN(d.getTime())) return null;

  switch (repeat) {
    case "Daily":
      d.setDate(d.getDate() + 1);
      return d.toISOString();
    case "Weekly":
      d.setDate(d.getDate() + 7);
      return d.toISOString();
    case "Monthly":
      d.setMonth(d.getMonth() + 1);
      return d.toISOString();
    default:
      return null;
  }
}

export default function Reminders({ petId, petName }: Props) {
  const [items, setItems] = useState<Reminder[]>([]);

  // Load once
  useEffect(() => {
    setItems(loadReminders());
  }, []);

  // Persist
  useEffect(() => {
    saveReminders(items);
  }, [items]);

  const petItems = useMemo(() => items.filter((r) => r.petId === petId), [items, petId]);

  function handleAdd(r: Reminder) {
    setItems((prev) => [r, ...prev]);
  }

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  function handleToggleComplete(id: string) {
    setItems((prev) => {
      const found = prev.find((x) => x.id === id);
      if (!found) return prev;

      // toggle completed
      const nowISO = new Date().toISOString();
      const newCompleted = found.completedAtISO ? undefined : nowISO;

      const updated = prev.map((x) =>
        x.id === id ? { ...x, completedAtISO: newCompleted } : x
      );

      // if we just completed & it repeats, spawn the next one
      if (!found.completedAtISO && found.repeat !== "None") {
        const nxt = nextDueISO(found.dueISO, found.repeat);
        if (nxt) {
          const newItem: Reminder = {
            ...found,
            id: crypto.randomUUID(),
            dueISO: nxt,
            completedAtISO: undefined,
            createdAtISO: nowISO,
          };
          return [newItem, ...updated];
        }
      }

      return updated;
    });
  }

  function handleSnooze(id: string, minutes: number) {
    setItems((prev) =>
      prev.map((x) =>
        x.id === id
          ? { ...x, dueISO: new Date(new Date(x.dueISO).getTime() + minutes * 60_000).toISOString() }
          : x
      )
    );
  }

  // (Optional) lightweight “due soon” highlight in UI. Could also request Notification permission here.

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Reminders</h2>
        <p className="text-gray-600">Create repeating reminders for {petName}: meds, vet visits, grooming, and more.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ReminderForm petId={petId} onAdd={handleAdd} />
        <ReminderList
          items={petItems}
          onDelete={handleDelete}
          onToggleComplete={handleToggleComplete}
          onSnooze={handleSnooze}
        />
      </div>
    </section>
  );
}
