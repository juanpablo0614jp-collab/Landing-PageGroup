"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, Clock, ShieldOff, Filter, History, FileText, RefreshCw,
  ArrowRightLeft, ChevronDown, ChevronUp, Sliders, Search, Eye, X,
  Download, TrendingUp, AlertTriangle, BarChart3, XCircle, FileX,
} from "lucide-react";
import DemoLayout from "@/components/DemoLayout";
import DemoCard from "@/components/DemoCard";
import FormBuilder from "@/components/forms/FormBuilder";
import { useFormStore } from "@/lib/formStorage";
import { useDemoStore, DOC_LABELS, ALL_DOCS, REQUIRED_DOCS, type ProviderStatus, type DocKey, type Provider } from "@/context/DemoStore";

/* ─── Visual configs ─── */
const STATUS_CFG: Record<ProviderStatus, { label: string; icon: any; dot: string; bg: string; text: string; border: string; barColor: string }> = {
  activo: { label: "Activo", icon: CheckCircle, dot: "bg-accent", bg: "bg-accent-pale", text: "text-accent-dark", border: "border-accent/20", barColor: "#00C48C" },
  pendiente: { label: "Pendiente", icon: Clock, dot: "bg-amber-400", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", barColor: "#F59E0B" },
  completo: { label: "Completo", icon: CheckCircle, dot: "bg-blue-400", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", barColor: "#3B82F6" },
  bloqueado: { label: "Bloqueado", icon: ShieldOff, dot: "bg-red-400", bg: "bg-red-50", text: "text-red-700", border: "border-red-200", barColor: "#EF4444" },
};

const HISTORY_ICONS: Record<string, any> = {
  creado: FileText, documento_subido: FileText, documento_actualizado: RefreshCw,
  estado_cambiado: ArrowRightLeft, editado: RefreshCw, eliminado: XCircle, ocr_procesado: Eye,
};
const HISTORY_COLORS: Record<string, string> = {
  creado: "bg-accent-pale text-accent-dark", documento_subido: "bg-blue-50 text-blue-500",
  documento_actualizado: "bg-accent-pale text-accent-dark", estado_cambiado: "bg-purple-50 text-purple-500",
  editado: "bg-amber-50 text-amber-500", eliminado: "bg-red-50 text-red-500", ocr_procesado: "bg-cyan-50 text-cyan-600",
};
const ALERT_CFG = {
  proximo: { icon: Clock, label: "Próximo a vencer", bg: "bg-amber-50", border: "border-amber-200", iconColor: "text-amber-500", textColor: "text-amber-700" },
  vencido: { icon: XCircle, label: "Vencido", bg: "bg-red-50", border: "border-red-200", iconColor: "text-red-500", textColor: "text-red-700" },
  faltante: { icon: FileX, label: "Faltante", bg: "bg-gray-50", border: "border-gray-200", iconColor: "text-gray-500", textColor: "text-gray-700" },
};

/* ─── Donut Chart ─── */
function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;
  let cumulative = 0;
  const segments = data.filter((d) => d.value > 0).map((d) => {
    const pct = (d.value / total) * 100;
    const offset = cumulative;
    cumulative += pct;
    return { ...d, pct, offset };
  });
  return (
    <div className="flex items-center gap-4">
      <svg width="90" height="90" viewBox="0 0 42 42" className="flex-shrink-0">
        <circle cx="21" cy="21" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="5" />
        {segments.map((s, i) => (
          <motion.circle key={i} cx="21" cy="21" r="15.9" fill="none" stroke={s.color} strokeWidth="5"
            strokeDasharray={`${s.pct} ${100 - s.pct}`} strokeDashoffset={25 - s.offset}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.15 }} />
        ))}
        <text x="21" y="22" textAnchor="middle" fill="#0B1D3A" fontSize="8" fontWeight="800">{total}</text>
      </svg>
      <div className="space-y-1.5">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-[11px] text-gray-600">{s.label}: <strong className="text-navy">{s.value}</strong></span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Rules config ─── */
interface Rule { id: string; label: string; value: string; editable?: boolean; enabled: boolean }
const INITIAL_RULES: Rule[] = [
  { id: "r1", label: "Días previos para alerta de vencimiento", value: "30", editable: true, enabled: true },
  { id: "r2", label: "Bloqueo automático por documento vencido", value: "Sí", enabled: true },
  { id: "r3", label: "Documentos obligatorios mínimos", value: "3", editable: true, enabled: true },
  { id: "r4", label: "Notificación por correo al proveedor", value: "Sí", enabled: false },
  { id: "r5", label: "Requiere aprobación manual", value: "Sí", enabled: true },
];

/* ─── Main Component ─── */
export default function DemoCompleto() {
  const store = useDemoStore();
  const formStore = useFormStore();
  const [filter, setFilter] = useState<"todos" | ProviderStatus>("todos");
  const [search, setSearch] = useState("");
  const [showHistory, setShowHistory] = useState(true);
  const [rules, setRules] = useState<Rule[]>(INITIAL_RULES);
  const [editRuleId, setEditRuleId] = useState<string | null>(null);
  const [editRuleVal, setEditRuleVal] = useState("");
  const [detailProvider, setDetailProvider] = useState<Provider | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const counts = useMemo(() => ({
    todos: store.providers.length,
    activo: store.providers.filter((p) => p.status === "activo").length,
    pendiente: store.providers.filter((p) => p.status === "pendiente").length,
    completo: store.providers.filter((p) => p.status === "completo").length,
    bloqueado: store.providers.filter((p) => p.status === "bloqueado").length,
  }), [store.providers]);

  const filtered = useMemo(() => {
    let list = filter === "todos" ? store.providers : store.providers.filter((p) => p.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.nombre.toLowerCase().includes(q) || p.nit.includes(q));
    }
    return list;
  }, [store.providers, filter, search]);

  const chartData = [
    { label: "Activos", value: counts.activo, color: "#00C48C" },
    { label: "Pendientes", value: counts.pendiente, color: "#F59E0B" },
    { label: "Completos", value: counts.completo, color: "#3B82F6" },
    { label: "Bloqueados", value: counts.bloqueado, color: "#EF4444" },
  ];

  const toggleRule = (id: string) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
    showToast("⚙️ Regla actualizada");
  };

  const saveRuleValue = (id: string) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, value: editRuleVal } : r)));
    setEditRuleId(null);
    showToast("⚙️ Valor actualizado");
  };

  const exportCSV = () => {
    const header = "Nombre,NIT,Correo,Ciudad,Estado,Docs Subidos,Docs Total\n";
    const rows = store.providers.map((p) => {
      const uploaded = ALL_DOCS.filter((k) => p.docs[k].uploaded).length;
      return `"${p.nombre}","${p.nit}","${p.correo}","${p.ciudad || ""}","${p.status}",${uploaded},${ALL_DOCS.length}`;
    }).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "dashboard_proveedores.csv"; a.click();
    showToast("📥 Exportado");
  };

  return (
    <DemoLayout title="Demo: Sistema Completo" subtitle="Dashboard avanzado con alertas, historial, reglas dinámicas y gestión integral" currentPath="/demo-completo">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-navy text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg">{toast}</motion.div>
        )}
      </AnimatePresence>
{/* Logo */}
<div className="flex justify-center mb-6">
  <img src="/PageGroup_Logo.png" alt="PageGroup" className="h-10 object-contain opacity-80" />
</div>
      {/* ─── Stats row ─── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {([
          { key: "todos" as const, label: "Total", icon: BarChart3, c: "from-gray-50 to-white" },
          { key: "activo" as const, label: "Activos", icon: CheckCircle, c: "from-accent-pale/40 to-white" },
          { key: "pendiente" as const, label: "Pendientes", icon: Clock, c: "from-amber-50/60 to-white" },
          { key: "completo" as const, label: "Completos", icon: TrendingUp, c: "from-blue-50/60 to-white" },
          { key: "bloqueado" as const, label: "Bloqueados", icon: ShieldOff, c: "from-red-50/60 to-white" },
        ]).map(({ key, label, icon: Icon, c }, i) => (
          <DemoCard key={key} className={`!p-4 bg-gradient-to-br ${c} cursor-pointer ${filter === key ? "!ring-2 !ring-accent !border-accent" : ""}`} delay={i * 0.04}>
            <button onClick={() => setFilter(filter === key ? "todos" : key)} className="w-full text-left">
              <div className="flex items-center justify-between">
                <p className="text-2xl font-extrabold text-navy">{counts[key]}</p>
                <Icon className="w-5 h-5 text-gray-300" />
              </div>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mt-0.5">{label}</p>
            </button>
          </DemoCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Col 1: Provider list ─── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search + Filter + Export */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar proveedor..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              {(["todos", "activo", "pendiente", "completo", "bloqueado"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg capitalize ${filter === f ? "bg-navy text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Provider cards */}
          <div className="space-y-2.5">
            <AnimatePresence mode="popLayout">
              {filtered.map((prov, i) => {
                const cfg = STATUS_CFG[prov.status];
                const uploaded = ALL_DOCS.filter((k) => prov.docs[k].uploaded).length;
                const pct = (uploaded / ALL_DOCS.length) * 100;
                return (
                  <motion.div key={prov.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.03 }}>
                    <DemoCard className="!p-4 hover:shadow-md transition-shadow cursor-pointer" delay={0}>
                      <div onClick={() => setDetailProvider(prov)}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-navy truncate">{prov.nombre}</h3>
                              <Eye className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">NIT: {prov.nit} {prov.ciudad && `· ${prov.ciudad}`} · Docs: {uploaded}/{ALL_DOCS.length}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {prov.status !== "bloqueado" && prov.status !== "activo" && (
                              <button onClick={(e) => { e.stopPropagation(); store.approveProvider(prov.id); showToast("✅ Aprobado"); }}
                                className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-accent-pale text-accent-dark hover:bg-accent/20 transition-colors">
                                Aprobar
                              </button>
                            )}
                            <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2.5 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <motion.div className="h-full rounded-full transition-all" style={{ backgroundColor: cfg.barColor }}
                            initial={false} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
                        </div>
                      </div>
                    </DemoCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {filtered.length === 0 && (
              <DemoCard className="text-center py-10">
                <p className="text-gray-400 text-sm font-semibold">Sin proveedores para este filtro</p>
              </DemoCard>
            )}
          </div>

          <button onClick={exportCSV}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-navy bg-white hover:bg-gray-50 rounded-xl py-2.5 border border-gray-200 transition-colors">
            <Download className="w-4 h-4" /> Exportar Dashboard CSV
          </button>
        </div>

        {/* ─── Col 2: Sidebar ─── */}
        <div className="space-y-4">
          {/* Chart */}
          <DemoCard delay={0.05}>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-5 h-5 text-accent" />
              <h3 className="text-sm font-bold text-navy">Distribución</h3>
            </div>
            <DonutChart data={chartData} />
          </DemoCard>

          {/* Alerts */}
          <DemoCard delay={0.1}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-navy">Alertas ({store.alerts.length})</h3>
            </div>
            {store.alerts.length === 0 ? (
              <p className="text-xs text-gray-400 italic text-center py-4">Sin alertas activas 🎉</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {store.alerts.map((alert, i) => {
                  const ac = ALERT_CFG[alert.type];
                  const Icon = ac.icon;
                  return (
                    <motion.div key={alert.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl border ${ac.bg} ${ac.border} group`}>
                      <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${ac.iconColor}`} />
                      <div className="flex-1 min-w-0">
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${ac.textColor}`}>{ac.label}</span>
                        <p className="text-xs font-semibold text-navy">{alert.provider}</p>
                        <p className="text-[10px] text-gray-500">{alert.document}{alert.date && ` · ${alert.date}`}</p>
                      </div>
                      <button onClick={() => store.dismissAlert(alert.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/50 rounded transition-all" title="Descartar">
                        <X className="w-3 h-3 text-gray-400" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </DemoCard>

          {/* History */}
          <DemoCard delay={0.15}>
            <button onClick={() => setShowHistory(!showHistory)} className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-bold text-navy">Historial ({store.history.length})</h3>
              </div>
              {showHistory ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            <AnimatePresence>
              {showHistory && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden">
                  <div className="space-y-2 mt-3 max-h-64 overflow-y-auto pr-1">
                    {store.history.slice(0, 20).map((entry, i) => {
                      const HIcon = HISTORY_ICONS[entry.action] || FileText;
                      const colors = HISTORY_COLORS[entry.action] || "bg-gray-50 text-gray-500";
                      return (
                        <motion.div key={entry.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                          className="flex items-start gap-2.5">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${colors}`}>
                            <HIcon className="w-3 h-3" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-navy">{entry.providerName}</p>
                            <p className="text-[10px] text-gray-500">{entry.detail}</p>
                            <p className="text-[9px] text-gray-400 mt-0.5">{entry.date}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </DemoCard>

          {/* Dynamic Rules */}
          <DemoCard delay={0.2}>
            <div className="flex items-center gap-2 mb-3">
              <Sliders className="w-5 h-5 text-accent" />
              <h3 className="text-sm font-bold text-navy">Reglas dinámicas</h3>
            </div>
            <p className="text-[10px] text-gray-400 mb-3">Ajustables sin desarrollo adicional.</p>
            <div className="space-y-2">
              {rules.map((rule) => (
                <div key={rule.id} className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border transition-all ${rule.enabled ? "bg-white border-gray-100" : "bg-gray-50/60 border-gray-100/60"}`}>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[11px] font-semibold ${rule.enabled ? "text-navy" : "text-gray-400"}`}>{rule.label}</p>
                    {editRuleId === rule.id ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <input type="text" value={editRuleVal} onChange={(e) => setEditRuleVal(e.target.value)}
                          className="w-16 px-2 py-1 text-[10px] border border-accent rounded-lg focus:outline-none" autoFocus />
                        <button onClick={() => saveRuleValue(rule.id)} className="text-[9px] font-bold text-accent">Guardar</button>
                        <button onClick={() => setEditRuleId(null)} className="text-[9px] font-bold text-gray-400">X</button>
                      </div>
                    ) : (
                      <p className="text-[10px] text-gray-400 mt-0.5 cursor-pointer"
                        onClick={() => { if (rule.editable) { setEditRuleId(rule.id); setEditRuleVal(rule.value); } }}>
                        Valor: {rule.value} {rule.editable && <span className="text-accent">✎</span>}
                      </p>
                    )}
                  </div>
                  <button onClick={() => toggleRule(rule.id)}
                    className={`flex-shrink-0 w-9 h-5 rounded-full relative transition-colors duration-200 ${rule.enabled ? "bg-accent" : "bg-gray-200"}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${rule.enabled ? "left-[18px]" : "left-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
          </DemoCard>

          {/* Dynamic Forms (Admin) */}
          <DemoCard delay={0.25}>
            <FormBuilder />
          </DemoCard>
        </div>
      </div>

      {/* ─── Provider Detail Modal ─── */}
      <AnimatePresence>
        {detailProvider && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setDetailProvider(null)}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full shadow-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-navy">{detailProvider.nombre}</h2>
                    <p className="text-xs text-gray-400 mt-1">NIT: {detailProvider.nit} · {detailProvider.correo}</p>
                    {detailProvider.ciudad && <p className="text-xs text-gray-400">{detailProvider.ciudad} {detailProvider.telefono && `· ${detailProvider.telefono}`}</p>}
                  </div>
                  <button onClick={() => setDetailProvider(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
                </div>

                {/* Status badge + actions */}
                <div className="flex items-center gap-2 mb-5 flex-wrap">
                  {(() => {
                    const cfg = STATUS_CFG[detailProvider.status];
                    return <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />{cfg.label}
                    </span>;
                  })()}
                  {detailProvider.status !== "activo" && detailProvider.status !== "bloqueado" && (
                    <button onClick={() => { store.approveProvider(detailProvider.id); setDetailProvider({ ...detailProvider, status: "activo" }); showToast("✅ Aprobado"); }}
                      className="text-xs font-bold px-3 py-1.5 rounded-full bg-accent text-navy hover:bg-accent-dark transition-colors">Aprobar</button>
                  )}
                  {detailProvider.status !== "bloqueado" && (
                    <button onClick={() => { store.blockProvider(detailProvider.id, "Acción manual"); setDetailProvider({ ...detailProvider, status: "bloqueado" }); showToast("🚫 Bloqueado"); }}
                      className="text-xs font-bold px-3 py-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Bloquear</button>
                  )}
                  {detailProvider.status === "bloqueado" && (
                    <button onClick={() => { store.setProviderStatus(detailProvider.id, "pendiente"); setDetailProvider({ ...detailProvider, status: "pendiente" }); showToast("🔓 Desbloqueado"); }}
                      className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors">Desbloquear</button>
                  )}
                </div>

                {/* Documents grid */}
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Documentos</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  {ALL_DOCS.map((key) => {
                    const doc = detailProvider.docs[key];
                    const isRequired = REQUIRED_DOCS.includes(key);
                    return (
                      <div key={key} className={`rounded-xl p-3 border ${doc.uploaded ? "bg-accent-pale/30 border-accent/15" : "bg-gray-50 border-gray-100"}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {doc.uploaded ? <CheckCircle className="w-4 h-4 text-accent" /> : <FileX className="w-4 h-4 text-gray-300" />}
                            <span className={`text-xs font-semibold ${doc.uploaded ? "text-navy" : "text-gray-400"}`}>{DOC_LABELS[key]}</span>
                          </div>
                          {isRequired && <span className="text-[8px] font-bold text-accent-dark bg-accent-pale px-1.5 py-0.5 rounded">REQ</span>}
                        </div>
                        {doc.uploaded && doc.uploadDate && <p className="text-[10px] text-gray-400 mt-1 ml-6">Subido: {doc.uploadDate}</p>}
                        {doc.expiryDate && <p className="text-[10px] text-amber-600 ml-6">Vence: {doc.expiryDate}</p>}
                        {!doc.uploaded && (
                          <button onClick={() => { store.uploadDocument(detailProvider.id, key); setDetailProvider((prev) => prev ? { ...prev, docs: { ...prev.docs, [key]: { uploaded: true, uploadDate: "Ahora" } } } : null); showToast(`📄 ${DOC_LABELS[key]} subido`); }}
                            className="text-[10px] font-bold text-accent mt-1 ml-6 hover:underline">+ Subir documento</button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* OCR data if available */}
                {detailProvider.docs.camara.ocrData && (
                  <div className="rounded-xl bg-navy/5 border border-navy/10 p-3 mb-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Datos OCR (Cámara de Comercio)</p>
                    <div className="flex gap-4">
                      {detailProvider.docs.camara.ocrData.matricula && (
                        <div><p className="text-[10px] text-gray-500">Matrícula</p><p className="text-sm font-bold text-navy">{detailProvider.docs.camara.ocrData.matricula}</p></div>
                      )}
                      {detailProvider.docs.camara.ocrData.anioRenovado && (
                        <div><p className="text-[10px] text-gray-500">Año renovado</p><p className="text-sm font-bold text-navy">{detailProvider.docs.camara.ocrData.anioRenovado}</p></div>
                      )}
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-gray-400">Creado: {detailProvider.createdAt} · Actualizado: {detailProvider.updatedAt}</p>

                {/* Completed forms */}
                {(() => {
                  const provSubs = formStore.submissions.filter((s) => s.providerId === detailProvider.id);
                  if (provSubs.length === 0) return null;
                  return (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Formularios completados</p>
                      <div className="space-y-1.5">
                        {provSubs.map((sub) => (
                          <div key={sub.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-accent-pale/20 border border-accent/10">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-3.5 h-3.5 text-accent" />
                              <div>
                                <p className="text-[11px] font-semibold text-navy">{sub.formName}</p>
                                <p className="text-[9px] text-gray-400">{sub.submittedAt}</p>
                              </div>
                            </div>
                            <span className="text-[8px] font-bold text-accent-dark bg-accent-pale px-1.5 py-0.5 rounded">COMPLETADO</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DemoLayout>
  );
}
