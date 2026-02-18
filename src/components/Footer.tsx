"use client";

import { Logo } from "./ui";

const links = [
  { label: "Problema", href: "#problema" },
  { label: "Flujo", href: "#flujo" },
  { label: "Opciones", href: "#opciones" },
  { label: "FAQ", href: "#faq" },
];

export default function Footer() {
  return (
    <footer className="bg-navy px-6 pt-12 pb-8">
      <div className="max-w-[960px] mx-auto flex flex-wrap justify-between gap-8 items-start">
        <div>
          <Logo light />
          <p className="text-xs text-white/45 mt-3 leading-relaxed">
            Soluciones digitales a medida
            <br />
            para procesos empresariales.
          </p>
        </div>
        <div className="flex gap-10 flex-wrap">
          <div>
            <p className="text-[11px] font-bold text-white/35 uppercase tracking-widest mb-3">
              Contacto
            </p>
            <p className="text-sm text-white/65 leading-loose">
              contacto@jpdigitalsolutionscol.com
              <br />
              +57  322 875 7972
              <br />
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold text-white/35 uppercase tracking-widest mb-3">
              Links
            </p>
            <div className="flex flex-col gap-1.5">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-sm text-white/65 no-underline hover:text-white transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-[960px] mx-auto mt-10 pt-5 border-t border-white/10 text-center">
        <p className="text-[11px] text-white/35 leading-relaxed">
          Propuesta informativa. Alcance final sujeto a levantamiento de
          requerimientos. © 2025 JP Digital Solutions.
        </p>
      </div>
    </footer>
  );
}
