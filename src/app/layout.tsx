import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
    "Distribute your music to 220+ platforms worldwide. Keep 100% of your royalties. Fast, automated payouts. Real-time analytics. No hidden fees. The distribution platform built for artists, not corporations.",
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
      <head>
        <Script id="intro-seen-check" strategy="beforeInteractive">
          {`try{if(localStorage.getItem('subelo-intro-seen')==='1'){document.documentElement.setAttribute('data-intro-seen','1')}}catch(e){}`}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
