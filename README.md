# YTÜDAK 2026–2027 Eğitim Takvimi

An interactive calendar for the **YTÜDAK Başlangıç Grubu** (beginner group) 2026–2027 training program: theory lessons, day trips, overnight camps and exams.

## How the program is modeled

- **Teorik** lessons are given twice a week: Tuesday at **Yıldız Kampüsü (Beşiktaş)** and Wednesday at **Davutpaşa Kampüsü**. Each session is its own single-day event, and the two are linked by `sessionGroup`, so the modal lists both.
- **Pratik** activities with one date are day trips.
- **Konaklamalı Pratik** activities (marked `*` on the poster) span several days and are overnight camps.
- Events with only an approximate date (e.g. "Şubat 2027", "Eylül Sonu") are listed in the "Tarihi Kesinleşmemiş Faaliyetler" section.

All events live in `data/events.ts`, built with the `theory()`, `practical()`, `exam()` and `approx()` helpers.

## Features

- Monthly calendar, navigable from Ekim 2026 to Eylül 2027
- Filter by type (Teorik / Pratik / Sınav) and by campus (Yıldız / Davutpaşa)
- Search by event name or location
- Event modal with date, time, location and all campus sessions
- Umami analytics, proxied through Next.js rewrites

## Tech Stack

Next.js 16 (App Router, standalone output), React 19, Tailwind CSS v4, Three.js, TypeScript.

## Getting Started

```bash
npm install
npm run dev
```

## Environment

| Variable | When | Purpose |
| --- | --- | --- |
| `UMAMI_HOST` | build | Umami server URL used by the `/stats/*` rewrites |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | build | Umami website ID. If unset, no tracking script is rendered. |

## Docker

```bash
docker build \
  --build-arg UMAMI_HOST=https://umami.example.com \
  --build-arg NEXT_PUBLIC_UMAMI_WEBSITE_ID=<id> \
  -t ytudak-calendar .
docker run -p 5050:5050 ytudak-calendar
```
