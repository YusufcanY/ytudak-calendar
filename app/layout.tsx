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

// `||` (not `??`): Docker sets unset build args to "", which must fall back too.
const UMAMI_WEBSITE_ID =
  process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID ||
  "9b69bd8e-6e69-4c77-a248-6f4880a776fe";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="h-full">
      <head>
        <script
          defer
          src="/stats/script.js"
          data-website-id={UMAMI_WEBSITE_ID}
          data-host-url="/stats"
        />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
