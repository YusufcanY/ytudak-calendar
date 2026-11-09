import type { YtudakEvent } from "@/types";
import { TURKISH_MONTHS, parseDate } from "@/lib/calendar";

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${TURKISH_MONTHS[m - 1]} ${y}`;
}

const TURKISH_WEEKDAYS = [
  "Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi",
];

function weekday(iso: string): string {
  return TURKISH_WEEKDAYS[parseDate(iso).getDay()];
}

export function formatDateRange(event: YtudakEvent): string {
  if (!event.startDate) return event.approxDate ?? "Tarih kesinleşmedi";
  const start = formatDate(event.startDate);
  if (!event.endDate || event.startDate === event.endDate) {
    return `${start}, ${weekday(event.startDate)}`;
  }
  const end = formatDate(event.endDate);
  return `${start} – ${end}`;
}
