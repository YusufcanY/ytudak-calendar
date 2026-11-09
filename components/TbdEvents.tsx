"use client";

import type { YtudakEvent } from "@/types";
import { getEventColors } from "@/lib/eventColors";

interface TbdEventsProps {
  events: YtudakEvent[];
  onEventClick: (event: YtudakEvent) => void;
}

export function TbdEvents({ events, onEventClick }: TbdEventsProps) {
  if (events.length === 0) return null;

  return (
    <section className="mt-10 sm:mt-16 animate-fadeIn">
      <div className="flex items-center gap-3 mb-6">
        <div
          className="h-px flex-1"
          style={{ background: "var(--border)" }}
        />
        <h2
          className="font-display text-sm font-bold tracking-widest uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          Tarihi Kesinleşmemiş Faaliyetler
        </h2>
        <div
          className="h-px flex-1"
          style={{ background: "var(--border)" }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {events.map((event) => {
          const colors = getEventColors(event.type);
          return (
            <button
              key={event.id}
              onClick={() => onEventClick(event)}
              className="w-full p-0 text-left rounded-xl overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
              }}
            >
              <div
                className="h-1 w-full"
                style={{ background: colors.dot }}
              />
              <div style={{ padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", marginBottom: "12px" }}>
                  <span
                    className={`${colors.className}`}
                    style={{ fontSize: "10px", fontWeight: 500, padding: "4px 8px", borderRadius: "4px", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.05em" }}
                  >
                    {colors.label}
                  </span>
                </div>

                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: "15px",
                    lineHeight: 1.3,
                    marginBottom: "12px",
                    color: "var(--text-primary)",
                  }}
                >
                  {event.name}
                </p>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                  {event.location && (
                    <span
                      style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "var(--text-muted)" }}
                    >
                      {event.location}
                    </span>
                  )}
                  <span
                    style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontStyle: "italic", marginLeft: "auto", color: "var(--accent)" }}
                  >
                    {event.approxDate ?? "Tarih belirsiz"}
                  </span>
                </div>

              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
