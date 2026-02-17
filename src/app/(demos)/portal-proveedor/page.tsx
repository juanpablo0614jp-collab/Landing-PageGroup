"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCircle, LogOut, Building2, Hash, Mail, Phone, MapPin,
  CheckCircle, Upload, FileText, AlertTriangle, Clock, XCircle, FileX,
  Shield, RefreshCw, ArrowRightLeft, ChevronDown, ChevronUp, History,
  Lock, Info, Eye, EyeOff, ClipboardList,
} from "lucide-react";
import DemoLayout from "@/components/DemoLayout";
import DemoCard from "@/components/DemoCard";
import UploadArea from "@/components/UploadArea";
import FormStep from "@/components/forms/FormStep";
import { useFormStore, type FormTemplate } from "@/lib/formStorage";
import {
  useDemoStore,
  DOC_LABELS,
  ALL_DOCS,
  REQUIRED_DOCS,
  type DocKey,
  type Provider,
  type ProviderStatus,
} from "@/context/DemoStore";

/* ═══════════════════════════════════════════════════
   VISUAL CONFIGS
   ═══════════════════════════════════════════════════ */

const STATUS_CFG: Record<ProviderStatus, { label: string; dot: string; bg: string; text: string; border: string }> = {
  activo:    { label: "Activo",    dot: "bg-accent",    bg: "bg-accent-pale",  text: "text-accent-dark", border: "border-accent/20" },
  pendiente: { label: "Pendiente", dot: "bg-amber-400", bg: "bg-amber-50",     text: "text-amber-700",   border: "border-amber-200" },
  completo:  { label: "Completo",  dot: "bg-blue-400",  bg: "bg-blue-50",      text: "text-blue-700",    border: "border-blue-200" },
  bloqueado: { label: "Bloqueado", dot: "bg-red-400",   bg: "bg-red-50",       text: "text-red-700",     border: "border-red-200" },
};

const ALERT_CFG = {
  proximo:  { icon: Clock,   label: "Próximo a vencer", bg: "bg-amber-50", border: "border-amber-200", iconColor: "text-amber-500", textColor: "text-amber-700" },
  vencido:  { icon: XCircle, label: "Vencido",          bg: "bg-red-50",   border: "border-red-200",   iconColor: "text-red-500",   textColor: "text-red-700" },
  faltante: { icon: FileX,   label: "Faltante",         bg: "bg-gray-50",  border: "border-gray-200",  iconColor: "text-gray-500",  textColor: "text-gray-700" },
};

const HISTORY_ICONS: Record<string, any> = {
  creado: FileText, documento_subido: Upload, documento_actualizado: RefreshCw,
  estado_cambiado: ArrowRightLeft, editado: RefreshCw, eliminado: XCircle, ocr_procesado: FileText,
};
const HISTORY_COLORS: Record<string, string> = {
  creado: "bg-accent-pale text-accent-dark", documento_subido: "bg-blue-50 text-blue-500",
  documento_actualizado: "bg-accent-pale text-accent-dark", estado_cambiado: "bg-purple-50 text-purple-500",
  editado: "bg-amber-50 text-amber-500", eliminado: "bg-red-50 text-red-500", ocr_procesado: "bg-cyan-50 text-cyan-600",
};

/* ═══════════════════════════════════════════════════
   PAGE COMPONENT
   ═══════════════════════════════════════════════════ */

export default function PortalProveedor() {
  const store = useDemoStore();
  const formStore = useFormStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loginCorreo, setLoginCorreo] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(true);
  const [uploadingDoc, setUploadingDoc] = useState<DocKey | null>(null);
  const [activeForm, setActiveForm] = useState<FormTemplate | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  // ── Derived data ──
  const provider = store.providers.find((p) => p.id === selectedId) || null;
  const myAlerts = useMemo(() => store.alerts.filter((a) => a.providerId === selectedId), [store.alerts, selectedId]);
  const myHistory = useMemo(() => store.history.filter((h) => h.providerId === selectedId), [store.history, selectedId]);
  const pendingForms = useMemo(() => selectedId ? formStore.getProviderPendingForms(selectedId) : [], [selectedId, formStore]);
  const completedForms = useMemo(() => selectedId ? formStore.getProviderSubmissions(selectedId) : [], [selectedId, formStore]);

  // ── Progress ──
  const reqDone = provider ? REQUIRED_DOCS.filter((k) => provider.docs[k].uploaded).length : 0;
  const reqTotal = REQUIRED_DOCS.length;
  const allDone = provider ? ALL_DOCS.filter((k) => provider.docs[k].uploaded).length : 0;
  const allTotal = ALL_DOCS.length;
  const pctRequired = reqTotal > 0 ? (reqDone / reqTotal) * 100 : 0;

  // ── Upload handler ──
  const handleUpload = (docKey: DocKey, file?: File) => {
    if (!selectedId) return;
    const fileName = file ? file.name : `${docKey}_${Date.now()}.pdf`;
    store.uploadDocument(selectedId, docKey, fileName);
    setUploadingDoc(null);
    showToast(`📄 ${DOC_LABELS[docKey]} subido exitosamente`);
  };

  const logout = () => {
    setSelectedId(null);
    setLoginCorreo("");
    setLoginPassword("");
    setLoginError(null);
    setUploadingDoc(null);
    setActiveForm(null);
  };

  // ── Login handler ──
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginCorreo.trim() || !loginPassword.trim()) {
      setLoginError("Por favor completa todos los campos.");
      return;
    }

    // Simulate loading
    setLoginLoading(true);
    setTimeout(() => {
      const found = store.providers.find(
        (p) => p.correo.toLowerCase() === loginCorreo.trim().toLowerCase()
      );

      if (!found) {
        setLoginError("No se encontró un proveedor con ese correo. Verifica e intenta de nuevo.");
        setLoginLoading(false);
        return;
      }

      // In a real app we'd validate password server-side. Here any password works.
      if (loginPassword.length < 4) {
        setLoginError("La contraseña debe tener al menos 4 caracteres.");
        setLoginLoading(false);
        return;
      }

      setSelectedId(found.id);
      setLoginLoading(false);
      showToast(`👋 Bienvenido, ${found.nombre}`);
    }, 800); // Simulated delay
  };

  /* ─────────────────────────────────────────────────
     RENDER: LOGIN SCREEN
     ───────────────────────────────────────────────── */
  if (!provider) {
    return (
      <DemoLayout
        title="Portal del Proveedor"
        subtitle="Inicia sesión para acceder a tu documentación"
        currentPath="/portal-proveedor"
      >
        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-navy text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg">{toast}</motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-md mx-auto space-y-5">
          <DemoCard>
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-6">
              <img src="/PageGroup_Logo.png" alt="PageGroup" className="h-14 object-contain mb-3" />
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-navy to-accent flex items-center justify-center mb-3">
              <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-extrabold text-navy">Iniciar sesión</h3>
              <p className="text-xs text-gray-400 mt-1">Ingresa tus credenciales para acceder al portal</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Correo electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={loginCorreo}
                    onChange={(e) => { setLoginCorreo(e.target.value); setLoginError(null); }}
                    placeholder="contacto@empresa.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all placeholder:text-gray-400"
                    autoComplete="email"
                    disabled={loginLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => { setLoginPassword(e.target.value); setLoginError(null); }}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all placeholder:text-gray-400"
                    autoComplete="current-password"
                    disabled={loginLoading}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy transition-colors"
                    tabIndex={-1}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {loginError && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-600">{loginError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button type="submit" disabled={loginLoading}
                className="w-full inline-flex items-center justify-center gap-2 font-semibold text-sm rounded-xl px-7 py-3.5 transition-all duration-200 bg-accent text-navy hover:bg-accent-dark disabled:opacity-60 disabled:cursor-not-allowed">
                {loginLoading ? (
                  <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                    className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full" /> Verificando...</>
                ) : (
                  "Ingresar"
                )}
              </button>
            </form>

            {/* Forgot password (decorative) */}
            <p className="text-center mt-4">
              <span className="text-xs text-gray-400 hover:text-accent cursor-pointer transition-colors">
                ¿Olvidaste tu contraseña?
              </span>
            </p>
          </DemoCard>

          {/* Hint card for demo purposes */}
          <DemoCard className="!bg-navy/5 !border-navy/10">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-navy mb-1">Demo: credenciales de prueba</p>
                <p className="text-[11px] text-gray-600 leading-relaxed mb-2">
                  Usa el correo de cualquier proveedor registrado y cualquier contraseña (mínimo 4 caracteres).
                </p>
                <div className="space-y-1">
                  {store.providers.slice(0, 3).map((p) => (
                    <button key={p.id} onClick={() => { setLoginCorreo(p.correo); setLoginPassword("demo1234"); setLoginError(null); }}
                      className="w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/60 transition-colors group">
                      <span className="text-[10px] text-gray-500 group-hover:text-navy truncate">{p.correo}</span>
                      <span className="text-[9px] font-semibold text-accent opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">Usar</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </DemoCard>
        </div>
      </DemoLayout>
    );
  }

  /* ─────────────────────────────────────────────────
     RENDER: PROVIDER DASHBOARD
     ───────────────────────────────────────────────── */

  const statusCfg = STATUS_CFG[provider.status];

  return (
    <DemoLayout
      title="Portal del Proveedor"
      subtitle={`Bienvenido, ${provider.nombre}`}
      currentPath="/portal-proveedor"
    >
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-navy text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg">{toast}</motion.div>
        )}
      </AnimatePresence>

      {/* ── Header bar ── */}
      <DemoCard className="!p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-navy to-accent flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-extrabold">
                {provider.nombre.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-navy">{provider.nombre}</h2>
              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                <span className="text-xs text-gray-400 flex items-center gap-1"><Hash className="w-3 h-3" />{provider.nit}</span>
                <span className="text-xs text-gray-400 flex items-center gap-1"><Mail className="w-3 h-3" />{provider.correo}</span>
                {provider.telefono && <span className="text-xs text-gray-400 flex items-center gap-1"><Phone className="w-3 h-3" />{provider.telefono}</span>}
                {provider.ciudad && <span className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{provider.ciudad}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
              <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />{statusCfg.label}
            </span>
            <button onClick={logout}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all">
              <LogOut className="w-3.5 h-3.5" /> Salir
            </button>
          </div>
        </div>
      </DemoCard>

      {/* ── Blocked banner ── */}
      {provider.status === "bloqueado" && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl bg-red-50 border border-red-200 px-5 py-4 flex items-start gap-3">
          <Lock className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-700">Cuenta bloqueada</p>
            <p className="text-xs text-red-600 mt-0.5">
              Tu cuenta está temporalmente bloqueada por documentación vencida o incompleta.
              Por favor actualiza los documentos indicados en las alertas para restablecer el acceso.
            </p>
          </div>
        </motion.div>
      )}

      {/* ── Progress section ── */}
      <DemoCard className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-navy">Progreso de documentación</h3>
          <span className="text-xs font-semibold text-gray-500">{reqDone}/{reqTotal} obligatorios · {allDone}/{allTotal} total</span>
        </div>

        {/* Required docs bar */}
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Documentos obligatorios</span>
              <span className="text-xs font-bold text-navy">{Math.round(pctRequired)}%</span>
            </div>
            <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
              <motion.div className="h-full rounded-full" initial={false}
                animate={{ width: `${pctRequired}%` }} transition={{ duration: 0.5 }}
                style={{ backgroundColor: pctRequired === 100 ? "#00C48C" : pctRequired > 50 ? "#F59E0B" : "#EF4444" }} />
            </div>
          </div>

          {pctRequired === 100 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-2 px-3 py-2 bg-accent-pale/50 rounded-xl">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span className="text-xs font-semibold text-accent-dark">
                ¡Documentación obligatoria completa! {provider.status === "completo" && "Pendiente de aprobación por parte de la empresa."}
                {provider.status === "activo" && "Tu cuenta está activa."}
              </span>
            </motion.div>
          )}
        </div>
      </DemoCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Col 1: Documents Grid ── */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-navy flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent" /> Mis documentos
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ALL_DOCS.map((docKey, i) => {
              const doc = provider.docs[docKey];
              const isRequired = REQUIRED_DOCS.includes(docKey);
              const isUploading = uploadingDoc === docKey;

              return (
                <motion.div key={docKey}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <DemoCard className={`!p-0 overflow-hidden ${doc.uploaded ? "" : isRequired ? "!border-amber-200/60" : ""}`} delay={0}>
                    {/* Doc header */}
                    <div className={`px-4 py-3 flex items-center justify-between ${doc.uploaded ? "bg-accent-pale/20" : "bg-gray-50/80"}`}>
                      <div className="flex items-center gap-2.5">
                        {doc.uploaded
                          ? <CheckCircle className="w-4.5 h-4.5 text-accent flex-shrink-0" />
                          : <div className="w-4.5 h-4.5 rounded-full border-2 border-gray-300 border-dashed flex-shrink-0" />}
                        <div>
                          <span className="text-xs font-bold text-navy">{DOC_LABELS[docKey]}</span>
                          {isRequired && <span className="ml-1.5 text-[8px] font-bold text-accent-dark bg-accent-pale px-1.5 py-0.5 rounded">OBLIGATORIO</span>}
                        </div>
                      </div>
                    </div>

                    {/* Doc body */}
                    <div className="px-4 py-3">
                      {doc.uploaded ? (
                        <div className="space-y-2">
                          {doc.fileName && (
                            <div className="flex items-center gap-2">
                              <FileText className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-xs text-gray-600 truncate">{doc.fileName}</span>
                            </div>
                          )}
                          {doc.uploadDate && (
                            <p className="text-[10px] text-gray-400">Subido: {doc.uploadDate}</p>
                          )}
                          {doc.expiryDate && (
                            <p className={`text-[10px] font-semibold ${
                              new Date(doc.expiryDate) < new Date() ? "text-red-500" : "text-amber-600"
                            }`}>
                              {new Date(doc.expiryDate) < new Date() ? "⚠️ Vencido" : "📅 Vence"}: {doc.expiryDate}
                            </p>
                          )}
                          {doc.ocrData && (doc.ocrData.matricula || doc.ocrData.anioRenovado) && (
                            <div className="mt-1 px-2.5 py-1.5 bg-navy/5 rounded-lg">
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Datos OCR</p>
                              {doc.ocrData.matricula && <p className="text-[10px] text-navy">Matrícula: <strong>{doc.ocrData.matricula}</strong></p>}
                              {doc.ocrData.anioRenovado && <p className="text-[10px] text-navy">Renovado: <strong>{doc.ocrData.anioRenovado}</strong></p>}
                            </div>
                          )}

                          {/* Update button */}
                          <button onClick={() => setUploadingDoc(isUploading ? null : docKey)}
                            className="w-full mt-1 text-[10px] font-semibold text-accent-dark hover:text-accent bg-accent-pale/40 hover:bg-accent-pale rounded-lg py-2 transition-colors flex items-center justify-center gap-1.5">
                            <RefreshCw className="w-3 h-3" /> Actualizar documento
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-400">
                            {isRequired ? "Documento obligatorio. Debes subirlo para completar tu registro." : "Documento opcional."}
                          </p>
                          <button onClick={() => setUploadingDoc(isUploading ? null : docKey)}
                            className="w-full text-xs font-semibold text-white bg-accent hover:bg-accent-dark rounded-xl py-2.5 transition-colors flex items-center justify-center gap-1.5">
                            <Upload className="w-3.5 h-3.5" /> Subir documento
                          </button>
                        </div>
                      )}

                      {/* Upload area (expanded) */}
                      <AnimatePresence>
                        {isUploading && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }} className="overflow-hidden">
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <UploadArea
                                label={`Subir ${DOC_LABELS[docKey]}`}
                                accept=".pdf,.jpg,.jpeg,.png"
                                onFileSelect={(file) => handleUpload(docKey, file)}
                                compact={false}
                              />
                              <div className="flex gap-2 mt-2">
                                <button onClick={() => handleUpload(docKey)}
                                  className="flex-1 text-[10px] font-semibold text-navy bg-gray-100 hover:bg-gray-200 rounded-lg py-2 transition-colors">
                                  Simular subida
                                </button>
                                <button onClick={() => setUploadingDoc(null)}
                                  className="text-[10px] font-semibold text-gray-400 hover:text-red-500 px-3 py-2 rounded-lg transition-colors">
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </DemoCard>
                </motion.div>
              );
            })}
          </div>

          {/* ── Forms Section ── */}
          {activeForm ? (
            /* Step-by-step form filling */
            <FormStep
              template={activeForm}
              onSubmit={(answers) => {
                if (!provider) return;
                formStore.submitForm(activeForm.id, provider.id, provider.nombre, provider.correo, answers);
                store.addNotification(`Formulario "${activeForm.name}" completado`, "success");
                showToast(`✅ Formulario "${activeForm.name}" enviado`);
                setActiveForm(null);
              }}
              onCancel={() => setActiveForm(null)}
            />
          ) : (pendingForms.length > 0 || completedForms.length > 0) ? (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-navy flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-accent" /> Formularios
              </h3>

              {/* Pending forms */}
              {pendingForms.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Pendientes ({pendingForms.length})</p>
                  {pendingForms.map((tpl) => (
                    <DemoCard key={tpl.id} className="!p-3 !border-amber-200/60" delay={0}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-navy truncate">{tpl.name}</p>
                          {tpl.description && <p className="text-[10px] text-gray-400 truncate">{tpl.description}</p>}
                          <p className="text-[10px] text-gray-400">{tpl.questions.length} pregunta{tpl.questions.length > 1 ? "s" : ""}</p>
                        </div>
                        <button onClick={() => setActiveForm(tpl)}
                          className="flex-shrink-0 text-xs font-semibold text-white bg-accent hover:bg-accent-dark px-3 py-1.5 rounded-lg transition-colors">
                          Completar
                        </button>
                      </div>
                    </DemoCard>
                  ))}
                </div>
              )}

              {/* Completed forms */}
              {completedForms.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-accent-dark uppercase tracking-wider">Completados ({completedForms.length})</p>
                  {completedForms.map((sub) => (
                    <DemoCard key={sub.id} className="!p-3" delay={0}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-navy">{sub.formName}</p>
                            <p className="text-[10px] text-gray-400">{sub.submittedAt}</p>
                          </div>
                        </div>
                        <span className="text-[8px] font-bold text-accent-dark bg-accent-pale px-1.5 py-0.5 rounded">ENVIADO</span>
                      </div>
                    </DemoCard>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* ── Col 2: Alerts + History ── */}
        <div className="space-y-4">
          {/* Alerts */}
          <DemoCard delay={0.1}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-navy">Mis alertas ({myAlerts.length})</h3>
            </div>
            {myAlerts.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle className="w-8 h-8 mx-auto text-accent/40 mb-2" />
                <p className="text-xs text-gray-400 font-semibold">Sin alertas pendientes</p>
                <p className="text-[10px] text-gray-300 mt-0.5">Tu documentación está al día</p>
              </div>
            ) : (
              <div className="space-y-2">
                {myAlerts.map((alert, i) => {
                  const ac = ALERT_CFG[alert.type];
                  const Icon = ac.icon;
                  return (
                    <motion.div key={alert.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                      className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl border ${ac.bg} ${ac.border}`}>
                      <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${ac.iconColor}`} />
                      <div className="flex-1 min-w-0">
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${ac.textColor}`}>{ac.label}</span>
                        <p className="text-xs font-semibold text-navy">{alert.document}</p>
                        {alert.date && <p className="text-[10px] text-gray-500">{alert.date}</p>}

                        {/* Quick action for faltante */}
                        {alert.type === "faltante" && (
                          <button onClick={() => setUploadingDoc(alert.docKey)}
                            className="mt-1.5 text-[10px] font-bold text-accent hover:text-accent-dark transition-colors flex items-center gap-1">
                            <Upload className="w-3 h-3" /> Subir ahora
                          </button>
                        )}
                        {alert.type === "vencido" && (
                          <button onClick={() => setUploadingDoc(alert.docKey)}
                            className="mt-1.5 text-[10px] font-bold text-red-600 hover:text-red-700 transition-colors flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" /> Actualizar
                          </button>
                        )}
                      </div>
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
                <h3 className="text-sm font-bold text-navy">Mi historial ({myHistory.length})</h3>
              </div>
              {showHistory ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            <AnimatePresence>
              {showHistory && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden">
                  {myHistory.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-6 mt-3">Sin actividad registrada</p>
                  ) : (
                    <div className="space-y-2 mt-3 max-h-72 overflow-y-auto pr-1">
                      {myHistory.slice(0, 20).map((entry, i) => {
                        const HIcon = HISTORY_ICONS[entry.action] || FileText;
                        const colors = HISTORY_COLORS[entry.action] || "bg-gray-50 text-gray-500";
                        return (
                          <motion.div key={entry.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                            className="flex items-start gap-2.5">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${colors}`}>
                              <HIcon className="w-3 h-3" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] text-gray-600">{entry.detail}</p>
                              <p className="text-[9px] text-gray-400 mt-0.5">{entry.date}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </DemoCard>

          {/* Info card */}
          <DemoCard delay={0.2} className="!bg-navy/5 !border-navy/10">
            <div className="flex items-start gap-3">
              <Shield className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-navy mb-1">Tus datos están seguros</p>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Los documentos subidos solo son visibles para ti y para el equipo administrativo de la empresa contratante.
                  Esta es una demo: los archivos no se almacenan realmente.
                </p>
              </div>
            </div>
          </DemoCard>
        </div>
      </div>
    </DemoLayout>
  );
}
