import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Mulish, Raleway, Roboto } from "next/font/google";
import { ChatWidget } from "@/components/chat-widget";
import "./globals.css";

const display = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
});

const sans = Mulish({
  subsets: ["latin"],
  variable: "--font-mulish",
});

const ui = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl" className={`${display.variable} ${sans.variable} ${ui.variable}`}>
      <body className="bg-paper font-sans text-ink antialiased">
        <a
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-3 focus:py-2 focus:text-primary"
          href="#inhoud"
        >
          Naar inhoud
        </a>
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
