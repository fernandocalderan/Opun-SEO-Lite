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
  title: "Opun Intelligence Suite",
  description:
    "Dashboard para gestionar reputacion, auditorias SEO y acciones coordinadas.",
};

function Sidebar() {
  const navItems = [
    { label: "Overview", href: "/" },
    { label: "Reputation", href: "/reputation" },
    { label: "Audits", href: "/audits" },
    { label: "Plan", href: "/plan" },
    { label: "Reports", href: "/reports" },
  ];

  return (
    <aside className="flex min-h-screen w-64 flex-col gap-6 border-r border-slate-200 bg-white px-6 py-8">
      <div className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-widest text-indigo-500">
          Opun Intelligence Suite
        </span>
        <h1 className="text-xl font-semibold text-slate-900">Control Center</h1>
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
          >
            {item.label}
          </a>
        ))}
      </nav>
      <div className="mt-auto rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-xs text-slate-500">
        <p className="font-semibold text-slate-700">Reputacion en tiempo real</p>
        <p className="mt-2">
          Conecta tus cuentas de social listening y SERP monitoring para activar alertas en vivo.
        </p>
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-medium text-emerald-600">
          LIVE
        </span>
        <span>Ultima sincronizacion: hace 3 minutos</span>
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <button className="rounded-full border border-slate-200 px-3 py-1 transition hover:bg-slate-100">
          Invitar equipo
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-white">
          OP
        </div>
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-slate-50 text-zinc-900 antialiased`}
      >
        <div className="grid min-h-screen grid-cols-[auto_1fr] bg-slate-50">
          <Sidebar />
          <div className="flex flex-col">
            <TopBar />
            <main className="flex-1 bg-slate-50">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
