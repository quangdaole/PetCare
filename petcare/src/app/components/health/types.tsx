export type HealthEventType =
  | "Vaccination"
  | "VetVisit"
  | "Medication"
  | "Allergy"
  | "Condition"
  | "Surgery"
  | "LabResult";

export interface HealthRecord {
  id: string;
  petId: string;
  type: HealthEventType;
  dateISO: string;          // when it happened
  title: string;            // e.g., “Rabies Booster”, “Annual Checkup”
  vetName?: string;
  clinic?: string;
  dosage?: string;          // for meds or vaccine lot/dose
  diagnosis?: string;       // vet visit/condition
  result?: string;          // lab result summary
  followUpISO?: string;     // next appointment/recheck
  notes?: string;
  attachmentUrl?: string;   // optional (e.g., pdf link/image)
}
