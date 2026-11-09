import { events } from "@/data/events";
import { buildIcs, canExport } from "@/lib/calendarExport";

// Only the files listed below exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return events.filter(canExport).map((e) => ({ file: `${e.id}.ics` }));
}

export async function GET(_req: Request, ctx: RouteContext<"/ics/[file]">) {
  const { file } = await ctx.params;
  const event = events.find((e) => `${e.id}.ics` === file);
  if (!event || !canExport(event)) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(buildIcs(event), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      // inline: iOS Safari shows the "Add to Calendar" sheet instead of a download
      "Content-Disposition": `inline; filename="ytudak-${event.id}.ics"`,
    },
  });
}
