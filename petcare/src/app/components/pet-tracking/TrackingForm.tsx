"use client";

import { useId, useMemo, useState } from "react";
import { TrackingEntry, TrackingType, Pet } from "./types";

const TYPES: TrackingType[] = ["Walk", "Feeding", "Medication", "Weight", "Grooming", "Note"];

type Props = {
  pet: Pet;
  onAdd: (entry: TrackingEntry) => void;
};

export default function TrackingForm({ pet, onAdd }: Props) {
  const formId = useId();
  const [type, setType] = useState<TrackingType>("Walk");
  const [dateISO, setDateISO] = useState<string>(() => new Date().toISOString().slice(0, 16)); // yyyy-MM-ddThh:mm
  const [durationMin, setDurationMin] = useState<number | "">("");
  const [amount, setAmount] = useState<string>("");
  const [weightKg, setWeightKg] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [locationLabel, setLocationLabel] = useState("");

  const requiresDuration = useMemo(() => type === "Walk" || type === "Grooming", [type]);
  const showAmount = useMemo(() => type === "Feeding" || type === "Medication", [type]);
  const showWeight = useMemo(() => type === "Weight", [type]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const entry: TrackingEntry = {
      id: crypto.randomUUID(),
      petId: pet.id,
      type,
      dateISO: new Date(dateISO).toISOString(),
      durationMin: requiresDuration && durationMin !== "" ? Number(durationMin) : undefined,
      amount: showAmount && amount ? amount : undefined,
      weightKg: showWeight && weightKg !== "" ? Number(weightKg) : undefined,
      notes: notes || undefined,
      locationLabel: locationLabel || undefined,
    };

    onAdd(entry);

    // reset minimally (keep type & date close to now)
    setDateISO(new Date().toISOString().slice(0, 16));
    setDurationMin("");
    setAmount("");
    setWeightKg("");
    setNotes("");
    setLocationLabel("");
  }

  return (
    <form
      aria-labelledby={`${formId}-legend`}
      onSubmit={handleSubmit}
      className="w-full rounded-2xl border p-4 shadow-sm bg-white/70 backdrop-blur"
    >
      <h3 id={`${formId}-legend`} className="text-lg font-semibold mb-3">
        Add Entry for {pet.name}
      </h3>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm">Type</span>
          <select
            className="rounded-lg border px-3 py-2"
            value={type}
            onChange={(e) => setType(e.target.value as TrackingType)}
            aria-label="Entry type"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Date & Time</span>
          <input
            type="datetime-local"
            className="rounded-lg border px-3 py-2"
            value={dateISO}
            onChange={(e) => setDateISO(e.target.value)}
            required
          />
        </label>

        {requiresDuration && (
          <label className="flex flex-col gap-1">
            <span className="text-sm">Duration (min)</span>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              className="rounded-lg border px-3 py-2"
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="e.g., 30"
              aria-describedby={`${formId}-duration-hint`}
            />
            <span id={`${formId}-duration-hint`} className="text-xs text-gray-500">Numbers only.</span>
          </label>
        )}

        {showAmount && (
          <label className="flex flex-col gap-1">
            <span className="text-sm">Amount</span>
            <input
              className="rounded-lg border px-3 py-2"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={type === "Feeding" ? "e.g., 2 cups" : "e.g., 30mg"}
            />
          </label>
        )}

        {showWeight && (
          <label className="flex flex-col gap-1">
            <span className="text-sm">Weight (kg)</span>
            <input
              inputMode="decimal"
              pattern="[0-9]*[.]?[0-9]*"
              className="rounded-lg border px-3 py-2"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="e.g., 8.5"
            />
          </label>
        )}

        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-sm">Location (optional)</span>
          <input
            className="rounded-lg border px-3 py-2"
            value={locationLabel}
            onChange={(e) => setLocationLabel(e.target.value)}
            placeholder="e.g., Neighborhood Park"
          />
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
        <button type="submit" className="rounded-xl px-4 py-2 border shadow-sm hover:shadow transition">
          Add Entry
        </button>
      </div>
    </form>
  );
}
