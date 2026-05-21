import "./globals.css";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AnalyticsProvider } from "@/components/posthog-provider";
import { PageAnalyticsTracker } from "@/components/public/page-analytics-tracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://linkchat.sarthakagrawal927.workers.dev";
const SITE_DESCRIPTION =
  "Replace Linktree with a personal website and an AI version of you. Then give visitors shareable ways to experience your profile: Encyclopedia, Newspaper, and Roast Me.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "LinkChat — Your links, your story, your AI",
    template: "%s — LinkChat",
  },
  description: SITE_DESCRIPTION,
  applicationName: "LinkChat",
  keywords: [
    "link in bio",
    "personal website",
    "AI profile",
    "Linktree alternative",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "LinkChat",
    title: "LinkChat — Your links, your story, your AI",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "LinkChat — Your links, your story, your AI",
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950 text-white`}
      >
        <AnalyticsProvider>
          <PageAnalyticsTracker />
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}
