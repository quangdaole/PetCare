"use client";

import { useEffect, useMemo, useState } from "react";
import TrackingForm from "./TrackingForm";
import TrackingList from "./TrackingList";
import { loadEntries, saveEntries } from "./storage";
import { Pet, TrackingEntry } from "./types";

type Props = {
  pet: Pet; // pass the selected pet
};

export default function PetTracking({ pet }: Props) {
  const [entries, setEntries] = useState<TrackingEntry[]>([]);

  // Load once
  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  // Persist on change
  useEffect(() => {
    saveEntries(entries);
  }, [entries]);

  const petEntries = useMemo(
    () => entries.filter((e) => e.petId === pet.id),
    [entries, pet.id]
  );

  function handleAdd(entry: TrackingEntry) {
    setEntries((prev) => [entry, ...prev]);
  }

  function handleDelete(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <section id="tracking" className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Pet Tracking</h2>
        <p className="text-gray-600">Log walks, feedings, meds, weight, grooming, or notes for {pet.name}.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TrackingForm pet={pet} onAdd={handleAdd} />
        <TrackingList entries={petEntries} onDelete={handleDelete} />
      </div>
    </section>
  );
}
