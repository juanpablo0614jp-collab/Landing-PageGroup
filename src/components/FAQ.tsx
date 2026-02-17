"use client";

import { useState } from "react";
import { SectionTag, Reveal } from "./ui";
import { Plus } from "lucide-react";

const faqs = [
  {
    q: "¿El sistema queda siendo de la empresa?",
    a: "Sí. En ambas opciones, el código y los datos son propiedad de la empresa. No hay dependencia de JP Digital Solutions para seguir operando.",
  },
  {
    q: "¿Hay mensualidad obligatoria?",
    a: "No. El sistema se entrega con un pago único. El acompañamiento mensual es un servicio opcional para soporte, ajustes y mejoras continuas.",
  },
  {
    q: "¿Dónde se alojan los documentos?",
    a: "Los documentos se almacenan en el servidor o nube que la empresa elija (AWS, Google Cloud, Azure u otro). JP Digital Solutions asesora en la elección según sus necesidades.",
  },
  {
    q: "¿Qué tipo de alertas incluye?",
    a: "Alertas por documentos próximos a vencer, documentos vencidos, documentos faltantes y, en el sistema completo, alertas por cambios de requisitos o formatos.",
  },
  {
    q: "¿El OCR reemplaza la revisión humana?",
    a: "No. El OCR asiste identificando si un documento corresponde al tipo solicitado y extrayendo datos clave, pero la aprobación final siempre puede ser humana.",
  },
  {
    q: "¿Se puede crecer o integrar con otros sistemas?",
    a: "Sí, especialmente con el sistema completo. Su arquitectura escalable permite integraciones con ERP, sistemas contables o portales internos en el futuro.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between py-5 gap-4 text-left bg-transparent border-none cursor-pointer"
      >
        <span className="text-base font-semibold text-navy">{q}</span>
        <Plus
          className={`w-5 h-5 text-accent flex-shrink-0 transition-transform duration-200 ${
            open ? "rotate-45" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-60" : "max-h-0"
        }`}
      >
        <p className="text-sm text-gray-500 leading-relaxed pb-5">{a}</p>
      </div>
    </div>
  );
}

export default function FAQ() {
  return (
    <section id="faq" className="py-24 px-6 bg-white">
      <div className="max-w-[720px] mx-auto">
        <Reveal>
          <SectionTag>Preguntas frecuentes</SectionTag>
          <h2 className="text-[clamp(26px,3.5vw,38px)] font-extrabold text-navy mb-10 tracking-tight">
            Resolvemos tus dudas
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div>
            {faqs.map((f, i) => (
              <FAQItem key={i} {...f} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
