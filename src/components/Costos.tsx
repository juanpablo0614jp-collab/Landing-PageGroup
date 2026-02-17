"use client";

import { SectionTag, Reveal } from "./ui";

export default function Costos() {
  return (
    <section id="costos" className="py-24 px-6 bg-gray-50">
      <div className="max-w-[900px] mx-auto">
        <Reveal>
          <SectionTag>Costos y modelo</SectionTag>
          <h2 className="text-[clamp(26px,3.5vw,38px)] font-extrabold text-navy mb-3 tracking-tight">
            Inversión clara, sin sorpresas
          </h2>
          <p className="text-base text-gray-500 max-w-[600px] leading-relaxed mb-12">
            Ambas opciones son propiedad de la empresa. No hay cobro mensual
            obligatorio por uso. El acompañamiento mensual es opcional.
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-3 gap-5 mb-8">
          <Reveal>
            <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Implementación rápida
              </p>
              <p className="text-4xl font-extrabold text-navy mt-3 mb-1">
                USD 2.750
              </p>
              <p className="text-sm text-gray-400">Pago único</p>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="bg-white border-2 border-accent rounded-2xl p-8 text-center">
              <p className="text-xs font-bold text-accent-dark uppercase tracking-wider">
                Sistema completo
              </p>
              <p className="text-4xl font-extrabold text-navy mt-3 mb-1">
                USD 5.000
              </p>
              <p className="text-sm text-gray-400">Pago único</p>
            </div>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Acompañamiento opcional
              </p>
              <p className="text-4xl font-extrabold text-navy mt-3 mb-1">
                USD 250
              </p>
              <p className="text-sm text-gray-400">por mes (no obligatorio)</p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.2}>
          <p className="text-xs text-gray-400 text-center leading-relaxed max-w-[520px] mx-auto">
            Nota: Hosting y dominio pueden tener costos externos según el
            proveedor de infraestructura elegido.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
