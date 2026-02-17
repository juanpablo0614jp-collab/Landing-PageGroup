"use client";

import { SectionTag, Reveal } from "./ui";
import { Shield, Lock, ShieldCheck, Database, FileText } from "lucide-react";

const items = [
  { Icon: Shield, title: "Control por roles", desc: "Empresa y proveedor con permisos diferenciados" },
  { Icon: Lock, title: "Acceso restringido", desc: "Cada proveedor solo ve su propia información" },
  { Icon: ShieldCheck, title: "Cifrado en tránsito", desc: "Toda la comunicación viaja protegida (HTTPS)" },
  { Icon: Database, title: "Backups y recuperación", desc: "Copias de seguridad para proteger los datos" },
  { Icon: FileText, title: "Trazabilidad de cambios", desc: "Registro auditable de cada acción en el sistema" },
];

export default function Seguridad() {
  return (
    <section id="seguridad" className="py-24 px-6 bg-white">
      <div className="max-w-[960px] mx-auto">
        <Reveal>
          <SectionTag>Seguridad y control</SectionTag>
          <h2 className="text-[clamp(26px,3.5vw,38px)] font-extrabold text-navy mb-3 tracking-tight">
            Diseñado para entornos corporativos
          </h2>
          <p className="text-base text-gray-500 max-w-[600px] leading-relaxed mb-12">
            En entornos corporativos, la seguridad y la trazabilidad son parte
            central del diseño.
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(({ Icon, title, desc }, i) => (
            <Reveal key={i} delay={i * 0.07}>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-navy/5 text-navy flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-navy mb-1">{title}</p>
                <p className="text-sm text-gray-500 leading-snug">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
