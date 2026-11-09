export type EventType =
  | "Teorik"
  | "Pratik"
  | "Konaklamalı Pratik"
  | "Sınav"
  | "Sohbet"
  | "Sunum";

export type Campus = "Yıldız" | "Davutpaşa";

export type TypeFilter = "all" | "Teorik" | "Pratik" | "Sınav";

export type CampusFilter = "all" | Campus;

export interface YtudakEvent {
  id: string;
  name: string;
  type: EventType;
  /** Campus for theory sessions held on campus, otherwise null. */
  campus: Campus | null;
  /** Human-readable place, e.g. "Yuvacık, Kocaeli". */
  location: string | null;
  startDate: string | null; // ISO "YYYY-MM-DD", null = not yet fixed
  endDate: string | null; // ISO "YYYY-MM-DD", null = same as startDate
  /** Approximate date label when no exact date exists, e.g. "Şubat 2027". */
  approxDate: string | null;
  time?: string;
  /** Shared key linking the Yıldız / Davutpaşa sessions of the same lesson. */
  sessionGroup?: string;
}
