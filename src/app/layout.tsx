import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Subelo Music — Music Distribution, Reinvented",
  description:
    "Distribute your music to 150+ platforms worldwide. Keep 100% of your royalties. Faster payouts. Better analytics. No hidden fees. The distribution platform built for artists, not corporations.",
  keywords: [
    "music distribution",
    "independent artist",
    "streaming",
    "royalties",
    "Spotify",
    "Apple Music",
    "music marketing",
  ],
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "Subelo Music — Music Distribution, Reinvented",
    description: "Distribute your music everywhere. Keep 100% of royalties.",
    siteName: "Subelo Music",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
