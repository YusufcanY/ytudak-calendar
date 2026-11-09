"use client";

import { useCallback, useEffect, useState } from "react";
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
import { MobileCalendar, type MobileView } from "./MobileCalendar";
import { trackEvent } from "@/lib/analytics";

const VIEW_STORAGE_KEY = "ytudak-mobile-view";

interface CalendarProps {
  year: number;
  month: number; // 0-indexed
  events: YtudakEvent[];
  onEventClick: (event: YtudakEvent) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}


export function Calendar({
  year,
  month,
  events,
  onEventClick,
  onPrevMonth,
  onNextMonth,
  onToday,
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

  const [view, setView] = useState<MobileView>("month");
  const [selectedIso, setSelectedIso] = useState<string | null>(null);
  const [scrollSignal, setScrollSignal] = useState(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved === "month" || saved === "list") setView(saved);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const changeView = (next: MobileView) => {
    if (next === view) return;
    setView(next);
    trackEvent("mobile-view-change", { view: next });
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      /* storage unavailable */
    }
  };

  // Selected day for the mobile month view: keep the user's pick if it is in
  // the displayed month, otherwise today, the first day with events, or the 1st.
  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}-`;
  const effectiveSelectedIso =
    selectedIso?.startsWith(monthPrefix)
      ? selectedIso
      : today.startsWith(monthPrefix)
        ? today
        : (() => {
            const firstWithEvents = weeks
              .flat()
              .find(
                (d) => d.getMonth() === month && getEventsForDay(d).length > 0,
              );
            return firstWithEvents
              ? isoDate(firstWithEvents)
              : `${monthPrefix}01`;
          })();

  const handleToday = () => {
    onToday();
    setSelectedIso(today);
    setScrollSignal((n) => n + 1);
  };

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
          aria-label="Önceki ay"
          className={`${view === "list" ? "invisible sm:visible" : ""} w-10 h-10 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all font-display text-lg font-bold`}
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
            {view === "list" ? (
              <>
                <span className="sm:hidden">TÜM ETKİNLİKLER</span>
                <span className="hidden sm:inline">
                  {TURKISH_MONTHS[month].toUpperCase()}
                </span>
              </>
            ) : (
              TURKISH_MONTHS[month].toUpperCase()
            )}
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
          aria-label="Sonraki ay"
          className={`${view === "list" ? "invisible sm:visible" : ""} w-10 h-10 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all font-display text-lg font-bold`}
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

      {/* Mobile toolbar: today + view toggle */}
      <div className="sm:hidden flex items-center justify-between gap-2 mb-3">
        <button
          type="button"
          onClick={handleToday}
          className="px-3.5 h-9 rounded-lg text-sm font-display font-bold tracking-wide cursor-pointer"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
        >
          Bugün
        </button>
        <div
          role="tablist"
          aria-label="Görünüm"
          className="flex items-center gap-0.5 p-0.5 rounded-lg"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          {(
            [
              ["month", "Ay"],
              ["list", "Liste"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={view === value}
              onClick={() => changeView(value)}
              className="px-4 h-8 rounded-md text-sm font-display tracking-wide cursor-pointer transition-all"
              style={
                view === value
                  ? { background: "var(--accent)", color: "#ffffff", fontWeight: 700 }
                  : { color: "var(--text-muted)", fontWeight: 500 }
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile calendar */}
      <div className="sm:hidden">
        <MobileCalendar
          year={year}
          month={month}
          events={events}
          view={view}
          selectedIso={effectiveSelectedIso}
          onSelectDate={setSelectedIso}
          onEventClick={onEventClick}
          onPrevMonth={onPrevMonth}
          onNextMonth={onNextMonth}
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
          scrollSignal={scrollSignal}
        />
      </div>

      {/* Calendar grid (desktop) */}
      <div className="hidden sm:block overflow-x-auto">
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
