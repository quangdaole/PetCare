"use client";

import { useEffect, useMemo, useState } from "react";
import HealthForm from "./HealthForm";
import HealthList from "./HealthList";
import { loadHealth, saveHealth } from "./storage";
import { HealthRecord } from "./types";

type Props = { petId: string; petName: string };

export default function HealthRecords({ petId, petName }: Props) {
  const [records, setRecords] = useState<HealthRecord[]>([]);

  useEffect(() => {
    setRecords(loadHealth());
  }, []);

  useEffect(() => {
    saveHealth(records);
  }, [records]);

  const petRecords = useMemo(
    () => records.filter((r) => r.petId === petId),
    [records, petId]
  );

  function handleAdd(r: HealthRecord) {
    setRecords((prev) => [r, ...prev]);
  }
  function handleDelete(id: string) {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Health Records</h2>
        <p className="text-gray-600">Manage vaccines, vet visits, medications, labs, and more for {petName}.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <HealthForm petId={petId} onAdd={handleAdd} />
        <HealthList records={petRecords} onDelete={handleDelete} />
      </div>
    </section>
  );
}
