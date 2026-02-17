"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Zap, Settings, ScanSearch, UserCircle } from "lucide-react";
import { Logo, Btn } from "./ui";

const NAV_LINKS = [
  { label: "Problema", href: "#problema" },
  { label: "Flujo", href: "#flujo" },
  { label: "Opciones", href: "#opciones" },
  { label: "Comparativa", href: "#comparativa" },
  { label: "Seguridad", href: "#seguridad" },
  { label: "Costos", href: "#costos" },
  { label: "FAQ", href: "#faq" },
];

const DEMO_LINKS = [
  { label: "Demo Rápido", href: "/demo-rapido", icon: Zap },
  { label: "Demo Completo", href: "/demo-completo", icon: Settings },
  { label: "Demo OCR", href: "/demo-ocr", icon: ScanSearch },
  { label: "Portal", href: "/portal-proveedor", icon: UserCircle },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const ids = NAV_LINKS.map((l) => l.href.slice(1));
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i]);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActive(ids[i]);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* ─── Top bar ─── */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 px-6 ${
          scrolled
            ? "bg-white/90 backdrop-blur-lg border-b border-gray-100"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1140px] mx-auto flex items-center justify-between h-16">
          <Logo />

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`text-[13px] font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  active === l.href.slice(1)
                    ? "text-accent bg-accent/10"
                    : "text-gray-500 hover:text-navy"
                }`}
              >
                {l.label}
              </a>
            ))}

            {/* Demo links separator + links */}
            <span className="w-px h-5 bg-gray-200 mx-2" />
            {DEMO_LINKS.map((l) => {
              const Icon = l.icon;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-[13px] font-semibold px-3 py-1.5 rounded-lg transition-colors text-accent hover:text-accent-dark hover:bg-accent/10 no-underline flex items-center gap-1"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {l.label}
                </Link>
              );
            })}

            <Btn
              variant="primary"
              href="mailto:contacto@jpdigitalsolutionscol.com"
              className="ml-4 !py-2.5 !px-5 !text-[13px]"
            >
              Agendar reunión
            </Btn>
          </div>

          {/* Mobile burger */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menú"
          >
            {mobileOpen ? (
              <X className="w-6 h-6 text-navy" />
            ) : (
              <Menu className="w-6 h-6 text-navy" />
            )}
          </button>
        </div>
      </nav>

      {/* ─── Mobile drawer ─── */}
      {mobileOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-white/95 backdrop-blur-xl p-6 flex flex-col gap-2 lg:hidden overflow-y-auto">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="text-base font-semibold text-navy py-3 border-b border-gray-100"
            >
              {l.label}
            </a>
          ))}

          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-4 mb-1">
            Demos interactivas
          </p>
          {DEMO_LINKS.map((l) => {
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-base font-semibold text-accent py-3 border-b border-gray-100 no-underline"
              >
                <Icon className="w-4 h-4" />
                {l.label}
              </Link>
            );
          })}

          <Btn
            variant="primary"
            href="contacto@jpdigitalsolutionscol.com"
            className="mt-4 justify-center"
          >
            Agendar reunión
          </Btn>
        </div>
      )}

      {/* ─── Sticky mobile CTA ─── */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-100 p-3 flex gap-2 lg:hidden">
        <Btn
          variant="primary"
          href="contacto@jpdigitalsolutionscol.com"
          className="flex-1 justify-center !py-3 !text-sm"
        >
          Agendar reunión
        </Btn>
        <Btn
          variant="outline"
          href="#opciones"
          className="flex-1 justify-center !py-3 !text-sm"
        >
          Ver opciones
        </Btn>
      </div>
    </>
  );
}
