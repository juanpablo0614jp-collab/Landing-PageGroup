"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Send, CheckCircle, ClipboardList, Type, ListChecks,
} from "lucide-react";
import DemoCard from "@/components/DemoCard";
import { type FormTemplate } from "@/lib/formStorage";

interface FormStepProps {
  template: FormTemplate;
  onSubmit: (answers: Record<string, string>) => void;
  onCancel: () => void;
}

export default function FormStep({ template, onSubmit, onCancel }: FormStepProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const total = template.questions.length;
  const current = template.questions[step];
  const isLast = step === total - 1;
  const isFirst = step === 0;
  const pct = ((step + 1) / total) * 100;

  const currentAnswer = answers[current?.id] || "";

  const setAnswer = (val: string) => {
    setAnswers((prev) => ({ ...prev, [current.id]: val }));
  };

  const canGoNext = currentAnswer.trim().length > 0;

  const handleNext = () => {
    if (!canGoNext) return;
    if (isLast) {
      setSubmitted(true);
      onSubmit(answers);
    } else {
      setStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) setStep((s) => s - 1);
  };

  /* ─── Submitted success ─── */
  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <DemoCard className="text-center py-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}>
            <CheckCircle className="w-14 h-14 mx-auto text-accent mb-3" />
          </motion.div>
          <h3 className="text-base font-extrabold text-navy mb-1">¡Formulario enviado!</h3>
          <p className="text-xs text-gray-500 mb-4">
            Tus respuestas a <strong>{template.name}</strong> han sido registradas exitosamente.
          </p>
          <button onClick={onCancel}
            className="text-xs font-semibold text-accent hover:text-accent-dark transition-colors">
            Volver a mis documentos
          </button>
        </DemoCard>
      </motion.div>
    );
  }

  if (!current) return null;

  const isMultiple = current.type === "multiple_choice";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-navy">{template.name}</h3>
        </div>
        <button onClick={onCancel} className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors">
          Cancelar
        </button>
      </div>

      {/* Progress */}
      <DemoCard className="!p-3" delay={0}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Pregunta {step + 1} de {total}
          </span>
          <span className="text-[10px] font-bold text-navy">{Math.round(pct)}%</span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
          <motion.div className="h-full rounded-full bg-accent" initial={false}
            animate={{ width: `${pct}%` }} transition={{ duration: 0.35 }} />
        </div>
        {/* Step dots */}
        <div className="flex items-center gap-1 mt-2 justify-center">
          {template.questions.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${
              i === step ? "bg-accent scale-125" : i < step && answers[template.questions[i].id] ? "bg-accent/50" : "bg-gray-200"
            }`} />
          ))}
        </div>
      </DemoCard>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div key={current.id}
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}>
          <DemoCard delay={0}>
            <div className="flex items-start gap-3 mb-4">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${isMultiple ? "bg-purple-50" : "bg-blue-50"}`}>
                {isMultiple ? <ListChecks className="w-4 h-4 text-purple-500" /> : <Type className="w-4 h-4 text-blue-500" />}
              </div>
              <div>
                <h4 className="text-sm font-bold text-navy">{current.title}</h4>
                {current.description && (
                  <p className="text-xs text-gray-400 mt-1 italic">{current.description}</p>
                )}
              </div>
            </div>

            {/* Answer input */}
            {isMultiple ? (
              <div className="space-y-2">
                {(current.options || []).map((opt) => {
                  const selected = currentAnswer === opt.label;
                  return (
                    <button key={opt.id} onClick={() => setAnswer(opt.label)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                        selected
                          ? "border-accent bg-accent-pale/40 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        selected ? "border-accent bg-accent" : "border-gray-300"
                      }`}>
                        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className={`text-sm ${selected ? "font-semibold text-navy" : "text-gray-600"}`}>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <textarea
                value={currentAnswer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Escribe tu respuesta aquí..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all resize-none placeholder:text-gray-400"
              />
            )}
          </DemoCard>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3">
        <button onClick={handlePrev} disabled={isFirst}
          className={`flex-1 inline-flex items-center justify-center gap-2 font-semibold text-sm rounded-xl py-3 border transition-all ${
            isFirst ? "border-gray-100 text-gray-300 cursor-not-allowed" : "border-gray-200 text-navy hover:bg-gray-50"
          }`}>
          <ArrowLeft className="w-4 h-4" /> Anterior
        </button>
        <button onClick={handleNext} disabled={!canGoNext}
          className={`flex-1 inline-flex items-center justify-center gap-2 font-semibold text-sm rounded-xl py-3 transition-all ${
            canGoNext
              ? isLast ? "bg-accent text-navy hover:bg-accent-dark" : "bg-navy text-white hover:bg-navy-light"
              : "bg-gray-100 text-gray-300 cursor-not-allowed"
          }`}>
          {isLast ? <><Send className="w-4 h-4" /> Enviar</> : <>Siguiente <ArrowRight className="w-4 h-4" /></>}
        </button>
      </div>
    </div>
  );
}
