/** YTÜ Yıldız Kampüsü pin, from https://maps.app.goo.gl/oM88tkgwj8h8jUWn6 */
const YILDIZ_KAMPUSU = "41.0520861,29.0106553";

/**
 * Precise Google Maps destinations (coordinates or search terms) for
 * locations whose display text is ambiguous. Anything not listed is
 * searched by its display text.
 */
const MAPS_QUERY: Record<string, string> = {
  "Yıldız Kampüsü, Beşiktaş": YILDIZ_KAMPUSU,
  "Yıldız Kampüsü": YILDIZ_KAMPUSU,
  "Davutpaşa Kampüsü, Esenler": "Yıldız Teknik Üniversitesi Davutpaşa Kampüsü",
  "Ballıkayalar, Gebze": "Ballıkayalar Tabiat Parkı, Gebze",
};

/** Google Maps directions to a location (opens the Maps app on phones). */
export function directionsUrl(location: string): string {
  const params = new URLSearchParams({
    api: "1",
    destination: MAPS_QUERY[location] ?? location,
  });
  return `https://www.google.com/maps/dir/?${params}`;
}
