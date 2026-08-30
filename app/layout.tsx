import type { Metadata, Viewport } from "next";
import { Pixelify_Sans, Press_Start_2P } from "next/font/google";
import { site } from "@/data/config";
import "./globals.css";

/* Self-hosted via next/font — zero layout shift, no external requests. */
const pixelify = Pixelify_Sans({
  variable: "--font-pixelify",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const pressStart = Press_Start_2P({
  variable: "--font-press-start",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  /* Set NEXT_PUBLIC_SITE_URL to the deployed domain for correct OG links. */
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: site.tabTitle,
  description: site.description,
  openGraph: {
    title: site.tabTitle,
    description: site.description,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: site.tabTitle,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#0e0f24",
  width: "device-width",
  initialScale: 1,
  /* The world is a fixed viewport; pinch-zoom stays enabled for a11y. */
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${pixelify.variable} ${pressStart.variable} antialiased`}>
        {children}
        {/* Privacy-friendly analytics slot — off unless the env var is set.
            e.g. NEXT_PUBLIC_ANALYTICS_SRC=https://plausible.io/js/script.js */}
        {process.env.NEXT_PUBLIC_ANALYTICS_SRC && (
          <script
            defer
            src={process.env.NEXT_PUBLIC_ANALYTICS_SRC}
            data-domain={process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN}
          />
        )}
      </body>
    </html>
  );
}
