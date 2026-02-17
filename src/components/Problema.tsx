"use client";

import { SectionTag, Reveal } from "./ui";
import {
  Mail,
  RefreshCw,
  Clock,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";

const problems = [
  { Icon: Mail, text: "Documentos dispersos entre correo y WhatsApp" },
  { Icon: RefreshCw, text: "Reprocesos por información incompleta" },
  { Icon: Clock, text: "Vencimientos sin alertas oportunas" },
  { Icon: ClipboardList, text: "Seguimiento manual que consume tiempo" },
  { Icon: AlertTriangle, text: "Riesgo operativo por falta de trazabilidad" },
];

export default function Problema() {
  return (
    <section id="problema" className="py-24 px-6 bg-white">
      <div className="max-w-[960px] mx-auto">
        <Reveal>
          <SectionTag>El problema</SectionTag>
          <h2 className="text-[clamp(26px,3.5vw,38px)] font-extrabold text-navy mb-4 tracking-tight">
            ¿Suena familiar?
          </h2>
          <p className="text-base text-gray-500 max-w-[600px] leading-relaxed mb-10">
            Cuando la documentación no está centralizada, el proceso se vuelve
            reactivo y se pierde visibilidad del estado real de cada proveedor.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {problems.map(({ Icon, text }, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-400 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm text-gray-700 font-medium leading-snug">
                  {text}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
