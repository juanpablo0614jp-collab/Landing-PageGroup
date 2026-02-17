"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";

export interface ProviderData {
  id: string;
  nombre: string;
  nit: string;
  correo: string;
  status: "pendiente" | "completo" | "activo";
  docs: { camara: boolean; rut: boolean; bancaria: boolean };
}

interface ProviderFormProps {
  onSubmit: (data: ProviderData) => void;
}

export default function ProviderForm({ onSubmit }: ProviderFormProps) {
  const [nombre, setNombre] = useState("");
  const [nit, setNit] = useState("");
  const [correo, setCorreo] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !nit.trim() || !correo.trim()) return;

    onSubmit({
      id: Date.now().toString(),
      nombre: nombre.trim(),
      nit: nit.trim(),
      correo: correo.trim(),
      status: "pendiente",
      docs: { camara: false, rut: false, bancaria: false },
    });

    setNombre("");
    setNit("");
    setCorreo("");
  };

  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all placeholder:text-gray-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Building2 className="w-5 h-5 text-accent" />
        <h3 className="text-base font-bold text-navy">Registrar proveedor</h3>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          Nombre empresa
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Suministros S.A.S."
          className={inputCls}
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          NIT
        </label>
        <input
          type="text"
          value={nit}
          onChange={(e) => setNit(e.target.value)}
          placeholder="Ej: 900.123.456-7"
          className={inputCls}
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          Correo electrónico
        </label>
        <input
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          placeholder="contacto@empresa.com"
          className={inputCls}
          required
        />
      </div>

      <button
        type="submit"
        className="w-full inline-flex items-center justify-center gap-2 font-semibold text-sm rounded-xl px-7 py-3.5 transition-all duration-200 bg-accent text-navy hover:bg-accent-dark"
      >
        Registrar proveedor
      </button>
    </form>
  );
}
