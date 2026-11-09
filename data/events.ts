import type { Campus, EventType, YtudakEvent } from "@/types";

const CAMPUS_LOCATION: Record<Campus, string> = {
  Yıldız: "Yıldız Kampüsü, Beşiktaş",
  Davutpaşa: "Davutpaşa Kampüsü, Esenler",
};

function slug(s: string): string {
  return s
    .toLocaleLowerCase("tr")
    .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i")
    .replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Converts "20.10.2026" to "2026-10-20". */
function d(tr: string): string {
  const [day, month, year] = tr.split(".");
  return `${year}-${month}-${day}`;
}

/**
 * A theory lesson: Tuesday at Yıldız, optionally repeated on Wednesday at
 * Davutpaşa. Each session is a separate single-day event.
 */
function theory(
  name: string,
  tuesday: string,
  wednesday?: string,
  type: EventType = "Teorik",
  times?: { Yıldız?: string; Davutpaşa?: string },
): YtudakEvent[] {
  const group = slug(name);
  const sessions: [Campus, string][] = [["Yıldız", tuesday]];
  if (wednesday) sessions.push(["Davutpaşa", wednesday]);
  return sessions.map(([campus, date]) => ({
    id: `${group}-${slug(campus)}`,
    name,
    type,
    campus,
    location: CAMPUS_LOCATION[campus],
    startDate: d(date),
    endDate: d(date),
    approxDate: null,
    time: times?.[campus],
    sessionGroup: wednesday ? group : undefined,
  }));
}

/** A field activity. A date range means an overnight camp. */
function practical(
  name: string,
  location: string,
  start: string,
  end?: string,
): YtudakEvent {
  return {
    id: slug(name),
    name,
    type: end ? "Konaklamalı Pratik" : "Pratik",
    campus: null,
    location,
    startDate: d(start),
    endDate: d(end ?? start),
    approxDate: null,
  };
}

/** An event whose date is only known approximately. */
function approx(
  name: string,
  type: EventType,
  approxDate: string,
  location: string | null = null,
  id = slug(name),
): YtudakEvent {
  return {
    id,
    name,
    type,
    campus: null,
    location,
    startDate: null,
    endDate: null,
    approxDate,
  };
}

function exam(name: string, date: string): YtudakEvent {
  return {
    id: slug(name),
    name,
    type: "Sınav",
    campus: null,
    location: null,
    startDate: d(date),
    endDate: d(date),
    approxDate: null,
  };
}

export const events: YtudakEvent[] = [
  // ── EKİM 2026 ─────────────────────────────────────────────────
  ...theory("Tanışma Toplantısı", "13.10.2026", "14.10.2026", "Sohbet", {
    Yıldız: "19.30",
    Davutpaşa: "17.30",
  }),
  ...theory("Yürüyüş ve Kampçılık", "20.10.2026", "21.10.2026"),
  ...theory("Temel Kampçılık ve Dağcılık Malzemeleri 1", "27.10.2026"),

  // ── KASIM 2026 ────────────────────────────────────────────────
  ...theory("Temel Kampçılık ve Dağcılık Malzemeleri 2", "03.11.2026", "04.11.2026"),
  practical("Günübirlik Yürüyüş", "Ballıkayalar, Gebze", "07.11.2026"),
  ...theory("Temel Kampçılık ve Dağcılık Malzemeleri 3", "10.11.2026", "11.11.2026"),
  ...theory("Dağcılıkta Beslenme ve Enerji", "24.11.2026", "25.11.2026"),
  practical("Temel Kampçılık Eğitimi 1", "Yuvacık, Kocaeli", "28.11.2026", "29.11.2026"),

  // ── ARALIK 2026 ───────────────────────────────────────────────
  ...theory("Dağcılıkta Antrenman", "01.12.2026", "02.12.2026"),
  ...theory("Kış Teknik Malzemeleri 1", "08.12.2026", "09.12.2026"),
  practical("Temel Kampçılık Eğitimi 2", "Çınarcık, Yalova", "12.12.2026", "13.12.2026"),
  ...theory("Kış Teknik Malzemeleri 2", "15.12.2026", "16.12.2026"),
  ...theory("Çığ Bilgisi", "22.12.2026", "23.12.2026"),
  exam("Yıl İçi Değerlendirme Sınavı", "24.12.2026"),

  // ── OCAK 2027 ─────────────────────────────────────────────────
  practical("Kış Temel Eğitim Kampı 1", "Aladağlar, Niğde", "28.01.2027", "31.01.2027"),

  // ── ŞUBAT 2027 ────────────────────────────────────────────────
  approx("Dağ Kazaları", "Sunum", "Şubat 2027"),
  ...theory("Navigasyon ve Meteoroloji", "02.02.2027", "03.02.2027"),
  ...theory("Dağ Ortamı ve Dağ Psikolojisi", "09.02.2027", "10.02.2027"),
  practical("Kış Temel Eğitim Kampı 2", "Köroğlu, Bolu", "13.02.2027", "14.02.2027"),
  ...theory("Kaya Tırmanışına Giriş", "16.02.2027", "17.02.2027"),
  ...theory("Kaya Tırmanış Malzemeleri 1", "23.02.2027", "24.02.2027"),
  practical("Kış Temel Eğitim Kampı 3", "Uludağ, Bursa", "27.02.2027", "28.02.2027"),

  // ── MART 2027 ─────────────────────────────────────────────────
  ...theory("Kaya Tırmanış Malzemeleri 2", "02.03.2027", "03.03.2027"),
  ...theory("Tırmanış Stilleri", "16.03.2027", "17.03.2027"),
  practical("İp İnişi Eğitimi", "Yıldız Kampüsü", "20.03.2027"),
  ...theory("Üstten Emniyetli ve Lider Tırmanış", "30.03.2027", "31.03.2027"),

  // ── NİSAN 2027 ────────────────────────────────────────────────
  practical("Günübirlik Kaya Tırmanış Faaliyeti", "Ballıkayalar, Gebze", "03.04.2027"),
  ...theory("Doğada İlk Yardım", "06.04.2027", "07.04.2027"),
  practical("Kaya Tırmanış Kampı 1", "Geyve, Sakarya", "10.04.2027", "11.04.2027"),
  ...theory("Kaya Tırmanışında Antrenman", "13.04.2027", "14.04.2027"),
  practical("İstasyondan Malzeme Toplama", "Yıldız Kampüsü", "17.04.2027"),
  ...theory("Geleneksel Tırmanış 1", "20.04.2027", "21.04.2027"),
  practical("Kaya Tırmanış Kampı 2", "Karakayalar, Eskişehir", "24.04.2027", "25.04.2027"),
  ...theory("Geleneksel Tırmanış 2", "27.04.2027", "28.04.2027"),
  exam("Kaya Tırmanışı Yazılı Sınav", "29.04.2027"),

  // ── MAYIS 2027 ────────────────────────────────────────────────
  practical("Doğada İlk Yardım Uygulama", "Yıldız Kampüsü", "02.05.2027"),
  practical("Kaya Tırmanış Kampı 3", "Gölpazarı, Bilecik", "15.05.2027", "16.05.2027"),

  // ── YAZ 2027 (tarihleri kesinleşmemiş) ────────────────────────
  approx(
    "Trans-Aladağlar ve Yedigöller Zirveler",
    "Konaklamalı Pratik",
    "Temmuz Başı 2027",
    "Aladağlar, Niğde",
  ),
  approx(
    "Dipsiz Göl Temel Buz Eğitim Faaliyeti",
    "Konaklamalı Pratik",
    "Ağustos Sonu 2027",
    "Aladağlar, Niğde",
  ),
  approx("Sene Sonu Değerlendirme Sınavı (Yazılı)", "Sınav", "Eylül Sonu 2027", null, "sene-sonu-yazili"),
  approx("Sene Sonu Değerlendirme Sınavı (Pratik)", "Sınav", "Eylül Sonu 2027", null, "sene-sonu-pratik"),
];

/** All sessions belonging to the same lesson, sorted by date. */
export function getSessions(event: YtudakEvent): YtudakEvent[] {
  if (!event.sessionGroup) return [event];
  return events
    .filter((e) => e.sessionGroup === event.sessionGroup)
    .sort((a, b) => (a.startDate ?? "").localeCompare(b.startDate ?? ""));
}
