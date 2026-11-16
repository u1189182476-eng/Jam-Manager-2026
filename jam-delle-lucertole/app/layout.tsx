import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  title: `${siteConfig.eventName} — Scaletta & Prenotazioni`,
  description: siteConfig.description,
  applicationName: siteConfig.eventName,
  keywords: [
    "jam session",
    "scaletta live",
    "prenotazioni",
    siteConfig.eventName,
    siteConfig.city,
  ],
  openGraph: {
    title: `${siteConfig.eventName} — Scaletta & Prenotazioni`,
    description: siteConfig.description,
    type: "website",
  },
  icons: {
    icon: [
      {
        url:
          "data:image/svg+xml," +
          encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0a0b0e"/><text x="32" y="45" font-size="34" text-anchor="middle">🦎</text></svg>`,
          ),
        type: "image/svg+xml",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#07080a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it" className="dark">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
