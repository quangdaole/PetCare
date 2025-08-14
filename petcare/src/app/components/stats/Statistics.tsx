"use client";

import { useEffect, useMemo, useState } from "react";
import { loadEntries } from "../pet-tracking/storage";
import { TrackingEntry } from "../pet-tracking/types";
import ActivityChart from "./charts/ActivityChart";
import TypeBar from "./charts/TypeBar";

type Props = { petId: string; petName: string };

export default function Statistics({ petId, petName }: Props) {
  const [entries, setEntries] = useState<TrackingEntry[]>([]);

  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  const petEntries = useMemo(
    () => entries.filter((e) => e.petId === petId),
    [entries, petId]
  );

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Statistics</h2>
        <p className="text-gray-600">Insights for {petName} based on your tracking data.</p>
      </div>

      <div className="grid gap-6">
        <div className="rounded-2xl border p-4 shadow-sm bg-white/70 backdrop-blur">
          <h3 className="text-lg font-semibold mb-3">Activity (Last 30 Days)</h3>
          <ActivityChart entries={petEntries} days={30} />
        </div>

        <div className="rounded-2xl border p-4 shadow-sm bg-white/70 backdrop-blur">
          <h3 className="text-lg font-semibold mb-3">Entries by Type</h3>
          <TypeBar entries={petEntries} />
        </div>
      </div>
    </section>
  );
}
