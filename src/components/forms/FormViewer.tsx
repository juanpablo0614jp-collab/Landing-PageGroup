"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Download, User, Mail, Clock, FileText, CheckCircle, Type, ListChecks } from "lucide-react";
import DemoCard from "@/components/DemoCard";
import { exportSubmissionCSV, type FormSubmission, type FormTemplate } from "@/lib/formStorage";

interface FormViewerProps {
  submission: FormSubmission;
  template: FormTemplate;
  onBack: () => void;
}

export default function FormViewer({ submission, template, onBack }: FormViewerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-navy transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Volver a formularios
        </button>
        <button onClick={() => exportSubmissionCSV(submission, template)}
          className="flex items-center gap-1.5 text-xs font-semibold text-navy bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors">
          <Download className="w-3.5 h-3.5" /> Exportar CSV
        </button>
      </div>

      {/* Header */}
      <DemoCard delay={0}>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-accent" />
          <h3 className="text-sm font-bold text-navy">{submission.formName}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-gray-400" />
            <div>
              <p className="text-[9px] text-gray-400 uppercase tracking-wider">Proveedor</p>
              <p className="text-xs font-semibold text-navy">{submission.providerName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-gray-400" />
            <div>
              <p className="text-[9px] text-gray-400 uppercase tracking-wider">Correo</p>
              <p className="text-xs font-semibold text-navy">{submission.providerEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <div>
              <p className="text-[9px] text-gray-400 uppercase tracking-wider">Enviado</p>
              <p className="text-xs font-semibold text-navy">{submission.submittedAt}</p>
            </div>
          </div>
        </div>
      </DemoCard>

      {/* Answers */}
      <div className="space-y-2.5">
        {template.questions.map((q, i) => {
          const answer = submission.answers[q.id] || "";
          const isMultiple = q.type === "multiple_choice";
          return (
            <motion.div key={q.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <DemoCard className="!p-4" delay={0}>
                <div className="flex items-start gap-2.5">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${isMultiple ? "bg-purple-50" : "bg-blue-50"}`}>
                    {isMultiple ? <ListChecks className="w-3 h-3 text-purple-500" /> : <Type className="w-3 h-3 text-blue-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pregunta {i + 1}</p>
                    <p className="text-xs font-semibold text-navy mt-0.5">{q.title}</p>
                    {q.description && <p className="text-[10px] text-gray-400 mt-0.5 italic">{q.description}</p>}
                    <div className="mt-2 px-3 py-2 rounded-lg bg-accent-pale/30 border border-accent/10">
                      <p className="text-[9px] font-bold text-accent-dark uppercase tracking-wider mb-0.5">Respuesta</p>
                      <p className="text-xs text-navy font-semibold">{answer || <span className="text-gray-400 italic">Sin respuesta</span>}</p>
                    </div>
                  </div>
                  {answer && <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-1" />}
                </div>
              </DemoCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
