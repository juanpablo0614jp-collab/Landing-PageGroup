"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, Clock, FileCheck, Upload, UserCheck, Building2, Mail, Hash,
  Search, Trash2, Pencil, X, Download, Phone, MapPin, ChevronDown, ChevronRight,
} from "lucide-react";
import DemoLayout from "@/components/DemoLayout";
import DemoCard from "@/components/DemoCard";
import { useDemoStore, REQUIRED_DOCS, DOC_LABELS, type DocKey, type ProviderStatus } from "@/context/DemoStore";

/* ─── Status visual config ─── */
const STATUS_CFG = {
  pendiente: { label: "Pendiente", icon: Clock, bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", dot: "bg-amber-400" },
  completo: { label: "Completo", icon: FileCheck, bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", dot: "bg-blue-400" },
  activo: { label: "Activo", icon: CheckCircle, bg: "bg-accent-pale", border: "border-accent/20", text: "text-accent-dark", dot: "bg-accent" },
  bloqueado: { label: "Bloqueado", bg: "bg-red-50", border: "border-red-200", text: "text-red-700", dot: "bg-red-400", icon: X },
};

/* ─── Component ─── */
export default function DemoRapido() {
  const store = useDemoStore();
  const [search, setSearch] = useState("");
  const [nombre, setNombre] = useState("");
  const [nit, setNit] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  // Filter providers
  const filtered = useMemo(() => {
    if (!search.trim()) return store.providers;
    const q = search.toLowerCase();
    return store.providers.filter((p) =>
      p.nombre.toLowerCase().includes(q) || p.nit.includes(q) || p.correo.toLowerCase().includes(q)
    );
  }, [store.providers, search]);

  // Stats
  const stats = useMemo(() => ({
    total: store.providers.length,
    pendiente: store.providers.filter((p) => p.status === "pendiente").length,
    completo: store.providers.filter((p) => p.status === "completo").length,
    activo: store.providers.filter((p) => p.status === "activo").length,
  }), [store.providers]);

  // Validation
  const validate = () => {
    const e: Record<string, string> = {};
    if (!nombre.trim()) e.nombre = "Requerido";
    if (!nit.trim()) e.nit = "Requerido";
    else if (!/^\d{3}\.?\d{3}\.?\d{3}-?\d$/.test(nit.replace(/\s/g, ""))) e.nit = "Formato: 900.123.456-7";
    if (!correo.trim()) e.correo = "Requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) e.correo = "Email inválido";
    // Check duplicate NIT
    const cleanNit = nit.replace(/[\s.]/g, "");
    if (!e.nit && store.providers.some((p) => p.nit.replace(/[\s.]/g, "") === cleanNit && p.id !== editingId)) {
      e.nit = "NIT ya registrado";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    if (editingId) {
      store.updateProvider(editingId, { nombre: nombre.trim(), nit: nit.trim(), correo: correo.trim(), telefono: telefono.trim() || undefined, ciudad: ciudad.trim() || undefined });
      showToast(`✏️ "${nombre}" actualizado`);
      setEditingId(null);
    } else {
      store.addProvider({ nombre: nombre.trim(), nit: nit.trim(), correo: correo.trim(), telefono: telefono.trim() || undefined, ciudad: ciudad.trim() || undefined });
      showToast(`✅ "${nombre}" registrado`);
    }
    setNombre(""); setNit(""); setCorreo(""); setTelefono(""); setCiudad(""); setErrors({});
  };

  const startEdit = (p: typeof store.providers[0]) => {
    setEditingId(p.id); setNombre(p.nombre); setNit(p.nit); setCorreo(p.correo);
    setTelefono(p.telefono || ""); setCiudad(p.ciudad || ""); setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null); setNombre(""); setNit(""); setCorreo(""); setTelefono(""); setCiudad(""); setErrors({});
  };

  const exportCSV = () => {
    const header = "Nombre,NIT,Correo,Teléfono,Ciudad,Estado,Cámara,RUT,Bancaria\n";
    const rows = store.providers.map((p) =>
      `"${p.nombre}","${p.nit}","${p.correo}","${p.telefono || ""}","${p.ciudad || ""}","${p.status}","${p.docs.camara.uploaded ? "Sí" : "No"}","${p.docs.rut.uploaded ? "Sí" : "No"}","${p.docs.bancaria.uploaded ? "Sí" : "No"}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "proveedores.csv";
    a.click();
    showToast("📥 CSV exportado");
  };

  const reqDocsUploaded = (p: typeof store.providers[0]) => REQUIRED_DOCS.filter((k) => p.docs[k].uploaded).length;
  const inputCls = (field: string) =>
    `w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 ${
      errors[field] ? "border-red-300 focus:ring-red-200 focus:border-red-400" : "border-gray-200 focus:ring-accent/40 focus:border-accent"
    }`;

  return (
    <DemoLayout title="Demo: Implementación Rápida" subtitle="Registro, carga de documentos y activación de proveedores" currentPath="/demo-rapido">
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

{/* Mini stats */}
<div className="grid grid-cols-4 gap-3 mb-6"></div>
      {/* Mini stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {([
          { n: stats.total, l: "Total", c: "bg-gray-50" },
          { n: stats.pendiente, l: "Pendientes", c: "bg-amber-50/60" },
          { n: stats.completo, l: "Completos", c: "bg-blue-50/60" },
          { n: stats.activo, l: "Activos", c: "bg-accent-pale/40" },
        ]).map(({ n, l, c }, i) => (
          <DemoCard key={l} className={`!p-3 ${c}`} delay={i * 0.05}>
            <p className="text-xl font-extrabold text-navy">{n}</p>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{l}</p>
          </DemoCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Form ─── */}
        <div className="lg:col-span-1 space-y-4">
          <DemoCard>
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-accent" />
                  <h3 className="text-base font-bold text-navy">{editingId ? "Editar proveedor" : "Registrar proveedor"}</h3>
                </div>
                {editingId && (
                  <button type="button" onClick={cancelEdit} className="text-xs text-gray-400 hover:text-red-500 font-semibold">Cancelar</button>
                )}
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-1 mb-1">
                {["Datos", "Documentos", "Aprobación"].map((s, i) => (
                  <div key={s} className="flex items-center gap-1 flex-1">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      i === 0 ? "bg-accent text-white" : "bg-gray-100 text-gray-400"}`}>{i + 1}</div>
                    <span className="text-[10px] font-semibold text-gray-400 hidden sm:inline">{s}</span>
                    {i < 2 && <div className="flex-1 h-px bg-gray-200 mx-1" />}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Nombre empresa *</label>
                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Suministros S.A.S." className={inputCls("nombre")} />
                {errors.nombre && <p className="text-[10px] text-red-500 mt-1">{errors.nombre}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">NIT *</label>
                <input type="text" value={nit} onChange={(e) => setNit(e.target.value)} placeholder="900.123.456-7" className={inputCls("nit")} />
                {errors.nit && <p className="text-[10px] text-red-500 mt-1">{errors.nit}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Correo *</label>
                <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="contacto@empresa.com" className={inputCls("correo")} />
                {errors.correo && <p className="text-[10px] text-red-500 mt-1">{errors.correo}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Teléfono</label>
                  <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="310 555 1234" className={inputCls("")} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Ciudad</label>
                  <input type="text" value={ciudad} onChange={(e) => setCiudad(e.target.value)} placeholder="Bogotá" className={inputCls("")} />
                </div>
              </div>
              <button type="submit"
                className="w-full inline-flex items-center justify-center gap-2 font-semibold text-sm rounded-xl px-7 py-3 transition-all duration-200 bg-accent text-navy hover:bg-accent-dark">
                {editingId ? "Guardar cambios" : "Registrar proveedor"}
              </button>
            </form>
          </DemoCard>

          {/* Export & Instructions */}
          <DemoCard delay={0.1}>
            <button onClick={exportCSV}
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-navy bg-gray-50 hover:bg-gray-100 rounded-xl py-2.5 transition-colors mb-3">
              <Download className="w-4 h-4" /> Exportar CSV
            </button>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Flujo</h4>
            <div className="space-y-2">
              {[
                { s: "1", t: "Registra un proveedor" },
                { s: "2", t: "Sube los 3 documentos obligatorios" },
                { s: "3", t: 'Aprueba cuando esté completo' },
                { s: "4", t: "Ve al Dashboard para gestión avanzada" },
              ].map((i) => (
                <div key={i.s} className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-pale text-accent-dark text-[10px] font-bold flex items-center justify-center">{i.s}</span>
                  <p className="text-xs text-gray-600">{i.t}</p>
                </div>
              ))}
            </div>
          </DemoCard>
        </div>

        {/* ─── Provider list ─── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, NIT o correo..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent" />
          </div>

          {filtered.length === 0 ? (
            <DemoCard className="text-center py-14">
              <Building2 className="w-12 h-12 mx-auto text-gray-200 mb-3" />
              <p className="text-gray-400 font-semibold">{search ? "Sin resultados" : "No hay proveedores"}</p>
              <p className="text-sm text-gray-300 mt-1">{search ? "Intenta con otro término" : "Usa el formulario para agregar el primero"}</p>
            </DemoCard>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((prov) => {
                  const cfg = STATUS_CFG[prov.status] || STATUS_CFG.pendiente;
                  const isExpanded = expandedId === prov.id;
                  const reqDone = reqDocsUploaded(prov);
                  const pct = (reqDone / REQUIRED_DOCS.length) * 100;

                  return (
                    <motion.div key={prov.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.25 }}>
                      <DemoCard className="!p-0 overflow-hidden" delay={0}>
                        {/* Header */}
                        <div className="p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : prov.id)}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-navy truncate">{prov.nombre}</h3>
                                {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
                              </div>
                              <div className="flex items-center gap-3 mt-1 flex-wrap">
                                <span className="inline-flex items-center gap-1 text-xs text-gray-400"><Hash className="w-3 h-3" />{prov.nit}</span>
                                <span className="inline-flex items-center gap-1 text-xs text-gray-400"><Mail className="w-3 h-3" />{prov.correo}</span>
                                {prov.ciudad && <span className="inline-flex items-center gap-1 text-xs text-gray-400"><MapPin className="w-3 h-3" />{prov.ciudad}</span>}
                              </div>
                            </div>
                            <span className={`flex-shrink-0 flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="mt-3 flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <motion.div className="h-full rounded-full bg-accent" initial={false} animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
                            </div>
                            <span className="text-[10px] font-semibold text-gray-400">{reqDone}/{REQUIRED_DOCS.length}</span>
                          </div>
                        </div>

                        {/* Expanded content */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }} className="overflow-hidden">
                              <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                                {/* Extra info */}
                                {prov.telefono && (
                                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <Phone className="w-3 h-3" /> {prov.telefono}
                                  </div>
                                )}
                                <p className="text-[10px] text-gray-400">Registrado: {prov.createdAt} · Actualizado: {prov.updatedAt}</p>
{store.alerts.filter(a => a.providerId === prov.id && a.type === "vencido").length > 0 && (
  <div className="space-y-1">
    {store.alerts.filter(a => a.providerId === prov.id && a.type === "vencido").map(a => (
      <p key={a.id} className="text-[10px] text-red-600 font-semibold">
        ⚠️ {a.document} — {a.date}
      </p>
    ))}
  </div>
)}
                                {/* Required docs */}
                                <div>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Documentos obligatorios</p>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    {REQUIRED_DOCS.map((key) => (
                                      <div key={key} className={`rounded-xl p-3 text-center border transition-all ${
                                        prov.docs[key].uploaded ? "bg-accent-pale/40 border-accent/20" : "bg-gray-50 border-gray-100"
                                      }`}>
                                        {prov.docs[key].uploaded ? (
                                          <div className="flex flex-col items-center gap-1">
                                            <CheckCircle className="w-5 h-5 text-accent" />
                                            <span className="text-[10px] font-semibold text-accent-dark">{DOC_LABELS[key]}</span>
                                            {prov.docs[key].uploadDate && <span className="text-[9px] text-gray-400">{prov.docs[key].uploadDate}</span>}
                                          </div>
                                        ) : prov.status !== "bloqueado" ? (
                                          <button onClick={(e) => { e.stopPropagation(); store.uploadDocument(prov.id, key); showToast(`📄 ${DOC_LABELS[key]} subido`); }}
                                            className="w-full flex flex-col items-center gap-1 cursor-pointer">
                                            <Upload className="w-5 h-5 text-gray-300" />
                                            <span className="text-[10px] font-semibold text-gray-400">{DOC_LABELS[key]}</span>
                                            <span className="text-[9px] text-accent font-bold">Subir</span>
                                          </button>
                                        ) : (
                                          <div className="flex flex-col items-center gap-1">
                                            <Upload className="w-5 h-5 text-gray-200" />
                                            <span className="text-[10px] font-semibold text-gray-300">{DOC_LABELS[key]}</span>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-1">
                                  {prov.status === "completo" && (
                                    <button onClick={() => { store.approveProvider(prov.id); showToast("🎉 Proveedor aprobado"); }}
                                      className="flex-1 inline-flex items-center justify-center gap-2 font-semibold text-sm rounded-xl py-2.5 bg-navy text-white hover:bg-navy-light transition-colors">
                                      <UserCheck className="w-4 h-4" /> Aprobar
                                    </button>
                                  )}
                                  {prov.status === "activo" && (
                                    <div className="flex-1 rounded-xl bg-accent-pale/40 border border-accent/20 px-4 py-2.5 text-center">
                                      <p className="text-xs font-semibold text-accent-dark">✅ Activo</p>
                                    </div>
                                  )}
                                  <button onClick={() => startEdit(prov)}
                                    className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors" title="Editar">
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => setDeleteConfirm(prov.id)}
                                    className="p-2.5 rounded-xl border border-red-200 text-red-400 hover:bg-red-50 transition-colors" title="Eliminar">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </DemoCard>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* ─── Delete confirm modal ─── */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setDeleteConfirm(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-base font-bold text-navy mb-2">¿Eliminar proveedor?</h3>
              <p className="text-sm text-gray-500 mb-5">Esta acción no se puede deshacer y eliminará toda su documentación.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50">Cancelar</button>
                <button onClick={() => { store.deleteProvider(deleteConfirm); setDeleteConfirm(null); showToast("🗑️ Proveedor eliminado"); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600">Eliminar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DemoLayout>
  );
}
