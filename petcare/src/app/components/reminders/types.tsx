export type ReminderType =
  | "Medication"
  | "VetVisit"
  | "Feeding"
  | "Grooming"
  | "Walk"
  | "Training"
  | "Custom";

export type Repeat = "None" | "Daily" | "Weekly" | "Monthly";

export type Priority = "Low" | "Normal" | "High";

export interface Reminder {
  id: string;
  petId: string;
  type: ReminderType;
  title: string;
  dueISO: string;          // ISO datetime
  repeat: Repeat;
  priority: Priority;
  notes?: string;

  createdAtISO: string;
  completedAtISO?: string; // present if completed
}
