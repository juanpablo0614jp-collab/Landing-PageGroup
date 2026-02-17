"use client";

import { SectionTag, Reveal, Check, Badge, Btn } from "./ui";

const opt1Features = [
  "Portal web para proveedores",
  "Login con usuario y contraseña",
  "Carga de documentos en línea",
  "Requisitos configurables",
  "Registro de vigencias",
  "Estados básicos del proveedor",
  "Alertas por vencimiento y faltantes",
  "Invitación automática por correo",
];

const opt1Limits = [
  "Personalización avanzada e integraciones futuras limitadas",
  "No incluye validación por contenido (OCR)",
];

const opt2Extra = [
  "Todo lo de Implementación rápida",
  "OCR: validación automática por contenido",
  "Detección de documentos incorrectos",
  "Alertas por cambios de requisitos",
  "Trazabilidad detallada de cambios",
  "Reglas dinámicas según políticas internas",
  "Dominio propio de la empresa",
  "Potencial de integraciones con otros sistemas",
];

export default function Opciones() {
  return (
    <section id="opciones" className="py-24 px-6 bg-white">
      <div className="max-w-[1000px] mx-auto">
        <Reveal>
          <SectionTag>Opciones de implementación</SectionTag>
          <h2 className="text-[clamp(26px,3.5vw,38px)] font-extrabold text-navy mb-3 tracking-tight">
            Dos caminos, un mismo objetivo
          </h2>
          <p className="text-base text-gray-500 max-w-[600px] leading-relaxed mb-12">
            Elige según tu urgencia y la proyección de crecimiento.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <Reveal>
            <div className="border border-gray-100 rounded-2xl p-8 bg-white h-full flex flex-col">
              <Badge variant="navy">Opción 1</Badge>
              <h3 className="text-2xl font-extrabold text-navy mt-4 mb-2">
                Implementación rápida
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Ideal para poner en marcha el control documental en pocas
                semanas con una estructura clara y estable.
              </p>
              <div className="flex items-center gap-2 mb-6 p-3 bg-gray-50 rounded-xl">
                <span className="text-xs font-semibold text-gray-500">
                  Tiempo estimado:
                </span>
                <span className="text-sm font-extrabold text-navy">~1 mes</span>
              </div>
              <p className="text-xs font-bold text-navy mb-3">Incluye:</p>
              <div className="flex flex-col gap-2 mb-6 flex-1">
                {opt1Features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <Check />
                    <span className="text-sm text-gray-700">{f}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs font-bold text-gray-400 mb-2.5">
                Limitaciones:
              </p>
              <div className="flex flex-col gap-1.5 mb-7">
                {opt1Limits.map((l) => (
                  <div key={l} className="flex items-center gap-2.5">
                    <Check ok={false} />
                    <span className="text-xs text-gray-400">{l}</span>
                  </div>
                ))}
              </div>
              <div className="text-3xl font-extrabold text-navy mb-1">
                USD 2.750
              </div>
              <span className="text-sm text-gray-400 mb-5">pago único</span>
              <Btn variant="dark" href="#comparativa" className="justify-center w-full">
                Ver comparativa completa ↓
              </Btn>
            </div>
          </Reveal>

          {/* Card 2 */}
          <Reveal delay={0.1}>
            <div className="border-2 border-accent rounded-2xl p-8 bg-white relative h-full flex flex-col">
              <div className="absolute -top-3.5 right-6 bg-accent text-navy text-[11px] font-extrabold px-3.5 py-1 rounded-lg tracking-wide">
                RECOMENDADO
              </div>
              <Badge>Opción 2</Badge>
              <h3 className="text-2xl font-extrabold text-navy mt-4 mb-2">
                Sistema completo (escalable)
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Diseñado para crecer con la empresa: automatización avanzada,
                reglas dinámicas y mayor trazabilidad.
              </p>
              <div className="flex items-center gap-2 mb-6 p-3 bg-accent-pale rounded-xl">
                <span className="text-xs font-semibold text-gray-500">
                  Tiempo estimado:
                </span>
                <span className="text-sm font-extrabold text-accent-dark">
                  ~3 meses
                </span>
              </div>
              <p className="text-xs font-bold text-navy mb-3">Incluye:</p>
              <div className="flex flex-col gap-2 mb-7 flex-1">
                {opt2Extra.map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <Check />
                    <span className="text-sm text-gray-700">{f}</span>
                  </div>
                ))}
              </div>
              <div className="text-3xl font-extrabold text-navy mb-1">
                USD 5.000
              </div>
              <span className="text-sm text-gray-400 mb-5">pago único</span>
              <Btn
                variant="primary"
                href="contacto@jpdigitalsolutionscol.com"
                className="justify-center w-full"
              >
                Elegir esta opción →
              </Btn>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
