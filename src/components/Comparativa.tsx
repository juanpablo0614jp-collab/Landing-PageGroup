"use client";

import { SectionTag, Reveal, Check } from "./ui";

const rows: [string, string, string][] = [
  ["Portal para proveedores", "✓", "✓"],
  ["Acceso con usuario y contraseña", "✓", "✓"],
  ["Invitación automática por correo", "✓", "✓"],
  ["Carga de documentos en línea", "✓", "✓"],
  ["Documentos obligatorios configurables", "✓", "✓"],
  ["Registro de fechas de vigencia", "✓", "✓"],
  ["Estados del proveedor", "Básico", "Avanzado"],
  ["Validación de documentos completos", "✓", "✓"],
  ["Alertas por docs próximos a vencer", "✓", "✓"],
  ["Alertas por documentos vencidos", "✓", "✓"],
  ["Alertas por documentos faltantes", "✓", "✓"],
  ["Control centralizado por la empresa", "✓", "✓"],
  ["Historial de cargas", "Básico", "Avanzado"],
  ["Acceso desde cualquier lugar", "✓", "✓"],
  ["Validación automática por contenido (OCR)", "—", "✓"],
  ["Detección de documentos incorrectos", "—", "✓"],
  ["Alertas por cambios de formatos/requisitos", "—", "✓"],
  ["Reglas dinámicas según políticas internas", "—", "Personalizable"],
  ["Dominio propio de la empresa", "—", "✓"],
  ["Propiedad del sistema", "✓", "✓"],
  ["Escalabilidad del código", "Limitado", "Personalizable"],
  ["Evolución futura del sistema", "Limitado", "✓"],
  ["Integraciones futuras", "Limitado", "Personalizable"],
  ["Tiempo de implementación", "~1 mes", "~3 meses"],
  ["Inversión inicial", "USD 2.750", "USD 5.000"],
];

function CellValue({ val }: { val: string }) {
  if (val === "✓") return <Check />;
  if (val === "—") return <Check ok={false} />;
  const isPositive =
    val === "Avanzado" || val === "Personalizable" || val.startsWith("USD 4");
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
        isPositive
          ? "bg-accent-pale text-accent-dark"
          : "bg-gray-100 text-gray-500"
      }`}
    >
      {val}
    </span>
  );
}

export default function Comparativa() {
  return (
    <section id="comparativa" className="py-24 px-6 bg-gray-50">
      <div className="max-w-[860px] mx-auto">
        <Reveal>
          <SectionTag>Tabla comparativa</SectionTag>
          <h2 className="text-[clamp(26px,3.5vw,38px)] font-extrabold text-navy mb-10 tracking-tight">
            Comparación detallada
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
            <table className="w-full border-collapse text-sm min-w-[600px]">
              <thead>
                <tr className="bg-navy sticky top-0 z-10">
                  <th className="text-left px-5 py-4 text-white font-bold text-xs w-[48%]">
                    Funcionalidad
                  </th>
                  <th className="text-center px-3 py-4 text-white/75 font-bold text-xs w-[26%]">
                    Implementación
                    <br />
                    rápida
                  </th>
                  <th className="text-center px-3 py-4 text-accent font-bold text-xs w-[26%]">
                    Sistema completo
                    <br />
                    (escalable)
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([feat, o1, o2], i) => (
                  <tr
                    key={i}
                    className={`border-b border-gray-100 ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-5 py-3.5 text-gray-700 font-medium">
                      {feat}
                    </td>
                    <td className="text-center px-3 py-3.5">
                      <CellValue val={o1} />
                    </td>
                    <td className="text-center px-3 py-3.5">
                      <CellValue val={o2} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
