"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

/* ═══════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════ */

export type QuestionType = "text" | "multiple_choice";

export interface FormOption {
  id: string;
  label: string;
}

export interface FormQuestion {
  id: string;
  title: string;
  description?: string;
  type: QuestionType;
  options?: FormOption[]; // only for multiple_choice
  required?: boolean;
}

export interface FormTemplate {
  id: string;
  name: string;
  description?: string;
  questions: FormQuestion[];
  createdAt: string;
  active: boolean;
}

export interface FormSubmission {
  id: string;
  formId: string;
  formName: string;
  providerId: string;
  providerName: string;
  providerEmail: string;
  answers: Record<string, string>; // questionId -> answer
  submittedAt: string;
}

/* ═══════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════ */

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const now = () => new Date().toLocaleString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const STORAGE_KEY_TEMPLATES = "jp_form_templates";
const STORAGE_KEY_SUBMISSIONS = "jp_form_submissions";

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveToStorage<T>(key: string, data: T) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

/* ═══════════════════════════════════════════════════
   CSV EXPORT
   ═══════════════════════════════════════════════════ */

export function exportSubmissionCSV(submission: FormSubmission, template: FormTemplate) {
  const header = "Nombre Proveedor,Email,Formulario,Pregunta,Respuesta\n";
  const rows = template.questions.map((q) => {
    const answer = submission.answers[q.id] || "";
    return `"${submission.providerName}","${submission.providerEmail}","${submission.formName}","${q.title}","${answer}"`;
  }).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `formulario_${submission.formName.replace(/\s+/g, "_")}_${submission.providerName.replace(/\s+/g, "_")}.csv`;
  a.click();
}

export function exportAllSubmissionsCSV(submissions: FormSubmission[], templates: FormTemplate[]) {
  const header = "Nombre Proveedor,Email,Formulario,Pregunta,Respuesta,Fecha Envío\n";
  const rows: string[] = [];
  for (const sub of submissions) {
    const tpl = templates.find((t) => t.id === sub.formId);
    if (!tpl) continue;
    for (const q of tpl.questions) {
      const answer = sub.answers[q.id] || "";
      rows.push(`"${sub.providerName}","${sub.providerEmail}","${sub.formName}","${q.title}","${answer}","${sub.submittedAt}"`);
    }
  }
  const blob = new Blob([header + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `formularios_completos_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}

/* ═══════════════════════════════════════════════════
   CONTEXT
   ═══════════════════════════════════════════════════ */

interface FormStoreCtx {
  templates: FormTemplate[];
  submissions: FormSubmission[];

  // Admin
  addTemplate: (name: string, description: string, questions: FormQuestion[]) => FormTemplate;
  updateTemplate: (id: string, data: Partial<Pick<FormTemplate, "name" | "description" | "questions" | "active">>) => void;
  deleteTemplate: (id: string) => void;
  toggleTemplate: (id: string) => void;

  // Provider
  submitForm: (formId: string, providerId: string, providerName: string, providerEmail: string, answers: Record<string, string>) => FormSubmission;
  getProviderSubmissions: (providerId: string) => FormSubmission[];
  getActiveTemplates: () => FormTemplate[];
  getProviderPendingForms: (providerId: string) => FormTemplate[];

  // Helpers
  createQuestionId: () => string;
  createOptionId: () => string;
}

const Ctx = createContext<FormStoreCtx | null>(null);

export function useFormStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useFormStore must be used inside FormStoreProvider");
  return c;
}

/* ═══════════════════════════════════════════════════
   PROVIDER
   ═══════════════════════════════════════════════════ */

export function FormStoreProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<FormTemplate[]>(() => loadFromStorage(STORAGE_KEY_TEMPLATES, []));
  const [submissions, setSubmissions] = useState<FormSubmission[]>(() => loadFromStorage(STORAGE_KEY_SUBMISSIONS, []));

  // Persist to localStorage
  useEffect(() => { saveToStorage(STORAGE_KEY_TEMPLATES, templates); }, [templates]);
  useEffect(() => { saveToStorage(STORAGE_KEY_SUBMISSIONS, submissions); }, [submissions]);

  const addTemplate = useCallback((name: string, description: string, questions: FormQuestion[]): FormTemplate => {
    const t: FormTemplate = { id: uid(), name, description, questions, createdAt: now(), active: true };
    setTemplates((prev) => [t, ...prev]);
    return t;
  }, []);

  const updateTemplate = useCallback((id: string, data: Partial<Pick<FormTemplate, "name" | "description" | "questions" | "active">>) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleTemplate = useCallback((id: string) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t)));
  }, []);

  const submitForm = useCallback((formId: string, providerId: string, providerName: string, providerEmail: string, answers: Record<string, string>): FormSubmission => {
    const tpl = templates.find((t) => t.id === formId);
    const sub: FormSubmission = {
      id: uid(), formId, formName: tpl?.name || "Formulario", providerId, providerName, providerEmail, answers, submittedAt: now(),
    };
    setSubmissions((prev) => [sub, ...prev]);
    return sub;
  }, [templates]);

  const getProviderSubmissions = useCallback((providerId: string) => {
    return submissions.filter((s) => s.providerId === providerId);
  }, [submissions]);

  const getActiveTemplates = useCallback(() => {
    return templates.filter((t) => t.active);
  }, [templates]);

  const getProviderPendingForms = useCallback((providerId: string) => {
    const submitted = new Set(submissions.filter((s) => s.providerId === providerId).map((s) => s.formId));
    return templates.filter((t) => t.active && !submitted.has(t.id));
  }, [templates, submissions]);

  return (
    <Ctx.Provider value={{
      templates, submissions,
      addTemplate, updateTemplate, deleteTemplate, toggleTemplate,
      submitForm, getProviderSubmissions, getActiveTemplates, getProviderPendingForms,
      createQuestionId: uid, createOptionId: uid,
    }}>
      {children}
    </Ctx.Provider>
  );
}
