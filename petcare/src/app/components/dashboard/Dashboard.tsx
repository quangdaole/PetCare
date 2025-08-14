"use client";

import { useEffect, useMemo, useState } from "react";

// reuse your existing stores & types
import { loadEntries } from "../pet-tracking/storage";
import { TrackingEntry } from "../pet-tracking/types";

import { loadHealth } from "../health/storage";
import { HealthRecord } from "../health/types";

import { loadReminders, saveReminders } from "../reminders/storage";
import { Reminder, Repeat } from "../reminders/types";

// Feature keys so we can deep-link via buttons
type FeatureKey = "pet-tracking" | "health" | "reminders" | "stats";

type Props = {
  petId: string;
  petName: string;
  onOpenFeature?: (key: FeatureKey) => void; // optional: open that feature on the page
};

export default function Dashboard({ petId, petName, onOpenFeature }: Props) {
  const [entries, setEntries] = useState<TrackingEntry[]>([]);
  const [health, setHealth] = useState<HealthRecord[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  // Load all data once
  useEffect(() => {
    setEntries(loadEntries());
    setHealth(loadHealth());
    setReminders(loadReminders());
  }, []);

  // Filter by pet
  const petEntries = useMemo(() => entries.filter(e => e.petId === petId), [entries, petId]);
  const petHealth  = useMemo(() => health.filter(h => h.petId === petId), [health, petId]);
  const petRems    = useMemo(() => reminders.filter(r => r.petId === petId), [reminders, petId]);

  // --- Metrics ---
  const now = new Date();
  const start7 = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);

  const isSameLocalDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const last7Entries = useMemo(
    () => petEntries.filter(e => new Date(e.dateISO) >= start7),
    [petEntries]
  );

  const walkMinutes7 = useMemo(
    () => last7Entries.reduce((sum, e) => sum + (e.type === "Walk" && typeof e.durationMin === "number" ? e.durationMin : 0), 0),
    [last7Entries]
  );

  const dueTodayCount = useMemo(() =>
    petRems.filter(r => !r.completedAtISO && isSameLocalDay(new Date(r.dueISO), now)).length,
  [petRems]);

  const overdueCount = useMemo(() =>
    petRems.filter(r => !r.completedAtISO && new Date(r.dueISO) < now).length,
  [petRems]);

  const next7Count = useMemo(() => {
    const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return petRems.filter(r => !r.completedAtISO && new Date(r.dueISO) >= now && new Date(r.dueISO) <= in7).length;
  }, [petRems]);

  const lastVetVisit = useMemo(() => {
    const visits = petHealth.filter(h => h.type === "VetVisit");
    if (visits.length === 0) return "-";
    const latest = visits.reduce((a, b) => new Date(a.dateISO) > new Date(b.dateISO) ? a : b);
    return new Date(latest.dateISO).toLocaleDateString();
  }, [petHealth]);

  const recentEntries = useMemo(
    () => [...petEntries].sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1)).slice(0, 5),
    [petEntries]
  );

  const recentHealth = useMemo(
    () => [...petHealth].sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1)).slice(0, 5),
    [petHealth]
  );

  const upcomingReminders = useMemo(() => {
    const open = petRems.filter(r => !r.completedAtISO).sort((a, b) => +new Date(a.dueISO) - +new Date(b.dueISO));
    return open.slice(0, 6);
  }, [petRems]);

  // --- Reminder handlers (lightweight controls right from dashboard) ---
  function nextDueISO(currentISO: string, repeat: Repeat) {
    const d = new Date(currentISO);
    if (Number.isNaN(d.getTime())) return null;
    switch (repeat) {
      case "Daily":   d.setDate(d.getDate() + 1); break;
      case "Weekly":  d.setDate(d.getDate() + 7); break;
      case "Monthly": d.setMonth(d.getMonth() + 1); break;
      default: return null;
    }
    return d.toISOString();
  }

  function toggleComplete(id: string) {
    setReminders(prev => {
      const found = prev.find(r => r.id === id);
      if (!found) return prev;
      const nowISO = new Date().toISOString();
      const justCompleted = !found.completedAtISO;

      let updated = prev.map(r => r.id === id ? { ...r, completedAtISO: justCompleted ? nowISO : undefined } : r);

      if (justCompleted && found.repeat !== "None") {
        const nxt = nextDueISO(found.dueISO, found.repeat);
        if (nxt) {
          updated = [
            { ...found, id: crypto.randomUUID(), dueISO: nxt, createdAtISO: nowISO, completedAtISO: undefined },
            ...updated
          ];
        }
      }
      saveReminders(updated);
      return updated;
    });
  }

  function snooze(id: string, minutes: number) {
    setReminders(prev => {
      const updated = prev.map(r =>
        r.id === id ? { ...r, dueISO: new Date(new Date(r.dueISO).getTime() + minutes * 60_000).toISOString() } : r
      );
      saveReminders(updated);
      return updated;
    });
  }

  function removeReminder(id: string) {
    setReminders(prev => {
      const updated = prev.filter(r => r.id !== id);
      saveReminders(updated);
      return updated;
    });
  }

  // Simple sparkline points for last 14 days
  const spark = useMemo(() => {
    const days = 14;
    const start = new Date(now.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
    const buckets = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      buckets.set(key, 0);
    }
    for (const e of petEntries) {
      const d = new Date(e.dateISO);
      const key = d.toISOString().slice(0, 10);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) || 0) + 1);
    }
    return Array.from(buckets.entries()).map(([k, v]) => ({ x: new Date(k), y: v }));
  }, [petEntries]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-gray-600">Overview for <span className="font-semibold">{petName}</span></p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-xl border px-3 py-2 hover:shadow" onClick={() => onOpenFeature?.("reminders")}>Open Reminders</button>
          <button className="rounded-xl border px-3 py-2 hover:shadow" onClick={() => onOpenFeature?.("pet-tracking")}>Open Tracking</button>
          <button className="rounded-xl border px-3 py-2 hover:shadow" onClick={() => onOpenFeature?.("health")}>Open Health</button>
          <button className="rounded-xl border px-3 py-2 hover:shadow" onClick={() => onOpenFeature?.("stats")}>Open Statistics</button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <KpiCard title="Due Today" value={dueTodayCount.toString()} hint="Reminders" onClick={() => onOpenFeature?.("reminders")} />
        <KpiCard title="Overdue" value={overdueCount.toString()} hint="Needs attention" onClick={() => onOpenFeature?.("reminders")} />
        <KpiCard title="Walk Minutes (7d)" value={walkMinutes7.toString()} hint="From Tracking" onClick={() => onOpenFeature?.("pet-tracking")} />
        <KpiCard title="Last Vet Visit" value={lastVetVisit} hint="" onClick={() => onOpenFeature?.("health")} />
      </div>

      {/* Mini activity sparkline */}
      <div className="rounded-2xl border p-4 shadow-sm bg-white/70 backdrop-blur mb-6">
        <h3 className="text-lg font-semibold mb-2">Activity (Last 14 Days)</h3>
        <Sparkline data={spark} />
      </div>

      {/* Upcoming Reminders */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border p-4 shadow-sm bg-white/70 backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Upcoming Reminders</h3>
            <button className="text-sm underline" onClick={() => onOpenFeature?.("reminders")}>View all</button>
          </div>

          {upcomingReminders.length === 0 ? (
            <p className="text-sm text-gray-600">No upcoming reminders.</p>
          ) : (
            <ul className="divide-y">
              {upcomingReminders.map(r => {
                const isOverdue = new Date(r.dueISO) < now;
                return (
                  <li key={r.id} className="py-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{r.title} <span className="text-xs text-gray-500">({r.type})</span></div>
                      <div className="text-xs text-gray-600">
                        {new Date(r.dueISO).toLocaleString()} · {r.priority}{isOverdue ? " · Overdue" : ""}
                      </div>
                      {r.notes && <div className="text-sm text-gray-700 mt-1">{r.notes}</div>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="rounded-lg border px-2 py-1 text-xs hover:shadow" onClick={() => toggleComplete(r.id)}>
                        {r.completedAtISO ? "Undo" : "Done"}
                      </button>
                      {!r.completedAtISO && (
                        <>
                          <button className="rounded-lg border px-2 py-1 text-xs hover:shadow" onClick={() => snooze(r.id, 60)}>Snooze 1h</button>
                          <button className="rounded-lg border px-2 py-1 text-xs hover:shadow" onClick={() => snooze(r.id, 24 * 60)}>Snooze 1d</button>
                        </>
                      )}
                      <button className="rounded-lg border px-2 py-1 text-xs hover:shadow" onClick={() => removeReminder(r.id)}>Delete</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Recent activity + health */}
        <div className="rounded-2xl border p-4 shadow-sm bg-white/70 backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Activity & Health</h3>
            <div className="flex gap-2">
              <button className="text-sm underline" onClick={() => onOpenFeature?.("pet-tracking")}>Tracking</button>
              <button className="text-sm underline" onClick={() => onOpenFeature?.("health")}>Health</button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Tracking</h4>
              {recentEntries.length === 0 ? (
                <p className="text-sm text-gray-600">No tracking yet.</p>
              ) : (
                <ul className="space-y-2">
                  {recentEntries.map(e => (
                    <li key={e.id} className="rounded-lg border p-2 text-sm">
                      <div className="font-medium">{e.type}</div>
                      <div className="text-xs text-gray-600">{new Date(e.dateISO).toLocaleString()}</div>
                      <div className="text-xs text-gray-700">
                        {typeof e.durationMin === "number" ? `Duration: ${e.durationMin} min. ` : ""}
                        {e.amount ? `Amount: ${e.amount}. ` : ""}
                        {typeof e.weightKg === "number" ? `Weight: ${e.weightKg} kg. ` : ""}
                        {e.locationLabel ? `@ ${e.locationLabel}` : ""}
                      </div>
                      {e.notes && <div className="text-xs mt-1">{e.notes}</div>}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h4 className="font-medium mb-2">Health</h4>
              {recentHealth.length === 0 ? (
                <p className="text-sm text-gray-600">No health records yet.</p>
              ) : (
                <ul className="space-y-2">
                  {recentHealth.map(h => (
                    <li key={h.id} className="rounded-lg border p-2 text-sm">
                      <div className="font-medium">{h.title} <span className="text-xs text-gray-500">({h.type})</span></div>
                      <div className="text-xs text-gray-600">{new Date(h.dateISO).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-700">
                        {h.vetName ? `Vet: ${h.vetName}. ` : ""}
                        {h.clinic ? `Clinic: ${h.clinic}. ` : ""}
                        {h.dosage ? `Dosage: ${h.dosage}. ` : ""}
                        {h.diagnosis ? `Dx: ${h.diagnosis}. ` : ""}
                        {h.result ? `Result: ${h.result}. ` : ""}
                        {h.followUpISO ? `Follow-up: ${new Date(h.followUpISO).toLocaleDateString()}.` : ""}
                      </div>
                      {h.notes && <div className="text-xs mt-1">{h.notes}</div>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- tiny presentational bits ---------- */

function KpiCard({ title, value, hint, onClick }: { title: string; value: string; hint?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="text-left rounded-2xl border p-4 shadow-sm bg-white/70 backdrop-blur hover:shadow transition">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-3xl font-bold leading-tight">{value}</div>
      {hint ? <div className="text-xs text-gray-500 mt-1">{hint}</div> : null}
    </button>
  );
}

function Sparkline({ data }: { data: { x: Date; y: number }[] }) {
  const width = 560, height = 80, padX = 8, padY = 8;
  if (data.length === 0) return <div className="text-sm text-gray-600">No data yet.</div>;

  const xs = data.map(d => d.x.getTime());
  const ys = data.map(d => d.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(1, ...ys);

  const xScale = (t: number) => padX + ((t - minX) / Math.max(1, maxX - minX)) * (width - 2 * padX);
  const yScale = (v: number) => height - padY - ((v - 0) / Math.max(1, maxY - 0)) * (height - 2 * padY);

  const d = data
    .map((pt, i) => `${i === 0 ? "M" : "L"} ${xScale(pt.x.getTime()).toFixed(1)} ${yScale(pt.y).toFixed(1)}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-20 text-blue-700">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" />
      {data.map((pt, i) => (
        <circle key={i} cx={xScale(pt.x.getTime())} cy={yScale(pt.y)} r="2.5" fill="currentColor">
          <title>{pt.x.toLocaleDateString()} • {pt.y}</title>
        </circle>
      ))}
    </svg>
  );
}
