import type { Metadata, Viewport } from "next";
import { Titillium_Web, Inter } from "next/font/google";
import "./global.css";

const titillium = Titillium_Web({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "900"],
  variable: "--font-titillium",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "F1GPT — Formula 1 Pit Wall & AI Intelligence",
  description:
    "Ask F1GPT anything about Formula One: driver telemetry, championship standings, aerodynamics, technical regulations, and Grand Prix race strategy.",
  keywords: ["Formula 1", "F1", "F1GPT", "Grand Prix", "Motorsport AI", "F1 Telemetry"],
};

export const viewport: Viewport = {
  themeColor: "#0a0b0e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${titillium.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
