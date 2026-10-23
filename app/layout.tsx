import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Portfolio Arvin Sokarijo",
  description: "Portfolio met werk, skills en een filter. De data komt van de Next.js-server.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl" className={`${display.variable} ${sans.variable}`}>
      <body>
        <a className="skip" href="#inhoud">
          Naar inhoud
        </a>
        {children}
      </body>
    </html>
  );
}
