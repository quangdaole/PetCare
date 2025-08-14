export type TrackingType = "Walk" | "Feeding" | "Medication" | "Weight" | "Grooming" | "Note";

export interface TrackingEntry {
  id: string;
  petId: string;
  type: TrackingType;
  dateISO: string;      // ISO date string
  durationMin?: number; // Walk/Grooming etc.
  amount?: string;      // e.g., "2 cups", "30mg", "350g"
  weightKg?: number;    // for Weight entries
  notes?: string;
  locationLabel?: string;
}

export interface Pet {
  id: string;
  name: string;
}
