"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, GripVertical, Type, ListChecks, ChevronDown, ChevronUp,
  Save, X, FileText, ToggleLeft, ToggleRight, Download, Eye, ClipboardList,
} from "lucide-react";
import DemoCard from "@/components/DemoCard";
import {
  useFormStore,
  exportAllSubmissionsCSV,
  type FormQuestion,
  type QuestionType,
  type FormOption,
} from "@/lib/formStorage";
import FormViewer from "./FormViewer";

/* ─── Question Editor ─── */

interface QuestionEditorProps {
  question: FormQuestion;
  index: number;
  onChange: (updated: FormQuestion) => void;
  onRemove: () => void;
}

function QuestionEditor({ question, index, onChange, onRemove }: QuestionEditorProps) {
  const [collapsed, setCollapsed] = useState(false);
  const store = useFormStore();

  const updateField = <K extends keyof FormQuestion>(key: K, value: FormQuestion[K]) => {
    onChange({ ...question, [key]: value });
  };

  const addOption = () => {
    const opts = [...(question.options || []), { id: store.createOptionId(), label: "" }];
    updateField("options", opts);
  };

  const updateOption = (optId: string, label: string) => {
    const opts = (question.options || []).map((o) => (o.id === optId ? { ...o, label } : o));
    updateField("options", opts);
  };

  const removeOption = (optId: string) => {
    const opts = (question.options || []).filter((o) => o.id !== optId);
    updateField("options", opts);
  };

  const switchType = (type: QuestionType) => {
    const updated = { ...question, type };
    if (type === "multiple_choice" && (!updated.options || updated.options.length === 0)) {
      updated.options = [
        { id: store.createOptionId(), label: "Opción 1" },
        { id: store.createOptionId(), label: "Opción 2" },
      ];
    }
    onChange(updated);
  };

  const inputCls = "w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all placeholder:text-gray-400";

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50/80 border-b border-gray-100">
        <GripVertical className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pregunta {index + 1}</span>
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => switchType("text")}
            className={`text-[10px] font-semibold px-2 py-1 rounded-md transition-colors ${question.type === "text" ? "bg-accent text-navy" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
            <Type className="w-3 h-3 inline mr-0.5" /> Texto
          </button>
          <button onClick={() => switchType("multiple_choice")}
            className={`text-[10px] font-semibold px-2 py-1 rounded-md transition-colors ${question.type === "multiple_choice" ? "bg-accent text-navy" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
            <ListChecks className="w-3 h-3 inline mr-0.5" /> Múltiple
          </button>
          <button onClick={() => setCollapsed(!collapsed)} className="p-1 hover:bg-gray-200 rounded transition-colors">
            {collapsed ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronUp className="w-3.5 h-3.5 text-gray-400" />}
          </button>
          <button onClick={onRemove} className="p-1 hover:bg-red-50 rounded transition-colors">
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      </div>

      {/* Body */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className="p-3 space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Título de la pregunta *</label>
                <input type="text" value={question.title} onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Ej: ¿Cuántos empleados tiene su empresa?" className={inputCls} />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Descripción / ejemplo (opcional)</label>
                <input type="text" value={question.description || ""} onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Ej: Indique el número total incluyendo contratistas" className={inputCls} />
              </div>

              {/* Options for multiple choice */}
              {question.type === "multiple_choice" && (
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1.5">Opciones</label>
                  <div className="space-y-1.5">
                    {(question.options || []).map((opt, oi) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                        <input type="text" value={opt.label} onChange={(e) => updateOption(opt.id, e.target.value)}
                          placeholder={`Opción ${oi + 1}`}
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-accent/40" />
                        {(question.options || []).length > 1 && (
                          <button onClick={() => removeOption(opt.id)} className="p-1 hover:bg-red-50 rounded transition-colors">
                            <X className="w-3 h-3 text-red-400" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button onClick={addOption}
                    className="mt-2 text-[10px] font-semibold text-accent hover:text-accent-dark flex items-center gap-1 transition-colors">
                    <Plus className="w-3 h-3" /> Agregar opción
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN FORM BUILDER
   ═══════════════════════════════════════════════════ */

export default function FormBuilder() {
  const store = useFormStore();
  const [mode, setMode] = useState<"list" | "create" | "view">("list");
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [viewSubmissionId, setViewSubmissionId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const resetForm = () => {
    setFormName(""); setFormDesc(""); setQuestions([]); setMode("list");
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, {
      id: store.createQuestionId(), title: "", description: "", type: "text", required: true,
    }]);
  };

  const updateQuestion = (idx: number, updated: FormQuestion) => {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? updated : q)));
  };

  const removeQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const saveForm = () => {
    if (!formName.trim()) { showToast("⚠️ Ingresa un nombre para el formulario"); return; }
    if (questions.length === 0) { showToast("⚠️ Agrega al menos una pregunta"); return; }
    const emptyTitle = questions.some((q) => !q.title.trim());
    if (emptyTitle) { showToast("⚠️ Todas las preguntas deben tener título"); return; }
    const emptyOpts = questions.some((q) => q.type === "multiple_choice" && (!q.options || q.options.some((o) => !o.label.trim())));
    if (emptyOpts) { showToast("⚠️ Todas las opciones deben tener texto"); return; }

    store.addTemplate(formName.trim(), formDesc.trim(), questions);
    showToast("✅ Formulario guardado");
    resetForm();
  };

  // Find submission to view
  const viewSub = viewSubmissionId ? store.submissions.find((s) => s.id === viewSubmissionId) : null;
  const viewTpl = viewSub ? store.templates.find((t) => t.id === viewSub.formId) : null;

  /* ─── View: Submission viewer ─── */
  if (viewSub && viewTpl) {
    return <FormViewer submission={viewSub} template={viewTpl} onBack={() => setViewSubmissionId(null)} />;
  }

  /* ─── View: Create form ─── */
  if (mode === "create") {
    return (
      <div className="space-y-4">
        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-navy text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg text-center">{toast}</motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-navy flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-accent" /> Nuevo formulario
          </h3>
          <button onClick={resetForm} className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors">Cancelar</button>
        </div>

        {/* Form meta */}
        <DemoCard delay={0}>
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Nombre del formulario *</label>
              <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)}
                placeholder="Ej: Evaluación de proveedores 2026"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Descripción (opcional)</label>
              <input type="text" value={formDesc} onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Ej: Formulario de datos adicionales para proveedores activos"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent" />
            </div>
          </div>
        </DemoCard>

        {/* Questions */}
        <div className="space-y-2.5">
          <AnimatePresence mode="popLayout">
            {questions.map((q, i) => (
              <QuestionEditor key={q.id} question={q} index={i}
                onChange={(upd) => updateQuestion(i, upd)} onRemove={() => removeQuestion(i)} />
            ))}
          </AnimatePresence>
        </div>

        {/* Add question button */}
        <button onClick={addQuestion}
          className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm font-semibold text-gray-500 hover:border-accent hover:text-accent-dark flex items-center justify-center gap-2 transition-all">
          <Plus className="w-4 h-4" /> Agregar pregunta
        </button>

        {/* Save */}
        {questions.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <button onClick={saveForm}
              className="w-full inline-flex items-center justify-center gap-2 font-semibold text-sm rounded-xl px-7 py-3 bg-accent text-navy hover:bg-accent-dark transition-all">
              <Save className="w-4 h-4" /> Guardar formulario ({questions.length} pregunta{questions.length > 1 ? "s" : ""})
            </button>
          </motion.div>
        )}
      </div>
    );
  }

  /* ─── View: List of templates & submissions ─── */
  return (
    <div className="space-y-4">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-navy text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg text-center">{toast}</motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-navy flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-accent" /> Formularios dinámicos
        </h3>
        <button onClick={() => setMode("create")}
          className="text-xs font-semibold text-white bg-navy hover:bg-navy-light px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Crear formulario
        </button>
      </div>

      {/* Templates */}
      {store.templates.length === 0 ? (
        <DemoCard className="text-center py-6" delay={0}>
          <FileText className="w-8 h-8 mx-auto text-gray-200 mb-2" />
          <p className="text-xs text-gray-400 font-semibold">No hay formularios creados</p>
          <p className="text-[10px] text-gray-300 mt-0.5">Crea uno y aparecerá en el Portal del Proveedor</p>
        </DemoCard>
      ) : (
        <div className="space-y-2">
          {store.templates.map((tpl, i) => {
            const subCount = store.submissions.filter((s) => s.formId === tpl.id).length;
            return (
              <motion.div key={tpl.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <DemoCard className="!p-3" delay={0}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-navy truncate">{tpl.name}</h4>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${tpl.active ? "bg-accent-pale text-accent-dark" : "bg-gray-100 text-gray-400"}`}>
                          {tpl.active ? "ACTIVO" : "INACTIVO"}
                        </span>
                      </div>
                      {tpl.description && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{tpl.description}</p>}
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-gray-400">{tpl.questions.length} pregunta{tpl.questions.length > 1 ? "s" : ""}</span>
                        <span className="text-[10px] text-gray-400">{subCount} respuesta{subCount !== 1 ? "s" : ""}</span>
                        <span className="text-[10px] text-gray-400">{tpl.createdAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => store.toggleTemplate(tpl.id)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title={tpl.active ? "Desactivar" : "Activar"}>
                        {tpl.active ? <ToggleRight className="w-4 h-4 text-accent" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                      </button>
                      <button onClick={() => setDeleteConfirm(tpl.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>

                  {/* Submissions for this template */}
                  {subCount > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Respuestas</p>
                      <div className="space-y-1">
                        {store.submissions.filter((s) => s.formId === tpl.id).slice(0, 5).map((sub) => (
                          <button key={sub.id} onClick={() => setViewSubmissionId(sub.id)}
                            className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors text-left">
                            <div className="flex items-center gap-2 min-w-0">
                              <Eye className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              <span className="text-[10px] font-semibold text-navy truncate">{sub.providerName}</span>
                            </div>
                            <span className="text-[9px] text-gray-400 flex-shrink-0">{sub.submittedAt}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </DemoCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Export all button */}
      {store.submissions.length > 0 && (
        <button onClick={() => { exportAllSubmissionsCSV(store.submissions, store.templates); showToast("📥 CSV exportado"); }}
          className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-navy bg-gray-50 hover:bg-gray-100 rounded-xl py-2.5 transition-colors">
          <Download className="w-3.5 h-3.5" /> Exportar todas las respuestas (CSV)
        </button>
      )}

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setDeleteConfirm(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-base font-bold text-navy mb-2">¿Eliminar formulario?</h3>
              <p className="text-sm text-gray-500 mb-5">Se eliminará el formulario y todas sus respuestas asociadas.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50">Cancelar</button>
                <button onClick={() => { store.deleteTemplate(deleteConfirm); setDeleteConfirm(null); showToast("🗑️ Formulario eliminado"); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600">Eliminar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
