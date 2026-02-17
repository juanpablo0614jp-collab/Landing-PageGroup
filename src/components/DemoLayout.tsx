"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Zap, Settings, ScanSearch, Bell, RotateCcw, Database, UserCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "./ui";
import { useDemoStore } from "@/context/DemoStore";

const DEMO_LINKS = [
  { label: "Rápido", href: "/demo-rapido", icon: Zap },
  { label: "Completo", href: "/demo-completo", icon: Settings },
  { label: "OCR", href: "/demo-ocr", icon: ScanSearch },
  { label: "Portal", href: "/portal-proveedor", icon: UserCircle },
];

interface DemoLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  currentPath: string;
}

export default function DemoLayout({ children, title, subtitle, currentPath }: DemoLayoutProps) {
  const { notifications, markNotificationRead, clearNotifications, providers, resetAll } = useDemoStore();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50/60">
      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100 px-4 md:px-6">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between h-14 md:h-16">
          <Link href="/" className="no-underline">
            <Logo />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {DEMO_LINKS.map((l) => {
              const Icon = l.icon;
              const isActive = currentPath === l.href;
              return (
                <Link key={l.href} href={l.href}
                  className={`text-[13px] font-semibold px-3 py-2 rounded-lg transition-all no-underline flex items-center gap-1.5 ${
                    isActive ? "text-white bg-navy shadow-sm" : "text-gray-500 hover:text-navy hover:bg-gray-50"
                  }`}>
                  <Icon className="w-3.5 h-3.5" />
                  {l.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg">
              <Database className="w-3 h-3" />
              {providers.length}
            </div>

            <div className="relative">
              <button onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <Bell className="w-4 h-4 text-gray-500" />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {showNotifs && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <span className="text-sm font-bold text-navy">Notificaciones</span>
                      {notifications.length > 0 && (
                        <button onClick={clearNotifications} className="text-[10px] font-semibold text-gray-400 hover:text-red-500">Limpiar</button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">Sin notificaciones</p>
                      ) : notifications.slice(0, 15).map((n) => {
                        const colors = { success: "bg-accent", warning: "bg-amber-400", error: "bg-red-500", info: "bg-blue-500" };
                        return (
                          <div key={n.id} onClick={() => markNotificationRead(n.id)}
                            className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 ${!n.read ? "bg-blue-50/30" : ""}`}>
                            <div className="flex items-start gap-2.5">
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${colors[n.type]}`} />
                              <div>
                                <p className={`text-xs ${!n.read ? "font-semibold text-navy" : "text-gray-600"}`}>{n.message}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{n.timestamp}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={() => setShowResetConfirm(true)} className="p-2 rounded-lg hover:bg-gray-50" title="Reiniciar datos">
              <RotateCcw className="w-4 h-4 text-gray-400" />
            </button>
            <Link href="/" className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 hover:text-navy no-underline ml-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Volver
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Mobile tabs ─── */}
      <div className="md:hidden flex gap-1 overflow-x-auto px-4 py-2 bg-white border-b border-gray-100 no-scrollbar">
        {DEMO_LINKS.map((l) => {
          const Icon = l.icon;
          const isActive = currentPath === l.href;
          return (
            <Link key={l.href} href={l.href}
              className={`flex-shrink-0 text-xs font-semibold px-3 py-2 rounded-lg no-underline flex items-center gap-1.5 ${
                isActive ? "text-white bg-navy" : "text-gray-500 bg-gray-50"
              }`}>
              <Icon className="w-3.5 h-3.5" /> {l.label}
            </Link>
          );
        })}
      </div>

      {/* ─── Hero ─── */}
      <header className="relative overflow-hidden bg-gradient-to-br from-navy to-navy-light px-6 py-12 md:py-14 text-center">
        <div className="absolute -top-20 -right-16 w-[300px] h-[300px] rounded-full bg-accent/5" />
        <div className="absolute -bottom-12 -left-16 w-[200px] h-[200px] rounded-full bg-accent/4" />
        <div className="relative max-w-[700px] mx-auto">
          <h1 className="text-[clamp(24px,4vw,36px)] font-extrabold text-white leading-tight tracking-tight mb-2">{title}</h1>
          <p className="text-sm md:text-base text-white/60 max-w-[500px] mx-auto">{subtitle}</p>
          <div className="flex items-center justify-center gap-6 mt-5">
            {[
              { n: providers.length, l: "Proveedores" },
              { n: providers.filter((p) => p.status === "activo").length, l: "Activos" },
              { n: providers.filter((p) => p.status === "bloqueado").length, l: "Bloqueados" },
            ].map(({ n, l }) => (
              <div key={l} className="text-center">
                <p className="text-lg md:text-xl font-extrabold text-accent">{n}</p>
                <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-10">{children}</main>

      <footer className="border-t border-gray-100 px-6 py-5 text-center">
        <p className="text-xs text-gray-400">
          Demo interactiva · Los datos se comparten entre las tres demos ·{" "}
          <Link href="/" className="text-accent no-underline hover:underline">Volver a la landing</Link>
        </p>
      </footer>

      {/* ─── Reset modal ─── */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowResetConfirm(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-base font-bold text-navy mb-2">¿Reiniciar todos los datos?</h3>
              <p className="text-sm text-gray-500 mb-5">Se restaurarán los datos iniciales de ejemplo en las tres demos.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50">Cancelar</button>
                <button onClick={() => { resetAll(); setShowResetConfirm(false); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600">Reiniciar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showNotifs && <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />}
    </div>
  );
}
