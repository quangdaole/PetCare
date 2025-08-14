"use client";

import { useId, useMemo, useState } from "react";
import { HealthEventType, HealthRecord } from "./types";

const TYPES: HealthEventType[] = [
  "Vaccination",
  "VetVisit",
  "Medication",
  "Allergy",
  "Condition",
  "Surgery",
  "LabResult",
];

type Props = {
  petId: string;
  onAdd: (rec: HealthRecord) => void;
};

export default function HealthForm({ petId, onAdd }: Props) {
  const fid = useId();
  const [type, setType] = useState<HealthEventType>("Vaccination");
  const [dateISO, setDateISO] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  ); // yyyy-MM-dd
  const [title, setTitle] = useState("");
  const [vetName, setVetName] = useState("");
  const [clinic, setClinic] = useState("");
  const [dosage, setDosage] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [result, setResult] = useState("");
  const [followUpISO, setFollowUpISO] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");

  const needsDosage = useMemo(
    () => type === "Medication" || type === "Vaccination",
    [type]
  );
  const showDiagnosis = useMemo(
    () => type === "VetVisit" || type === "Condition",
    [type]
  );
  const showResult = useMemo(() => type === "LabResult", [type]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const rec: HealthRecord = {
      id: crypto.randomUUID(),
      petId,
      type,
      dateISO: new Date(dateISO).toISOString(),
      title: title.trim(),
      vetName: vetName || undefined,
      clinic: clinic || undefined,
      dosage: needsDosage && dosage ? dosage : undefined,
      diagnosis: showDiagnosis && diagnosis ? diagnosis : undefined,
      result: showResult && result ? result : undefined,
      followUpISO: followUpISO ? new Date(followUpISO).toISOString() : undefined,
      notes: notes || undefined,
      attachmentUrl: attachmentUrl || undefined,
    };

    onAdd(rec);

    // reset some fields, keep type & date
    setTitle("");
    setVetName("");
    setClinic("");
    setDosage("");
    setDiagnosis("");
    setResult("");
    setFollowUpISO("");
    setNotes("");
    setAttachmentUrl("");
  }

  return (
    <form
      aria-labelledby={`${fid}-legend`}
      onSubmit={handleSubmit}
      className="w-full rounded-2xl border p-4 shadow-sm bg-white/70 backdrop-blur"
    >
      <h3 id={`${fid}-legend`} className="text-lg font-semibold mb-3">
        Add Health Record
      </h3>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm">Type</span>
          <select
            className="rounded-lg border px-3 py-2"
            value={type}
            onChange={(e) => setType(e.target.value as HealthEventType)}
            aria-label="Health record type"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Date</span>
          <input
            type="date"
            className="rounded-lg border px-3 py-2"
            value={dateISO}
            onChange={(e) => setDateISO(e.target.value)}
            required
          />
        </label>

        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-sm">Title</span>
          <input
            className="rounded-lg border px-3 py-2"
            placeholder="e.g., Rabies Booster, Annual Checkup"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Vet Name (optional)</span>
          <input
            className="rounded-lg border px-3 py-2"
            value={vetName}
            onChange={(e) => setVetName(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Clinic (optional)</span>
          <input
            className="rounded-lg border px-3 py-2"
            value={clinic}
            onChange={(e) => setClinic(e.target.value)}
          />
        </label>

        {needsDosage && (
          <label className="flex flex-col gap-1">
            <span className="text-sm">{type === "Medication" ? "Dosage" : "Dose/Lot"}</span>
            <input
              className="rounded-lg border px-3 py-2"
              placeholder={type === "Medication" ? "e.g., 20mg 2x/day" : "e.g., 1 mL, Lot# 1234"}
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
            />
          </label>
        )}

        {showDiagnosis && (
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-sm">Diagnosis / Assessment</span>
            <input
              className="rounded-lg border px-3 py-2"
              placeholder="e.g., Otitis externa; Mild dental tartar"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
            />
          </label>
        )}

        {showResult && (
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-sm">Lab Result</span>
            <input
              className="rounded-lg border px-3 py-2"
              placeholder="e.g., CBC normal; ALT slightly elevated"
              value={result}
              onChange={(e) => setResult(e.target.value)}
            />
          </label>
        )}

        <label className="flex flex-col gap-1">
          <span className="text-sm">Follow-up (optional)</span>
          <input
            type="date"
            className="rounded-lg border px-3 py-2"
            value={followUpISO}
            onChange={(e) => setFollowUpISO(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Attachment URL (optional)</span>
          <input
            className="rounded-lg border px-3 py-2"
            placeholder="e.g., https://…/record.pdf"
            value={attachmentUrl}
            onChange={(e) => setAttachmentUrl(e.target.value)}
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
          Add Record
        </button>
      </div>
    </form>
  );
}
