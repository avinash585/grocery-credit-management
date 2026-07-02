import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GramMart AI",
  description: "Voice-first grocery credit management for rural kirana stores",
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  themeColor: "#138a4b",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

