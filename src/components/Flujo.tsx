"use client";

import { SectionTag, Reveal } from "./ui";
import { Bell, CheckCircle } from "lucide-react";

type FlowStep = {
  lane: 0 | 1 | 2;
  label: string;
  sub: string;
  notif?: boolean;
  highlight?: boolean;
};

const flowSteps: FlowStep[] = [
  { lane: 0, label: "Registra proveedor", sub: "Empresa crea el registro en la plataforma" },
  { lane: 1, label: "Crea carpeta + requisitos", sub: "Se genera automáticamente la estructura" },
  { lane: 1, label: "Envía invitación", sub: "Notificación por correo al proveedor", notif: true },
  { lane: 2, label: "Carga documentos", sub: "El proveedor sube sus docs y vigencias" },
  { lane: 1, label: "Valida completitud", sub: "Verifica que todo esté en orden" },
  { lane: 1, label: "¿Falta algo?", sub: "Notificación de ajuste al proveedor", notif: true },
  { lane: 1, label: "Completo → Notifica", sub: "Aviso a la empresa: 'Listo para revisar'", notif: true },
  { lane: 0, label: "Revisa y aprueba", sub: "Empresa valida la documentación" },
  { lane: 1, label: "Vinculado activo", sub: "Cambia estado del proveedor", highlight: true },
  { lane: 1, label: "Alertas de vencimiento", sub: "Notificaciones a ambas partes", notif: true },
];

const laneNames = ["Empresa", "Plataforma", "Proveedor"];
const laneColors = ["bg-navy", "bg-accent", "bg-indigo-500"];
const laneDotBorder = ["ring-navy/30", "ring-accent/30", "ring-indigo-400/30"];
const laneText = ["text-navy", "text-accent-dark", "text-indigo-500"];

export default function Flujo() {
  return (
    <section id="flujo" className="py-24 px-6 bg-gray-50">
      <div className="max-w-[1000px] mx-auto">
        <Reveal>
          <SectionTag>Cómo funciona</SectionTag>
          <h2 className="text-[clamp(26px,3.5vw,38px)] font-extrabold text-navy mb-3 tracking-tight">
            Flujo de vinculación documental
          </h2>
          <p className="text-base text-gray-500 max-w-[600px] leading-relaxed mb-12">
            Desde el registro hasta la activación, cada paso genera
            notificaciones automáticas para mantener a todos al día.
          </p>
        </Reveal>

        {/* Lane legend */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {laneNames.map((name, i) => (
            <div
              key={name}
              className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-4 py-2"
            >
              <div className={`w-2.5 h-2.5 rounded-full ${laneColors[i]}`} />
              <span className="text-xs font-bold text-navy">{name}</span>
            </div>
          ))}
        </div>

        {/* Steps timeline */}
        <div className="flex flex-col">
          {flowSteps.map((step, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div className="flex items-stretch min-h-[72px]">
                {/* Connector line + dot */}
                <div className="w-10 flex flex-col items-center">
                  <div
                    className={`w-3.5 h-3.5 rounded-full mt-[18px] flex-shrink-0 ring-[3px] ring-offset-2 ring-offset-gray-50 ${
                      step.highlight
                        ? "bg-accent ring-accent/30"
                        : `${laneColors[step.lane]} ${laneDotBorder[step.lane]}`
                    }`}
                  />
                  {i < flowSteps.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gray-200" />
                  )}
                </div>

                {/* Card */}
                <div
                  className={`flex-1 bg-white rounded-xl p-3.5 mb-2 ml-2 border flex items-center gap-3 flex-wrap ${
                    step.highlight
                      ? "border-accent ring-2 ring-accent/15"
                      : "border-gray-100"
                  }`}
                >
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider min-w-[80px] ${laneText[step.lane]}`}
                  >
                    {laneNames[step.lane]}
                  </span>
                  <div className="flex-1 min-w-[180px]">
                    <p className="text-sm font-bold text-navy leading-snug">
                      {step.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{step.sub}</p>
                  </div>
                  {step.notif && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-600 px-2.5 py-1 rounded-md">
                      <Bell className="w-3 h-3" /> Notificación
                    </span>
                  )}
                  {step.highlight && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-accent-pale text-accent-dark px-2.5 py-1 rounded-md">
                      <CheckCircle className="w-3 h-3" /> Estado final
                    </span>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
