"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { YtudakEvent, TypeFilter, CampusFilter } from "@/types";
import { events as allEvents } from "@/data/events";
import { filterEvents, addMonths, clampToRange } from "@/lib/calendar";
import { Calendar } from "@/components/Calendar";
import { Segmented, Legend } from "@/components/Filters";
import { TbdEvents } from "@/components/TbdEvents";
import { EventModal } from "@/components/EventModal";
import { SearchInput } from "@/components/SearchInput";
import { TopographicBackground } from "@/components/TopographicBackground";
import { trackEvent } from "@/lib/analytics";

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "Teorik", label: "Teorik" },
  { value: "Pratik", label: "Pratik" },
  { value: "Sınav", label: "Sınav" },
];

const CAMPUS_OPTIONS: { value: CampusFilter; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "Yıldız", label: "Yıldız" },
  { value: "Davutpaşa", label: "Davutpaşa" },
];

const NOTES = [
  "Mevsimsel koşullar veya akademik takvime göre pratik faaliyetlerin tarihlerinde değişiklik yapılabilir.",
  "Teorik dersler Salı günü Yıldız Kampüsünde, Çarşamba günü Davutpaşa Kampüsünde yapılmaktadır. Derslere katılım durumuna göre derslerin gün ve saatlerinde değişiklik ya da iptaller yapılabilir.",
  "Teorik derslerde yeterli devamlılığı olmayan kişiler pratik faaliyetlere katılamazlar.",
];

function ProgramNotes() {
  return (
    <section
      className="mt-8 sm:mt-12 rounded-xl p-4 sm:p-5"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <h2
        className="font-display text-sm font-bold tracking-widest uppercase mb-3"
        style={{ color: "var(--text-muted)" }}
      >
        Notlar
      </h2>
      <ol
        className="list-decimal pl-5 flex flex-col gap-1.5 text-[13px]"
        style={{ color: "var(--text-primary)" }}
      >
        {NOTES.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ol>
    </section>
  );
}

/** Path of an event's shareable page, e.g. /e/tanisma-toplantisi-yildiz. */
export function eventPath(id: string): string {
  return `/e/${id}`;
}

function eventFromPath(pathname: string): YtudakEvent | null {
  const match = /^\/e\/([^/]+)\/?$/.exec(pathname);
  if (!match) return null;
  return allEvents.find((e) => e.id === match[1]) ?? null;
}

function monthOf(event: YtudakEvent | null): Date {
  if (!event?.startDate) return clampToRange(new Date());
  const [y, m] = event.startDate.split("-").map(Number);
  return new Date(y, m - 1, 1);
}

/**
 * The whole calendar page. The open event lives in the URL path (/e/<id>):
 * those paths are prerendered per event (app/e/[id]/page.tsx) so shared
 * links get their own preview, and in-app the path is swapped with the
 * History API, which Next keeps in sync with usePathname.
 */
export function CalendarApp() {
  const selectedEvent = eventFromPath(usePathname());
  const [currentDate, setCurrentDate] = useState(() => monthOf(selectedEvent));

  // Show the month of whichever event gets opened (click, link, back/forward).
  // Adjusting state during render instead of in an effect avoids a flash of
  // the old month.
  const [shownEvent, setShownEvent] = useState(selectedEvent);
  if (selectedEvent !== shownEvent) {
    setShownEvent(selectedEvent);
    if (selectedEvent?.startDate) setCurrentDate(monthOf(selectedEvent));
  }
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [campusFilter, setCampusFilter] = useState<CampusFilter>("all");
  // True when the open modal added its own history entry, so closing can
  // just go back. False when the page was opened directly from a shared link.
  const pushedEventRef = useRef(false);

  const handleSelectEvent = (event: YtudakEvent) => {
    trackEvent("event-modal-open", {
      id: event.id,
      name: event.name,
      type: event.type,
    });
    pushedEventRef.current = true;
    window.history.pushState(null, "", eventPath(event.id));
  };

  const closeEvent = useCallback(() => {
    if (pushedEventRef.current) {
      pushedEventRef.current = false;
      window.history.back();
    } else {
      window.history.replaceState(null, "", "/");
    }
  }, []);

  // Old shared links used /?event=<id>; move them to the new path.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("event");
    if (id && allEvents.some((e) => e.id === id)) {
      window.history.replaceState(null, "", eventPath(id));
    }
  }, []);

  const filters = (
    <div className="flex flex-wrap items-center gap-3">
      <Segmented
        label="Tür"
        options={TYPE_OPTIONS}
        active={typeFilter}
        onChange={setTypeFilter}
      />
      <Segmented
        label="Kampüs"
        options={CAMPUS_OPTIONS}
        active={campusFilter}
        onChange={setCampusFilter}
      />
    </div>
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const filteredEvents = useMemo(
    () => filterEvents(allEvents, typeFilter, campusFilter),
    [typeFilter, campusFilter],
  );

  const tbdEvents = useMemo(
    () => filteredEvents.filter((e) => !e.startDate),
    [filteredEvents],
  );

  const scheduledEvents = useMemo(
    () => filteredEvents.filter((e) => e.startDate !== null),
    [filteredEvents],
  );

  return (
    <div className="relative z-10 min-h-screen">
      <TopographicBackground />
      {/* Header */}
      <header
        className="sticky top-0 z-20 px-3 sm:px-6 py-3"
        style={{
          background: "rgba(245,243,239,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-display font-black text-base sm:text-lg shrink-0"
              style={{
                background: "var(--brand-navy)",
                color: "#ffffff",
                letterSpacing: "0.02em",
              }}
            >
              YTÜ
            </div>
            <div className="hidden sm:block">
              <h1
                className="font-display font-black tracking-wide leading-none"
                style={{ color: "var(--text-primary)", fontSize: "18px" }}
              >
                YTÜDAK 2026–2027 EĞİTİM TAKVİMİ
              </h1>
              <p
                className="font-mono text-[10px] tracking-widest"
                style={{ color: "var(--text-muted)" }}
              >
                BAŞLANGIÇ GRUBU EĞİTİM PROGRAMI
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 min-w-0 sm:flex-none sm:w-72 sm:ml-auto">
            <SearchInput events={allEvents} onSelect={handleSelectEvent} />
          </div>

          {/* Filters — desktop only */}
          <div className="hidden lg:block">{filters}</div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-3 py-4 sm:px-6 sm:py-8">
        {/* Filters — mobile only */}
        <div className="lg:hidden mb-4">{filters}</div>
        <Legend />
        <Calendar
          year={year}
          month={month}
          events={scheduledEvents}
          onEventClick={handleSelectEvent}
          onPrevMonth={() => setCurrentDate((d) => addMonths(d, -1))}
          onNextMonth={() => setCurrentDate((d) => addMonths(d, 1))}
          onToday={() => setCurrentDate(clampToRange(new Date()))}
        />

        {/* TBD Events */}
        <TbdEvents events={tbdEvents} onEventClick={handleSelectEvent} />

        <ProgramNotes />
      </main>

      {/* Event detail modal */}
      {selectedEvent && (
        <EventModal
          key={selectedEvent.id}
          event={selectedEvent}
          onClose={closeEvent}
        />
      )}

      {/* Footer */}
      <footer
        className="py-6 px-3 sm:px-6 text-center"
        style={{
          borderTop: "1px solid var(--border)",
          color: "var(--text-muted)",
          fontFamily: "var(--font-body)",
          fontSize: "12px",
        }}
      >
        <span>Made in 2026 with ♥ by </span>
        <a
          href="https://www.linkedin.com/in/yusufcan-yilmaz"
          target="_blank"
          rel="noopener noreferrer"
          data-umami-event="outbound-link-click"
          data-umami-event-url="https://www.linkedin.com/in/yusufcan-yilmaz"
          style={{
            color: "var(--accent)",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Yusufcan Yılmaz
        </a>
      </footer>
    </div>
  );
}
