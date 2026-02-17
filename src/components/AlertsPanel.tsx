"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Clock, XCircle, FileX } from "lucide-react";

export interface AlertItem {
  id: string;
  type: "proximo" | "vencido" | "faltante";
  provider: string;
  document: string;
  date?: string;
}

interface AlertsPanelProps {
  alerts: AlertItem[];
}

const alertConfig = {
  proximo: {
    icon: Clock,
    label: "Próximo a vencer",
    bg: "bg-amber-50",
    border: "border-amber-200",
    iconColor: "text-amber-500",
    textColor: "text-amber-700",
  },
  vencido: {
    icon: XCircle,
    label: "Vencido",
    bg: "bg-red-50",
    border: "border-red-200",
    iconColor: "text-red-500",
    textColor: "text-red-700",
  },
  faltante: {
    icon: FileX,
    label: "Faltante",
    bg: "bg-gray-50",
    border: "border-gray-200",
    iconColor: "text-gray-500",
    textColor: "text-gray-700",
  },
};

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <AlertTriangle className="w-5 h-5 text-amber-500" />
        <h3 className="text-base font-bold text-navy">
          Alertas del sistema
        </h3>
      </div>

      {alerts.length === 0 ? (
        <p className="text-sm text-gray-400 italic py-4 text-center">
          No hay alertas activas
        </p>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert, i) => {
            const config = alertConfig[alert.type];
            const Icon = config.icon;
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.35 }}
                className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${config.bg} ${config.border}`}
              >
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${config.textColor}`}
                    >
                      {config.label}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-navy mt-0.5">
                    {alert.provider}
                  </p>
                  <p className="text-xs text-gray-500">
                    {alert.document}
                    {alert.date && ` · ${alert.date}`}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
