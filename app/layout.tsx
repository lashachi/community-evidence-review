import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Community Evidence Review",
  description: "A calm, evidence-led workspace for examining one public community.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}