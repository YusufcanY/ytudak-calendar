import type { Metadata } from "next";
import { events } from "@/data/events";
import { formatDateRange } from "@/lib/eventFormat";
import { CalendarApp } from "@/components/CalendarApp";

// One static page per event; any other id is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return events.map((e) => ({ id: e.id }));
}

export async function generateMetadata(
  props: PageProps<"/e/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  const event = events.find((e) => e.id === id);
  if (!event) return {};

  const title = `${event.name} · YTÜDAK Eğitim Takvimi`;
  const description = [
    formatDateRange(event),
    event.time,
    event.location,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    title,
    description,
    openGraph: {
      title: event.name,
      description,
      type: "website",
      locale: "tr_TR",
      siteName: "YTÜDAK Eğitim Takvimi",
    },
  };
}

// The calendar reads the event from the URL path itself.
export default function EventPage() {
  return <CalendarApp />;
}
