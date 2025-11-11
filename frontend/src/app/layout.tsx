import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/lib/providers";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
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
  title: "Opun Intelligence Suite",
  description:
    "Dashboard para gestionar reputacion, auditorias SEO y acciones coordinadas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-surface-subtle font-sans text-text-body antialiased`}
      >
        <AppProviders>
          <div className="grid min-h-screen grid-cols-[auto_1fr] bg-surface-subtle">
            <Sidebar />
            <div className="min-w-0 flex flex-col">
              <TopBar />
              <main className="min-w-0 flex-1 bg-surface-subtle">{children}</main>
            </div>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
