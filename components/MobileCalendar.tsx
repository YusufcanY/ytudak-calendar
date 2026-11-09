"use client";

import { useEffect, useMemo, useRef } from "react";
import type { YtudakEvent } from "@/types";
import {
  getCalendarWeeks,
  getEventsForDate,
  groupEventsByStartDate,
  isoDate,
  mondayIndex,
  parseDate,
  TURKISH_DAYS_LONG,
  TURKISH_DAYS_SHORT,
  TURKISH_MONTHS,
} from "@/lib/calendar";
import { getEventColors } from "@/lib/eventColors";

export type MobileView = "month" | "list";

interface MobileCalendarProps {
  year: number;
  month: number;
  events: YtudakEvent[];
  view: MobileView;
  selectedIso: string;
  onSelectDate: (iso: string) => void;
  onEventClick: (event: YtudakEvent) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
  /** Incremented to request the list view scroll to today. */
  scrollSignal: number;
}

const MAX_DOTS = 3;
const SWIPE_THRESHOLD = 50;

function shortDate(iso: string): string {
  const d = parseDate(iso);
  return `${d.getDate()} ${TURKISH_MONTHS[d.getMonth()]}`;
}

function rangeLabel(event: YtudakEvent): string | null {
  if (!event.startDate || !event.endDate || event.startDate === event.endDate)
    return null;
  return `${shortDate(event.startDate)} – ${shortDate(event.endDate)}`;
}

export function MobileCalendar(props: MobileCalendarProps) {
  return props.view === "month" ? (
    <MonthView {...props} />
  ) : (
    <ListView {...props} />
  );
}

function MonthView({
  year,
  month,
  events,
  selectedIso,
  onSelectDate,
  onEventClick,
  onPrevMonth,
  onNextMonth,
  canGoPrev,
  canGoNext,
}: MobileCalendarProps) {
  const weeks = getCalendarWeeks(year, month);
  const today = isoDate(new Date());
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const selectedDate = parseDate(selectedIso);
  const selectedEvents = getEventsForDate(events, selectedDate);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy) * 1.5)
      return;
    if (dx < 0 && canGoNext) onNextMonth();
    if (dx > 0 && canGoPrev) onPrevMonth();
  };

  return (
    <div>
      <div
        key={`${year}-${month}`}
        className="animate-fadeIn rounded-xl overflow-hidden select-none"
        style={{
          border: "1px solid var(--border)",
          background: "var(--bg-cell)",
          touchAction: "pan-y",
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="grid grid-cols-7"
          style={{ background: "var(--bg-header)" }}
        >
          {TURKISH_DAYS_SHORT.map((day) => (
            <div
              key={day}
              className="py-2 text-center font-display text-[11px] font-bold tracking-wider uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              {day}
            </div>
          ))}
        </div>

        {weeks.map((week, weekIdx) => (
          <div
            key={weekIdx}
            className="grid grid-cols-7"
            style={{ borderTop: "1px solid var(--border-dim)" }}
          >
            {week.map((day) => {
              const dayIso = isoDate(day);
              const isCurrentMonth = day.getMonth() === month;
              const isToday = dayIso === today;
              const isSelected = dayIso === selectedIso;
              const dayEvents = getEventsForDate(events, day);

              let numberStyle: React.CSSProperties = {
                color: isCurrentMonth
                  ? "var(--text-primary)"
                  : "var(--text-dim)",
              };
              if (isToday) {
                numberStyle = { background: "var(--accent)", color: "#ffffff" };
              } else if (isSelected) {
                numberStyle = {
                  background: "var(--accent-dim)",
                  color: "var(--text-primary)",
                  boxShadow: "inset 0 0 0 1.5px var(--accent)",
                };
              }

              return (
                <button
                  key={dayIso}
                  type="button"
                  onClick={() => {
                    if (isCurrentMonth) onSelectDate(dayIso);
                    else if (day < new Date(year, month, 1)) {
                      if (canGoPrev) {
                        onPrevMonth();
                        onSelectDate(dayIso);
                      }
                    } else if (canGoNext) {
                      onNextMonth();
                      onSelectDate(dayIso);
                    }
                  }}
                  aria-label={`${day.getDate()} ${TURKISH_MONTHS[day.getMonth()]}, ${dayEvents.length} etkinlik`}
                  aria-pressed={isSelected}
                  className="flex flex-col items-center gap-1 pt-1.5 pb-2 min-h-14 cursor-pointer"
                  style={{
                    background: isSelected ? "var(--bg-card)" : "transparent",
                    opacity: isCurrentMonth ? 1 : 0.55,
                  }}
                >
                  <span
                    className="font-display font-bold text-[15px] w-8 h-8 flex items-center justify-center rounded-full"
                    style={numberStyle}
                  >
                    {day.getDate()}
                  </span>
                  <span className="flex items-center gap-0.5 h-1.5">
                    {dayEvents.slice(0, MAX_DOTS).map((ev) => (
                      <span
                        key={ev.id}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: getEventColors(ev.type).dot }}
                      />
                    ))}
                    {dayEvents.length > MAX_DOTS && (
                      <span
                        className="text-[9px] leading-none font-bold"
                        style={{ color: "var(--text-muted)" }}
                      >
                        +
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Selected day agenda */}
      <section className="mt-4">
        <h3
          className="font-display font-bold tracking-wide text-base mb-2 px-1"
          style={{ color: "var(--text-primary)" }}
        >
          {selectedDate.getDate()} {TURKISH_MONTHS[selectedDate.getMonth()]},{" "}
          <span style={{ color: "var(--text-muted)" }}>
            {TURKISH_DAYS_LONG[mondayIndex(selectedDate)]}
          </span>
        </h3>
        {selectedEvents.length === 0 ? (
          <p
            className="text-sm px-4 py-6 rounded-xl text-center"
            style={{
              color: "var(--text-muted)",
              background: "var(--bg-card)",
              border: "1px dashed var(--border)",
            }}
          >
            Bu gün için etkinlik yok
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {selectedEvents.map((ev) => (
              <EventRow key={ev.id} event={ev} onClick={onEventClick} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ListView({ events, onEventClick, scrollSignal }: MobileCalendarProps) {
  const groups = useMemo(() => groupEventsByStartDate(events), [events]);
  const today = isoDate(new Date());
  const targetIso = useMemo(() => {
    // Prefer a group that is ongoing or upcoming relative to today.
    const ongoing = groups.find((g) =>
      g.events.some((e) => (e.endDate ?? e.startDate)! >= today),
    );
    return ongoing?.iso ?? groups[groups.length - 1]?.iso;
  }, [groups, today]);
  const targetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    targetRef.current?.scrollIntoView({ block: "start" });
    // Only on mount and explicit "Bugün" requests, not on filter changes.
  }, [scrollSignal]);

  if (groups.length === 0) {
    return (
      <p
        className="text-sm px-4 py-6 rounded-xl text-center"
        style={{
          color: "var(--text-muted)",
          background: "var(--bg-card)",
          border: "1px dashed var(--border)",
        }}
      >
        Etkinlik bulunamadı
      </p>
    );
  }

  return (
    <div className="animate-fadeIn flex flex-col">
      {groups.map((g, i) => {
        const m = g.date.getMonth();
        const showMonth = i === 0 || groups[i - 1].date.getMonth() !== m;
        const isToday = g.iso === today;
        const isPast = g.iso < today;
        return (
          <div
            key={g.iso}
            ref={g.iso === targetIso ? targetRef : undefined}
            className="scroll-mt-20"
          >
            {showMonth && (
              <h3
                className="font-display font-black tracking-widest text-sm uppercase mt-5 mb-2 px-1 flex items-center gap-2"
                style={{ color: "var(--text-muted)" }}
              >
                {TURKISH_MONTHS[m]} {g.date.getFullYear()}
                <span
                  className="h-px flex-1"
                  style={{ background: "var(--border)" }}
                />
              </h3>
            )}
            <div
              className="flex gap-3 py-1.5"
              style={{ opacity: isPast ? 0.6 : 1 }}
            >
              <div className="w-11 shrink-0 flex flex-col items-center pt-1">
                <span
                  className="font-display text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: isToday ? "var(--accent)" : "var(--text-muted)" }}
                >
                  {TURKISH_DAYS_SHORT[mondayIndex(g.date)]}
                </span>
                <span
                  className="font-display font-bold text-lg w-9 h-9 flex items-center justify-center rounded-full"
                  style={
                    isToday
                      ? { background: "var(--accent)", color: "#ffffff" }
                      : { color: "var(--text-primary)" }
                  }
                >
                  {g.date.getDate()}
                </span>
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                {g.events.map((ev) => (
                  <EventRow key={ev.id} event={ev} onClick={onEventClick} />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EventRow({
  event,
  onClick,
}: {
  event: YtudakEvent;
  onClick: (event: YtudakEvent) => void;
}) {
  const colors = getEventColors(event.type);
  const range = rangeLabel(event);
  const meta = [event.campus, event.time].filter(Boolean).join(" · ");
  const detail = [range, event.campus ? null : event.location]
    .filter(Boolean)
    .join(" · ");
  return (
    <button
      type="button"
      onClick={() => onClick(event)}
      className="w-full text-left flex items-stretch rounded-xl overflow-hidden cursor-pointer active:scale-[0.99] transition-transform"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
    >
      <span className="w-1.5 shrink-0" style={{ background: colors.dot }} />
      <span className="flex-1 min-w-0 px-3 py-2.5">
        <span className="flex items-center gap-2 mb-0.5">
          <span
            className="text-[10px] font-mono font-medium uppercase tracking-wide"
            style={{ color: colors.dot }}
          >
            {colors.label}
          </span>
          {meta && (
            <span
              className="text-[10px] font-mono"
              style={{ color: "var(--text-muted)" }}
            >
              {meta}
            </span>
          )}
        </span>
        <span
          className="block text-[15px] font-medium leading-snug"
          style={{ color: "var(--text-primary)" }}
        >
          {event.name}
        </span>
        {detail && (
          <span
            className="block text-xs mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            {detail}
          </span>
        )}
      </span>
      <span
        className="self-center pr-3 text-lg"
        style={{ color: "var(--text-dim)" }}
        aria-hidden
      >
        ›
      </span>
    </button>
  );
}
