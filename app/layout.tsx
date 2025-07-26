import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title:
    "Maze Pathfinder - Interactive A* Algorithm Visualization, interactive Next.js application that visualizes pathfinding through a maze using the A* algorithm. Features real-time solving animation, responsive design, and touch-friendly controls.",
  keywords: [
    "maze",
    "pathfinding",
    "A*",
    "algorithm",
    "visualization",
    "Next.js",
    "TypeScript",
  ],
  authors: [{ name: "Maze Pathfinder Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
