"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScanSearch, Loader2, AlertCircle, RotateCcw, Download, Link2, CheckCircle,
  Hash, CalendarDays, FileSearch, Building2, MapPin, ChevronDown, Copy, Check,
  Clock, Pencil, ShieldCheck, X, ImageIcon,
} from "lucide-react";
import DemoLayout from "@/components/DemoLayout";
import DemoCard from "@/components/DemoCard";
import UploadArea from "@/components/UploadArea";
import { useDemoStore, type Provider } from "@/context/DemoStore";

/* --- Extraction helpers --- */

function extractMatricula(t: string): string | null {
  for (const re of [
    /matr[ií]cula\s*(?:no\.?|n[oú]mero\.?|mercantil\.?)\s*[:\-]?\s*([\d.,\s]+\d)/i,
    /(?:no\.?\s*)?matr[ií]cula\s*[:\-]?\s*([\d.,\s]+\d)/i,
  ]) { const m = t.match(re); if (m) return m[1].replace(/[\s,]/g, "").trim(); }
  return null;
}

function extractAnio(t: string): string | null {
  for (const re of [
    /renovaci[oó]n\s*.*?(\b20[0-9]{2}\b)/i,
    /renovad[oa]\s*(?:hasta)?\s*.*?(\b20[0-9]{2}\b)/i,
    /a[ñn]o\s*renovad[oa]\s*[:\-]?\s*(\b20[0-9]{2}\b)/i,
  ]) { const m = t.match(re); if (m) return m[1]; }
  for (const line of t.split("\n")) {
    if (/renovaci[oó]n|renovad[oa]|vigencia/i.test(line)) {
      const m = line.match(/\b(20[0-9]{2})\b/); if (m) return m[1];
    }
  }
  return null;
}

function extractRazon(t: string): string | null {
  for (const re of [/raz[oó]n\s*social\s*[:\-]?\s*(.+)/i, /denominaci[oó]n\s*social\s*[:\-]?\s*(.+)/i]) {
    const m = t.match(re); if (m) return m[1].trim().replace(/\s{2,}/g, " ").substring(0, 100);
  }
  return null;
}

function extractNIT(t: string): string | null {
  for (const re of [/n\.?\s*i\.?\s*t\.?\s*[:\-]?\s*([\d.,\s]+-\s*\d)/i]) {
    const m = t.match(re); if (m) return m[1].replace(/\s/g, "").trim();
  }
  return null;
}

function extractDir(t: string): string | null {
  for (const re of [/direcci[oó]n\s*(?:comercial|principal)?\s*[:\-]?\s*(.+)/i, /domicilio\s*[:\-]?\s*(.+)/i]) {
    const m = t.match(re); if (m) return m[1].trim().substring(0, 120);
  }
  return null;
}

interface Extracted { matricula: string | null; anio: string | null; razon: string | null; nit: string | null; dir: string | null; }

function extractAll(t: string): Extracted {
  return { matricula: extractMatricula(t), anio: extractAnio(t), razon: extractRazon(t), nit: extractNIT(t), dir: extractDir(t) };
}

/* === PAGE === */

export default function DemoOCR() {
  const store = useDemoStore();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pLabel, setPLabel] = useState("");
  const [rawText, setRawText] = useState<string | null>(null);
  const [data, setData] = useState<Extracted | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState<string | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linked, setLinked] = useState(false);
  const [copied, setCopied] = useState(false);

  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [approved, setApproved] = useState<Record<string, boolean>>({});

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const handleFile = useCallback((f: File) => {
    setFile(f); setRawText(null); setData(null); setError(null); setProgress(0);
    setConfidence(null); setLinked(false); setElapsed(null);
    setEditMode({}); setEditValues({}); setApproved({});
    if (f.type.startsWith("image/")) {
      const r = new FileReader(); r.onload = () => setPreviewUrl(r.result as string); r.readAsDataURL(f);
    } else setPreviewUrl(null);
  }, []);

  const processOCR = async () => {
    if (!file) return;
    setProcessing(true); setProgress(0); setError(null); setRawText(null); setData(null); setConfidence(null);
    const t0 = Date.now();
    try {
      setPLabel("Cargando motor OCR...");
      const Tesseract = await import("tesseract.js");
      let src: string | File = file;
      if (file.type === "application/pdf") src = URL.createObjectURL(file);

      const result = await Tesseract.recognize(src, "spa", {
        logger: (m: any) => {
          if (m.status === "recognizing text") { setProgress(Math.round(m.progress * 100)); setPLabel("Reconociendo texto..."); }
          else if (m.status === "loading tesseract core") setPLabel("Cargando motor...");
          else if (m.status === "loading language traineddata") setPLabel("Cargando idioma español...");
          else if (m.status === "initializing tesseract") setPLabel("Inicializando...");
        },
      });

      const text = result.data.text;
      setRawText(text);
      setConfidence(Math.round(result.data.confidence));
      const extracted = extractAll(text);
      setData(extracted);
      setEditValues({
        matricula: extracted.matricula || "",
        anio: extracted.anio || "",
        razon: extracted.razon || "",
        nit: extracted.nit || "",
        dir: extracted.dir || "",
      });
      setEditMode({});
      setApproved({});
      setElapsed(((Date.now() - t0) / 1000).toFixed(1));
      store.addNotification("OCR procesado exitosamente", "success");
    } catch (err: any) {
      console.error(err);
      setError("Error al procesar. Asegúrate de subir una imagen legible (JPG o PNG).");
    } finally { setProcessing(false); }
  };

  const reset = () => {
    setFile(null); setPreviewUrl(null); setRawText(null); setData(null);
    setError(null); setProgress(0); setConfidence(null); setLinked(false); setElapsed(null);
    setEditMode({}); setEditValues({}); setApproved({});
  };

  const linkToProvider = (prov: Provider) => {
    if (!data) return;
    store.uploadDocument(prov.id, "camara", file?.name, {
      matricula: editValues.matricula || undefined,
      anioRenovado: editValues.anio || undefined,
    });
    setLinked(true); setLinkOpen(false);
    showToast(`🔗 Vinculado a "${prov.nombre}"`);
  };

  const copyText = () => {
    if (rawText) { navigator.clipboard.writeText(rawText); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const exportResults = () => {
    if (!data || !rawText) return;
    const content = `RESULTADOS OCR\n${"=".repeat(40)}\n\nMatrícula: ${editValues.matricula || "No detectada"}\nAño Renovado: ${editValues.anio || "No detectado"}\nRazón Social: ${editValues.razon || "No detectada"}\nNIT: ${editValues.nit || "No detectado"}\nDirección: ${editValues.dir || "No detectada"}\nConfianza: ${confidence}%\nTiempo: ${elapsed}s\n\n${"=".repeat(40)}\nTEXTO COMPLETO\n${"=".repeat(40)}\n\n${rawText}`;
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "resultado_ocr.txt"; a.click();
    showToast("📥 Resultados exportados");
  };

  const fields = data ? [
    { icon: Hash, label: "Nro. de matrícula", value: data.matricula, key: "matricula" },
    { icon: CalendarDays, label: "Último año renovado", value: data.anio, key: "anio" },
    { icon: Building2, label: "Razón social", value: data.razon, key: "razon" },
    { icon: Hash, label: "NIT", value: data.nit, key: "nit" },
    { icon: MapPin, label: "Dirección", value: data.dir, key: "dir" },
  ] : [];

  const detectedCount = fields.filter((f) => f.value).length;
  const approvedCount = Object.values(approved).filter(Boolean).length;

  return (
    <DemoLayout title="Demo: OCR de Documentos" subtitle="Extrae información de Cámaras de Comercio colombianas y vincúlala a proveedores" currentPath="/demo-ocr">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-navy text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg">{toast}</motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Info */}
        <DemoCard className="!bg-navy/5 !border-navy/10">
          <div className="flex items-start gap-3">
            <ScanSearch className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-navy mb-1">¿Cómo funciona?</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Sube una imagen (JPG/PNG) de una Cámara de Comercio colombiana. El OCR (Tesseract.js) extraerá
                <strong> matrícula</strong>, <strong>año de renovación</strong>, <strong>razón social</strong>, <strong>NIT</strong> y <strong>dirección</strong>.
                Puedes <strong>aprobar</strong> o <strong>editar</strong> cada campo antes de vincularlos a un proveedor. Si un campo no se detecta, puedes escribirlo manualmente.
              </p>
            </div>
          </div>
        </DemoCard>

        {/* Upload */}
        <DemoCard delay={0.1}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-navy">Subir documento</h3>
            {file && <button onClick={reset} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-navy">
              <RotateCcw className="w-3.5 h-3.5" /> Reiniciar
            </button>}
          </div>
          <UploadArea label="Cámara de Comercio (JPG, PNG o PDF)" accept="image/jpeg,image/png,image/jpg,application/pdf" onFileSelect={handleFile} showPreview />
          {file && !processing && !rawText && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
              <button onClick={processOCR}
                className="w-full inline-flex items-center justify-center gap-2 font-semibold text-sm rounded-xl px-7 py-3.5 bg-accent text-navy hover:bg-accent-dark transition-all">
                <ScanSearch className="w-4 h-4" /> Procesar documento
              </button>
            </motion.div>
          )}
        </DemoCard>

        {/* Loader */}
        <AnimatePresence>
          {processing && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <DemoCard className="text-center">
                <Loader2 className="w-10 h-10 mx-auto text-accent animate-spin mb-3" />
                <p className="text-sm font-bold text-navy mb-1">{pLabel}</p>
                <div className="w-full max-w-xs mx-auto h-2 rounded-full bg-gray-100 overflow-hidden">
                  <motion.div className="h-full rounded-full bg-accent" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-2">{progress}%</p>
              </DemoCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <DemoCard className="!bg-red-50 !border-red-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-red-700">Error</p>
                    <p className="text-xs text-red-600 mt-0.5">{error}</p>
                  </div>
                </div>
              </DemoCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === Results === */}
        {rawText !== null && data && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

            {/* Stats bar */}
            <DemoCard className="!p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span className="text-xs font-bold text-navy">{detectedCount}/{fields.length} detectados</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold text-navy">{approvedCount}/{fields.length} aprobados</span>
                  </div>
                  {confidence !== null && (
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${confidence > 70 ? "bg-accent" : confidence > 40 ? "bg-amber-400" : "bg-red-400"}`} />
                      <span className="text-xs text-gray-500">Confianza: <strong className="text-navy">{confidence}%</strong></span>
                    </div>
                  )}
                  {elapsed && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-500">{elapsed}s</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={exportResults}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors">
                    <Download className="w-3.5 h-3.5" /> Exportar
                  </button>
                  {!linked && (
                    <div className="relative">
                      <button onClick={() => setLinkOpen(!linkOpen)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-navy hover:bg-navy-light px-3 py-1.5 rounded-lg transition-colors">
                        <Link2 className="w-3.5 h-3.5" /> Vincular <ChevronDown className="w-3 h-3" />
                      </button>
                      <AnimatePresence>
                        {linkOpen && (
                          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                            className="absolute right-0 top-9 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 pt-3 pb-1">Vincular a proveedor</p>
                            <div className="max-h-48 overflow-y-auto">
                              {store.providers.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center py-4">No hay proveedores. Crea uno en Demo Rápido.</p>
                              ) : store.providers.map((p) => (
                                <button key={p.id} onClick={() => linkToProvider(p)}
                                  className="w-full text-left px-3 py-2.5 hover:bg-gray-50 border-b border-gray-50 transition-colors">
                                  <p className="text-xs font-semibold text-navy">{p.nombre}</p>
                                  <p className="text-[10px] text-gray-400">{p.nit}</p>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                  {linked && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-dark bg-accent-pale px-3 py-1.5 rounded-lg">
                      <CheckCircle className="w-3.5 h-3.5" /> Vinculado
                    </span>
                  )}
                </div>
              </div>
            </DemoCard>

            {/* === Image preview + Editable fields side by side === */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              {/* Left: document preview */}
              <div className="lg:col-span-2">
                <DemoCard delay={0} className="!p-3 h-full">
                  <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Documento escaneado</span>
                  </div>
                  {previewUrl ? (
                    <img src={previewUrl} alt="Documento" className="w-full rounded-xl object-contain max-h-[480px] bg-gray-50 border border-gray-100" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-60 bg-gray-50 rounded-xl border border-gray-100">
                      <FileSearch className="w-8 h-8 text-gray-300 mb-2" />
                      <p className="text-xs text-gray-400 text-center px-4">Vista previa no disponible para archivos PDF.</p>
                      <p className="text-[10px] text-gray-300 mt-1">El texto fue extraído correctamente.</p>
                    </div>
                  )}
                </DemoCard>
              </div>

              {/* Right: editable fields */}
              <div className="lg:col-span-3 space-y-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Campos extraídos — revisa y aprueba</span>
                  {approvedCount < fields.length && (
                    <button onClick={() => {
                      const allApproved: Record<string, boolean> = {};
                      fields.forEach((f) => { allApproved[f.key] = true; });
                      setApproved(allApproved);
                      showToast("✅ Todos los campos aprobados");
                    }}
                      className="text-[10px] font-semibold text-accent hover:text-accent-dark transition-colors">
                      Aprobar todos
                    </button>
                  )}
                </div>

                {fields.map(({ icon: Icon, label, value, key }, i) => {
                  const isEditing = editMode[key] || false;
                  const isApproved = approved[key] || false;
                  const currentVal = editValues[key] ?? value ?? "";
                  const wasDetected = !!value;

                  return (
                    <motion.div key={key}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      className={`rounded-2xl p-4 border transition-all ${
                        isApproved
                          ? "bg-accent-pale/30 border-accent/20"
                          : currentVal
                            ? "bg-white border-gray-200"
                            : "bg-amber-50/50 border-amber-200/60"
                      }`}>
                      {/* Header row */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${
                            isApproved ? "text-accent" : currentVal ? "text-navy" : "text-amber-500"
                          }`} />
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{label}</span>
                          {!wasDetected && !currentVal && (
                            <span className="text-[8px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">NO DETECTADO</span>
                          )}
                          {wasDetected && !isApproved && !isEditing && (
                            <span className="text-[8px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">POR REVISAR</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {isApproved ? (
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] font-bold text-accent-dark bg-accent-pale px-2 py-0.5 rounded flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> Aprobado
                              </span>
                              <button onClick={() => setApproved((prev) => ({ ...prev, [key]: false }))}
                                className="p-1 hover:bg-gray-100 rounded transition-colors" title="Desaprobar">
                                <X className="w-3 h-3 text-gray-400" />
                              </button>
                            </div>
                          ) : (
                            <>
                              {!isEditing && currentVal && (
                                <button onClick={() => setApproved((prev) => ({ ...prev, [key]: true }))}
                                  className="text-[9px] font-bold text-accent hover:text-accent-dark px-2 py-1 rounded-lg hover:bg-accent-pale/50 transition-colors flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3" /> Aprobar
                                </button>
                              )}
                              <button onClick={() => {
                                setEditMode((prev) => ({ ...prev, [key]: !prev[key] }));
                                setApproved((prev) => ({ ...prev, [key]: false }));
                              }}
                                className="text-[9px] font-bold text-gray-400 hover:text-navy px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1">
                                <Pencil className="w-3 h-3" /> {isEditing ? "Cancelar" : "Editar"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Value / Input */}
                      {isEditing ? (
                        <div className="flex gap-2">
                          <input type="text" value={currentVal}
                            onChange={(e) => setEditValues((prev) => ({ ...prev, [key]: e.target.value }))}
                            placeholder="Escribe el valor manualmente..."
                            className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all" />
                          <button onClick={() => {
                            setEditMode((prev) => ({ ...prev, [key]: false }));
                            setApproved((prev) => ({ ...prev, [key]: true }));
                          }}
                            className="px-4 py-2.5 rounded-xl bg-accent text-navy text-xs font-semibold hover:bg-accent-dark transition-colors flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5" /> Guardar
                          </button>
                        </div>
                      ) : (
                        <p className={`text-sm font-bold ${
                          isApproved ? "text-navy" : currentVal ? "text-navy/80" : "text-amber-600 italic"
                        }`}>
                          {currentVal || "No detectado — haz clic en Editar para escribirlo manualmente"}
                        </p>
                      )}
                    </motion.div>
                  );
                })}

                {/* All approved summary */}
                {approvedCount === fields.length && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 px-4 py-3 bg-accent-pale/40 border border-accent/20 rounded-2xl">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-accent-dark">Todos los campos aprobados</p>
                      <p className="text-[10px] text-accent-dark/70">
                        Puedes vincular estos datos a un proveedor usando el botón superior.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Raw text */}
            <DemoCard>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileSearch className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Texto detectado</span>
                </div>
                <button onClick={copyText}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-400 hover:text-navy transition-colors">
                  {copied ? <><Check className="w-3 h-3 text-accent" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                </button>
              </div>
              <pre className="text-xs text-gray-600 leading-relaxed max-h-52 overflow-y-auto whitespace-pre-wrap font-mono bg-gray-50 rounded-xl p-4">
                {rawText || "Sin texto detectado."}
              </pre>
            </DemoCard>

            {/* Re-process button */}
            <button onClick={() => {
              setRawText(null); setData(null); setLinked(false);
              setEditMode({}); setEditValues({}); setApproved({});
              processOCR();
            }}
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-navy bg-white hover:bg-gray-50 rounded-xl py-2.5 border border-gray-200 transition-colors">
              <RotateCcw className="w-4 h-4" /> Reprocesar documento
            </button>
          </motion.div>
        )}
      </div>

      {/* Click-away for link dropdown */}
      {linkOpen && <div className="fixed inset-0 z-40" onClick={() => setLinkOpen(false)} />}
    </DemoLayout>
  );
}