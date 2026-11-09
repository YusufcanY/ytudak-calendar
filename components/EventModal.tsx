"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { YtudakEvent } from "@/types";
import { getEventColors } from "@/lib/eventColors";
import { useSheetDrag } from "@/lib/useSheetDrag";
import { formatDateRange } from "@/lib/eventFormat";
import { getSessions } from "@/data/events";
import { canExport } from "@/lib/calendarExport";
import { AddToCalendar, AddSessionToCalendar } from "./AddToCalendar";
import { DirectionsButton } from "./DirectionsButton";

interface EventModalProps {
  event: YtudakEvent;
  onClose: () => void;
}

// Matches the longest exit animation in globals.css (.modal-backdrop-out).
const EXIT_MS = 200;

export function EventModal({ event, onClose }: EventModalProps) {
  const colors = getEventColors(event.type);
  const sessions = getSessions(event);

  // "animated": play the exit animation. "dragged": the sheet was already
  // swiped off-screen by useSheetDrag, so only the backdrop fades out.
  const [closing, setClosing] = useState<null | "animated" | "dragged">(null);
  const close = useCallback(() => setClosing((c) => c ?? "animated"), []);
  const sheetRef = useSheetDrag<HTMLDivElement>(
    useCallback(() => setClosing((c) => c ?? "dragged"), []),
  );

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!closing) return;
    const id = setTimeout(() => onCloseRef.current(), EXIT_MS);
    return () => clearTimeout(id);
  }, [closing]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [close]);

  const sheetAnimation =
    closing === "animated"
      ? "modal-sheet-out"
      : closing === "dragged"
        ? ""
        : "modal-sheet-in";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 ${
        closing ? "modal-backdrop-out pointer-events-none" : ""
      }`}
      style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
      onClick={close}
    >
      <div
        ref={sheetRef}
        className={`${sheetAnimation} relative max-w-md w-full max-h-[85vh] overflow-y-auto overscroll-contain rounded-t-2xl sm:rounded-xl shadow-2xl pb-[env(safe-area-inset-bottom)]`}
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Color accent bar */}
        <div className="h-1 w-full" style={{ background: colors.dot }} />
        {/* Grab handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <span
            className="w-10 h-1 rounded-full"
            style={{ background: "var(--border)" }}
          />
        </div>

        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className={`${colors.className} text-[10px] font-medium px-2 py-0.5 rounded-full font-mono`}
                >
                  {colors.label}
                </span>
                {event.type === "Konaklamalı Pratik" && (
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full font-mono"
                    style={{
                      color: "var(--accent)",
                      background: "var(--accent-dim)",
                      border: "1px solid var(--accent-glow)",
                    }}
                  >
                    ⛺ Konaklamalı
                  </span>
                )}
              </div>
              <h2
                className="font-display text-xl font-bold leading-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {event.name}
              </h2>
            </div>
            <button
              onClick={close}
              aria-label="Kapat"
              className="shrink-0 w-10 h-10 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
              style={{
                background: "var(--bg-cell)",
                color: "var(--text-muted)",
                border: "1px solid var(--border)",
              }}
            >
              ✕
            </button>
          </div>

          {/* Details */}
          <div
            className="rounded-lg overflow-hidden divide-y divide-[#f0ede6]"
            style={{
              background: "var(--bg-cell)",
              border: "1px solid var(--border-dim)",
              borderColor: "var(--border-dim)",
            }}
          >
            {sessions.length > 1 ? (
              <Row label="Oturumlar">
                <div className="flex flex-col gap-3">
                  {sessions.map((s, i) => (
                    <div
                      key={s.id}
                      className="flex flex-col"
                      style={
                        i > 0
                          ? { borderTop: "1px solid var(--border-dim)", paddingTop: "12px" }
                          : undefined
                      }
                    >
                      <span
                        className="text-sm"
                        style={{
                          color: "var(--text-primary)",
                          fontWeight: s.id === event.id ? 600 : 400,
                        }}
                      >
                        {formatDateRange(s)}
                        {s.time && ` · ${s.time}`}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {s.location}
                      </span>
                      {s.location && <DirectionsButton location={s.location} />}
                      <AddSessionToCalendar event={s} />
                    </div>
                  ))}
                </div>
              </Row>
            ) : (
              <>
                <Row label="Tarih">
                  <span
                    className="text-sm"
                    style={{
                      color: event.startDate
                        ? "var(--text-primary)"
                        : "var(--text-muted)",
                      fontStyle: event.startDate ? "normal" : "italic",
                    }}
                  >
                    {formatDateRange(event)}
                  </span>
                </Row>
                {event.time && (
                  <Row label="Saat">
                    <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                      {event.time}
                    </span>
                  </Row>
                )}
                {event.location && (
                  <Row label="Yer">
                    <div className="flex flex-col">
                      <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                        {event.location}
                      </span>
                      <DirectionsButton location={event.location} />
                    </div>
                  </Row>
                )}
              </>
            )}
          </div>

          {sessions.length === 1 && canExport(event) && (
            <AddToCalendar event={event} />
          )}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <span
        className="text-xs font-medium w-20 shrink-0 pt-0.5 font-display tracking-wide uppercase"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
