import type { YtudakEvent } from "@/types";

/** Assumed length of events that only have a start time (e.g. "19.30"). */
const TIMED_EVENT_HOURS = 2;
/** Türkiye is UTC+3 all year (no DST since 2016). */
const ISTANBUL_UTC_OFFSET_HOURS = 3;
const ORGANIZER = "YTÜDAK Başlangıç Grubu";

/** Whether the event has a concrete date and can be added to a calendar. */
export function canExport(event: YtudakEvent): boolean {
  return event.startDate !== null;
}

/** "2026-10-20" -> "20261020" */
function compactDate(iso: string): string {
  return iso.replaceAll("-", "");
}

/** All-day DTEND is exclusive, so it is the day after the last day. */
function dayAfter(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1));
  return next.toISOString().slice(0, 10);
}

/** Local Istanbul date + "19.30" -> UTC "YYYYMMDDTHHMMSSZ". */
function utcStamp(iso: string, time: string, addHours = 0): string {
  const [y, m, d] = iso.split("-").map(Number);
  const [hh, mm] = time.split(".").map(Number);
  const date = new Date(
    Date.UTC(y, m - 1, d, hh - ISTANBUL_UTC_OFFSET_HOURS + addHours, mm),
  );
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

interface ExportRange {
  start: string;
  end: string;
  allDay: boolean;
}

function exportRange(event: YtudakEvent): ExportRange {
  const start = event.startDate!;
  const last = event.endDate ?? start;
  if (event.time) {
    return {
      start: utcStamp(start, event.time),
      end: utcStamp(last, event.time, TIMED_EVENT_HOURS),
      allDay: false,
    };
  }
  return {
    start: compactDate(start),
    end: compactDate(dayAfter(last)),
    allDay: true,
  };
}

function description(event: YtudakEvent): string {
  const lines = [`${ORGANIZER} · ${event.type}`];
  if (event.time) lines.push(`Başlangıç saati: ${event.time}`);
  if (event.type === "Konaklamalı Pratik") lines.push("Konaklamalı faaliyet.");
  lines.push("Tarihler mevsimsel koşullara göre değişebilir.");
  return lines.join("\n");
}

function title(event: YtudakEvent): string {
  return event.campus
    ? `YTÜDAK: ${event.name} (${event.campus})`
    : `YTÜDAK: ${event.name}`;
}

export function googleCalendarUrl(event: YtudakEvent): string {
  const { start, end } = exportRange(event);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title(event),
    dates: `${start}/${end}`,
    details: description(event),
  });
  if (event.location) params.set("location", event.location);
  return `https://calendar.google.com/calendar/render?${params}`;
}

/** Path of the statically generated .ics file for an event. */
export function icsPath(event: YtudakEvent): string {
  return `/ics/${event.id}.ics`;
}

/** RFC 5545 TEXT escaping. */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/** Folds a content line to 75 octets, never splitting a UTF-8 character. */
function fold(line: string): string {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = "";
  let bytes = 0;
  for (const char of line) {
    const size = encoder.encode(char).length;
    const limit = parts.length === 0 ? 75 : 74; // continuation lines start with a space
    if (bytes + size > limit) {
      parts.push(current);
      current = "";
      bytes = 0;
    }
    current += char;
    bytes += size;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

export function buildIcs(event: YtudakEvent, now = new Date()): string {
  const { start, end, allDay } = exportRange(event);
  const dtstamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//YTUDAK//Egitim Takvimi//TR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}@ytudak-calendar`,
    `DTSTAMP:${dtstamp}`,
    allDay ? `DTSTART;VALUE=DATE:${start}` : `DTSTART:${start}`,
    allDay ? `DTEND;VALUE=DATE:${end}` : `DTEND:${end}`,
    `SUMMARY:${escapeText(title(event))}`,
    `DESCRIPTION:${escapeText(description(event))}`,
    ...(event.location ? [`LOCATION:${escapeText(event.location)}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}
