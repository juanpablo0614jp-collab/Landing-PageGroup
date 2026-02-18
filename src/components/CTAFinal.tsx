"use client";

import { Reveal, Btn } from "./ui";

export default function CTAFinal() {
  return (
    <section className="relative py-24 px-6 bg-gradient-to-br from-navy to-navy-light text-center overflow-hidden">
      <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-accent/5" />
      <div className="max-w-[600px] mx-auto relative">
        <Reveal>
          <h2 className="text-[clamp(24px,3.5vw,36px)] font-extrabold text-white mb-4 leading-tight">
            ¿Quieres ver el flujo aplicado a tus documentos?
          </h2>
          <p className="text-base text-white/70 leading-relaxed mb-9">
            Definimos los documentos obligatorios, configuramos alertas y
            dejamos el proceso funcionando con trazabilidad.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Btn variant="primary" href="mailto:contacto@jpdigitalsolutionscol.com">
              Agendar reunión →
            </Btn>
            <Btn
              variant="outline"
              href="/brochure-pagegroup.pdf"
              className="!text-white !ring-white/30"
            >
              Descargar brochure
            </Btn>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
