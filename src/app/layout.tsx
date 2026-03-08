import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SaasMakerAnalytics } from "@/components/SaasMakerAnalytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LinkChat — Your links, your story, your AI",
  description: "Create a beautiful personal page with all your links and let visitors chat with an AI that knows everything about you.",
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
        <SaasMakerAnalytics />
        {children}
      </body>
    </html>
  );
}
