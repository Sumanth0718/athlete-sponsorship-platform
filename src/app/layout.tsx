import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "ApexSponsor | Athlete Sponsorship & Deal Platform",
  description: "Manage, track, and optimize professional athlete sponsorships, contracts, and brand deals in one sleek, full-stack platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark">
      <body className="min-h-full font-sans antialiased bg-background text-foreground">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

