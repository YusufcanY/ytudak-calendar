import { directionsUrl } from "@/lib/maps";

export function DirectionsButton({ location }: { location: string }) {
  return (
    <a
      href={directionsUrl(location)}
      target="_blank"
      rel="noopener noreferrer"
      data-umami-event="directions-click"
      data-umami-event-location={location}
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 mt-1.5 text-[11px] font-display font-semibold tracking-wide transition-opacity hover:opacity-80 w-fit"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        color: "var(--text-primary)",
        textDecoration: "none",
      }}
    >
      <svg width="12" height="14" viewBox="0 0 12 16" aria-hidden>
        <path
          fill="#EA4335"
          d="M6 0C2.7 0 0 2.6 0 5.9 0 10.3 6 16 6 16s6-5.7 6-10.1C12 2.6 9.3 0 6 0z"
        />
        <circle cx="6" cy="5.9" r="2.2" fill="#fff" />
      </svg>
      Yol tarifi
    </a>
  );
}
