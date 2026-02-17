"use client";

import { motion } from "framer-motion";
import { Hash, CalendarDays, FileSearch } from "lucide-react";

interface OCRResultsProps {
  matricula: string | null;
  anioRenovado: string | null;
  rawText: string;
}

export default function OCRResults({
  matricula,
  anioRenovado,
  rawText,
}: OCRResultsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* Extracted fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className={`rounded-2xl p-5 border ${
            matricula
              ? "bg-accent-pale/40 border-accent/20"
              : "bg-gray-50 border-gray-100"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Hash
              className={`w-4 h-4 ${
                matricula ? "text-accent-dark" : "text-gray-400"
              }`}
            />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Número de matrícula
            </span>
          </div>
          <p
            className={`text-lg font-bold ${
              matricula ? "text-navy" : "text-gray-400"
            }`}
          >
            {matricula || "Información no detectada automáticamente."}
          </p>
        </div>

        <div
          className={`rounded-2xl p-5 border ${
            anioRenovado
              ? "bg-accent-pale/40 border-accent/20"
              : "bg-gray-50 border-gray-100"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays
              className={`w-4 h-4 ${
                anioRenovado ? "text-accent-dark" : "text-gray-400"
              }`}
            />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Último año renovado
            </span>
          </div>
          <p
            className={`text-lg font-bold ${
              anioRenovado ? "text-navy" : "text-gray-400"
            }`}
          >
            {anioRenovado || "Información no detectada automáticamente."}
          </p>
        </div>
      </div>

      {/* Raw text */}
      <div className="rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100">
          <FileSearch className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
            Texto detectado
          </span>
        </div>
        <pre className="p-5 text-xs text-gray-600 leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap font-mono">
          {rawText || "Sin texto detectado."}
        </pre>
      </div>
    </motion.div>
  );
}
