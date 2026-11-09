import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YTÜDAK 2026–2027 Eğitim Takvimi",
  description:
    "YTÜDAK Başlangıç Grubu 2026–2027 eğitim programı: teorik dersler, pratik faaliyetler ve kamplar",
  icons: {
    icon: "/favicon.png",
  },
};

const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="h-full">
      <head>
        {UMAMI_WEBSITE_ID && (
          <script
            defer
            src="/stats/script.js"
            data-website-id={UMAMI_WEBSITE_ID}
            data-host-url="/stats"
          />
        )}
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
