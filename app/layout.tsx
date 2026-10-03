import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notion Widgets",
  description: "Build custom widgets and embed them in Notion.",
};

// Deliberately minimal: the builder chrome (nav, etc.) lives in
// app/(builder)/layout.tsx so that the public /w/[id] embed pages stay
// completely bare - no nav, no extra markup, nothing that would show up
// inside a Notion embed block.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
        {children}
      </body>
    </html>
  );
}
