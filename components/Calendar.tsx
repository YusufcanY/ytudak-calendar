"use client";

import { useCallback } from "react";
import type { YtudakEvent } from "@/types";
import {
  getCalendarWeeks,
  getEventsForDate,
  isoDate,
  CALENDAR_START,
  CALENDAR_END,
  TURKISH_MONTHS,
  TURKISH_DAYS_SHORT,
} from "@/lib/calendar";
import { EventChip } from "./EventChip";

interface CalendarProps {
  year: number;
  month: number; // 0-indexed
  events: YtudakEvent[];
  onEventClick: (event: YtudakEvent) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}


export function Calendar({
  year,
  month,
  events,
  onEventClick,
  onPrevMonth,
  onNextMonth,
}: CalendarProps) {
  const weeks = getCalendarWeeks(year, month);
  const today = isoDate(new Date());

  const getEventsForDay = useCallback(
    (date: Date) => getEventsForDate(events, date),
    [events]
  );

  const monthIndex = year * 12 + month;
  const canGoPrev =
    monthIndex > CALENDAR_START.getFullYear() * 12 + CALENDAR_START.getMonth();
  const canGoNext =
    monthIndex < CALENDAR_END.getFullYear() * 12 + CALENDAR_END.getMonth();

  return (
    <div className="animate-fadeIn">
      {/* Month nav header */}
      <div
        className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 rounded-xl mb-2"
        style={{
          background: "var(--bg-header)",
          border: "1px solid var(--border)",
        }}
      >
        <button
          onClick={onPrevMonth}
          disabled={!canGoPrev}
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all font-display text-lg font-bold"
          style={{
            background: canGoPrev ? "var(--bg-cell)" : "transparent",
            color: canGoPrev ? "var(--text-primary)" : "var(--text-dim)",
            border: canGoPrev ? "1px solid var(--border)" : "1px solid transparent",
            cursor: canGoPrev ? "pointer" : "not-allowed",
          }}
        >
          ‹
        </button>

        <div className="text-center">
          <h2
            className="font-display font-bold tracking-wider"
            style={{ color: "var(--text-primary)", fontSize: "22px" }}
          >
            {TURKISH_MONTHS[month].toUpperCase()}
          </h2>
          <p
            className="font-mono text-xs tracking-widest"
            style={{ color: "var(--accent)" }}
          >
            {year}
          </p>
        </div>

        <button
          onClick={onNextMonth}
          disabled={!canGoNext}
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all font-display text-lg font-bold"
          style={{
            background: canGoNext ? "var(--bg-cell)" : "transparent",
            color: canGoNext ? "var(--text-primary)" : "var(--text-dim)",
            border: canGoNext ? "1px solid var(--border)" : "1px solid transparent",
            cursor: canGoNext ? "pointer" : "not-allowed",
          }}
        >
          ›
        </button>
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto">
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid var(--border)", minWidth: "560px" }}
      >
        {/* Day-of-week headers */}
        <div
          className="grid grid-cols-7"
          style={{ background: "var(--bg-header)" }}
        >
          {TURKISH_DAYS_SHORT.map((day) => (
            <div
              key={day}
              className="py-3 text-center font-display text-xs font-bold tracking-widest uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Week rows */}
        {weeks.map((week, weekIdx) => {
          return (
            <div
              key={weekIdx}
              style={{
                borderTop: weekIdx === 0 ? "none" : "1px solid var(--border-dim)",
              }}
            >
              {/* Day cells */}
              <div className="grid grid-cols-7">
                {week.map((day, dayIdx) => {
                  const isCurrentMonth = day.getMonth() === month;
                  const dayIso = isoDate(day);
                  const isToday = dayIso === today;
                  const dayEvents = getEventsForDay(day);
                  const MAX_VISIBLE = 3;
                  const visibleEvents = dayEvents.slice(0, MAX_VISIBLE);
                  const hiddenCount = dayEvents.length - MAX_VISIBLE;

                  return (
                    <div
                      key={dayIso}
                      className="min-h-36 p-2"
                      style={{
                        background: isCurrentMonth
                          ? "var(--bg-cell)"
                          : "var(--bg-header)",
                        borderLeft:
                          dayIdx > 0 ? "1px solid var(--border-dim)" : "none",
                      }}
                    >
                      {/* Day number */}
                      <div className="flex justify-end mb-2 pr-0.5 pt-0.5">
                        <span
                          className="font-display font-bold text-sm w-6 h-6 flex items-center justify-center rounded-full"
                          style={
                            isToday
                              ? {
                                  background: "var(--accent)",
                                  color: "#0c1410",
                                  fontSize: "11px",
                                }
                              : {
                                  color: isCurrentMonth
                                    ? "var(--text-primary)"
                                    : "var(--text-dim)",
                                  fontSize: "11px",
                                }
                          }
                        >
                          {day.getDate()}
                        </span>
                      </div>

                      {/* Events */}
                      <div className="flex flex-col gap-1">
                        {visibleEvents.map((event) => {
                          const isMulti = !!(event.endDate && event.endDate !== event.startDate);
                          return (
                            <div key={event.id} className="relative">
                              <EventChip
                                event={event}
                                onClick={onEventClick}
                              />
                              {isMulti && (
                                <span
                                  className="absolute right-1 top-0 bottom-0 flex items-center text-[8px] pointer-events-none"
                                  style={{ color: "var(--text-dim)" }}
                                >
                                  →
                                </span>
                              )}
                            </div>
                          );
                        })}
                        {hiddenCount > 0 && (
                          <span
                            className="text-[9px] font-display font-bold pl-1"
                            style={{ color: "var(--text-muted)" }}
                          >
                            +{hiddenCount} daha
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
