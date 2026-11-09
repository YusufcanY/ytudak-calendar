"use client";

import type { ReactNode } from "react";
import type { YtudakEvent } from "@/types";
import { googleCalendarUrl, icsPath } from "@/lib/calendarExport";
import { AppleIcon, GoogleCalendarIcon } from "./CalendarIcons";

interface Provider {
  key: "google" | "ics";
  title: string;
  subtitle: string;
  icon: (size: number) => ReactNode;
  href: string;
  newTab: boolean;
}

function providers(event: YtudakEvent): Provider[] {
  return [
    {
      key: "google",
      title: "Google Takvim",
      subtitle: "Google hesabına ekle",
      icon: (size) => <GoogleCalendarIcon size={size} />,
      href: googleCalendarUrl(event),
      newTab: true,
    },
    {
      key: "ics",
      title: "iPhone / .ics",
      subtitle: "Apple Takvim ve Outlook",
      icon: (size) => <AppleIcon size={size} />,
      href: icsPath(event),
      newTab: false,
    },
  ];
}

function linkProps(p: Provider, event: YtudakEvent) {
  return {
    href: p.href,
    target: p.newTab ? "_blank" : undefined,
    rel: p.newTab ? "noopener noreferrer" : undefined,
    "data-umami-event": "add-to-calendar",
    "data-umami-event-provider": p.key,
    "data-umami-event-id": event.id,
  };
}

/** Full "Takvime Ekle" section for a single event. */
export function AddToCalendar({ event }: { event: YtudakEvent }) {
  return (
    <section className="mt-4">
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <h3
          className="font-display text-xs font-bold tracking-widest uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          Takvime Ekle
        </h3>
      </div>
      <p className="text-xs mb-2.5" style={{ color: "var(--text-muted)" }}>
        Bu faaliyeti kendi takvimine kaydet, hatırlatma al.
      </p>
      <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-2">
        {providers(event).map((p) => (
          <a
            key={p.key}
            {...linkProps(p, event)}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:-translate-y-px hover:shadow-md"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              textDecoration: "none",
            }}
          >
            <span
              className="w-9 h-9 shrink-0 rounded-md flex items-center justify-center"
              style={{ background: "var(--bg-cell)", border: "1px solid var(--border-dim)" }}
            >
              {p.icon(20)}
            </span>
            <span className="flex flex-col min-w-0">
              <span className="font-display font-bold text-sm leading-tight">
                {p.title}
              </span>
              <span
                className="text-[11px] leading-tight mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                {p.subtitle}
              </span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

/** Compact buttons under each campus session. */
export function AddSessionToCalendar({ event }: { event: YtudakEvent }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-2">
      <span
        className="w-full text-[10px] font-display font-bold tracking-widest uppercase"
        style={{ color: "var(--text-muted)" }}
      >
        Takvime ekle
      </span>
      {providers(event).map((p) => (
        <a
          key={p.key}
          {...linkProps(p, event)}
          title={`${p.title}: ${p.subtitle}`}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-display font-semibold tracking-wide transition-opacity hover:opacity-80"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            textDecoration: "none",
          }}
        >
          {p.icon(13)}
          {p.key === "google" ? "Google" : "iPhone / .ics"}
        </a>
      ))}
    </div>
  );
}
