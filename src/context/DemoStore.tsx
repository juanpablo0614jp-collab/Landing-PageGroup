"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

/* ═══════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════ */

export type DocKey = "camara" | "rut" | "bancaria" | "arl" | "poliza";

export type ProviderStatus = "pendiente" | "completo" | "activo" | "bloqueado";

export interface DocInfo {
  uploaded: boolean;
  fileName?: string;
  uploadDate?: string;
  expiryDate?: string;
  ocrData?: { matricula?: string; anioRenovado?: string };
}

export interface Provider {
  id: string;
  nombre: string;
  nit: string;
  correo: string;
  telefono?: string;
  ciudad?: string;
  status: ProviderStatus;
  docs: Record<DocKey, DocInfo>;
  createdAt: string;
  updatedAt: string;
}

export type HistoryAction = "creado" | "documento_subido" | "documento_actualizado" | "estado_cambiado" | "editado" | "eliminado" | "ocr_procesado";

export interface HistoryEntry {
  id: string;
  date: string;
  action: HistoryAction;
  providerId?: string;
  providerName: string;
  detail: string;
}

export interface AlertItem {
  id: string;
  type: "proximo" | "vencido" | "faltante";
  providerId: string;
  provider: string;
  document: string;
  docKey: DocKey;
  date?: string;
}

export interface Notification {
  id: string;
  message: string;
  type: "success" | "warning" | "error" | "info";
  timestamp: string;
  read: boolean;
}

/* ═══════════════════════════════════════════════════
   DOC LABELS
   ═══════════════════════════════════════════════════ */

export const DOC_LABELS: Record<DocKey, string> = {
  camara: "Cámara de Comercio",
  rut: "RUT",
  bancaria: "Certificación Bancaria",
  arl: "Certificación ARL",
  poliza: "Póliza de Responsabilidad",
};

export const REQUIRED_DOCS: DocKey[] = ["camara", "rut", "bancaria"];
export const ALL_DOCS: DocKey[] = ["camara", "rut", "bancaria", "arl", "poliza"];

/* ═══════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════ */

const now = () => new Date().toLocaleString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function emptyDocs(): Record<DocKey, DocInfo> {
  return {
    camara: { uploaded: false },
    rut: { uploaded: false },
    bancaria: { uploaded: false },
    arl: { uploaded: false },
    poliza: { uploaded: false },
  };
}

function computeStatus(docs: Record<DocKey, DocInfo>, currentStatus: ProviderStatus): ProviderStatus {
  if (currentStatus === "bloqueado") return "bloqueado";
  const requiredDone = REQUIRED_DOCS.every((k) => docs[k].uploaded);
  if (currentStatus === "activo") return "activo";
  return requiredDone ? "completo" : "pendiente";
}

/* ═══════════════════════════════════════════════════
   SEED DATA
   ═══════════════════════════════════════════════════ */

function buildSeedDocs(keys: DocKey[], expiryMap?: Partial<Record<DocKey, string>>): Record<DocKey, DocInfo> {
  const docs = emptyDocs();
  for (const k of keys) {
    docs[k] = {
      uploaded: true,
      fileName: `${k}_doc.pdf`,
      uploadDate: "05 Ene 2026, 09:00",
      expiryDate: expiryMap?.[k],
    };
  }
  return docs;
}

const SEED_PROVIDERS: Provider[] = [
  {
    id: "seed-1", nombre: "Suministros del Valle S.A.S.", nit: "900.123.456-7", correo: "contacto@suministrosvalle.co",
    telefono: "310 555 1234", ciudad: "Cali", status: "activo",
    docs: buildSeedDocs(["camara", "rut", "bancaria", "arl", "poliza"], { poliza: "2026-03-01", camara: "2026-12-31" }),
    createdAt: "10 Dic 2025, 08:00", updatedAt: "05 Feb 2026, 14:20",
  },
  {
    id: "seed-2", nombre: "Logística Express Ltda.", nit: "800.987.654-3", correo: "admin@logisticaexpress.com",
    telefono: "321 444 5678", ciudad: "Bogotá", status: "activo",
    docs: buildSeedDocs(["camara", "rut", "bancaria", "arl", "poliza"], { rut: "2026-03-08" }),
    createdAt: "15 Nov 2025, 10:00", updatedAt: "12 Feb 2026, 09:15",
  },
  {
    id: "seed-3", nombre: "Aseo Industrial S.A.", nit: "900.555.111-2", correo: "ventas@aseoindustrial.co",
    telefono: "315 222 3333", ciudad: "Medellín", status: "pendiente",
    docs: buildSeedDocs(["camara", "rut"], {}),
    createdAt: "20 Ene 2026, 14:00", updatedAt: "10 Feb 2026, 16:00",
  },
  {
    id: "seed-4", nombre: "Transportes Rápidos S.A.", nit: "800.222.333-1", correo: "info@transportesrapidos.co",
    telefono: "300 111 9999", ciudad: "Barranquilla", status: "bloqueado",
    docs: buildSeedDocs(["camara", "rut", "bancaria", "arl"], { arl: "2026-01-15" }),
    createdAt: "05 Oct 2025, 09:00", updatedAt: "15 Ene 2026, 11:30",
  },
  {
    id: "seed-5", nombre: "Materiales y Construcciones Ltda.", nit: "900.444.666-8", correo: "compras@matyconstrucc.co",
    ciudad: "Bucaramanga", status: "pendiente",
    docs: buildSeedDocs(["rut"], {}),
    createdAt: "01 Feb 2026, 11:00", updatedAt: "08 Feb 2026, 10:00",
  },
  {
    id: "seed-6", nombre: "Seguridad Total Ltda.", nit: "800.777.888-9", correo: "operaciones@seguridadtotal.co",
    telefono: "318 666 7777", ciudad: "Bogotá", status: "bloqueado",
    docs: buildSeedDocs(["camara", "rut", "bancaria", "arl", "poliza"], { camara: "2025-12-15" }),
    createdAt: "01 Sep 2025, 08:00", updatedAt: "20 Dic 2025, 16:00",
  },
];

const SEED_HISTORY: HistoryEntry[] = [
  { id: "h1", date: "14 Feb 2026, 10:42", action: "documento_subido", providerId: "seed-1", providerName: "Suministros del Valle", detail: "RUT subido por primera vez" },
  { id: "h2", date: "13 Feb 2026, 09:15", action: "documento_actualizado", providerId: "seed-2", providerName: "Logística Express", detail: "Certificación bancaria actualizada" },
  { id: "h3", date: "12 Feb 2026, 16:30", action: "estado_cambiado", providerId: "seed-4", providerName: "Transportes Rápidos", detail: "Bloqueado por certificación ARL vencida" },
  { id: "h4", date: "12 Feb 2026, 14:00", action: "documento_subido", providerId: "seed-3", providerName: "Aseo Industrial", detail: "Cámara de Comercio subida" },
  { id: "h5", date: "11 Feb 2026, 11:20", action: "estado_cambiado", providerId: "seed-6", providerName: "Seguridad Total", detail: "Bloqueado por Cámara de Comercio vencida" },
  { id: "h6", date: "10 Feb 2026, 09:00", action: "documento_actualizado", providerId: "seed-1", providerName: "Suministros del Valle", detail: "Póliza de responsabilidad renovada" },
  { id: "h7", date: "08 Feb 2026, 14:30", action: "creado", providerId: "seed-5", providerName: "Materiales y Construcciones", detail: "Proveedor registrado en el sistema" },
  { id: "h8", date: "05 Feb 2026, 10:00", action: "editado", providerId: "seed-1", providerName: "Suministros del Valle", detail: "Datos de contacto actualizados" },
];

const SEED_ALERTS: AlertItem[] = [
  { id: "a1", type: "proximo", providerId: "seed-1", provider: "Suministros del Valle S.A.S.", document: "Póliza de Responsabilidad", docKey: "poliza", date: "Vence el 01 Mar 2026" },
  { id: "a2", type: "vencido", providerId: "seed-4", provider: "Transportes Rápidos S.A.", document: "Certificación ARL", docKey: "arl", date: "Venció el 15 Ene 2026" },
  { id: "a3", type: "faltante", providerId: "seed-3", provider: "Aseo Industrial S.A.", document: "Certificación Bancaria", docKey: "bancaria" },
  { id: "a4", type: "proximo", providerId: "seed-2", provider: "Logística Express Ltda.", document: "RUT", docKey: "rut", date: "Vence el 08 Mar 2026" },
  { id: "a5", type: "vencido", providerId: "seed-6", provider: "Seguridad Total Ltda.", document: "Cámara de Comercio", docKey: "camara", date: "Venció el 15 Dic 2025" },
  { id: "a6", type: "faltante", providerId: "seed-5", provider: "Materiales y Construcciones Ltda.", document: "Certificación Bancaria", docKey: "bancaria" },
  { id: "a7", type: "faltante", providerId: "seed-5", provider: "Materiales y Construcciones Ltda.", document: "Cámara de Comercio", docKey: "camara" },
];

/* ═══════════════════════════════════════════════════
   CONTEXT
   ═══════════════════════════════════════════════════ */

interface DemoStoreCtx {
  // Data
  providers: Provider[];
  history: HistoryEntry[];
  alerts: AlertItem[];
  notifications: Notification[];

  // Provider CRUD
  addProvider: (data: { nombre: string; nit: string; correo: string; telefono?: string; ciudad?: string }) => Provider;
  updateProvider: (id: string, data: Partial<Pick<Provider, "nombre" | "nit" | "correo" | "telefono" | "ciudad">>) => void;
  deleteProvider: (id: string) => void;
  uploadDocument: (providerId: string, docKey: DocKey, fileName?: string, ocrData?: DocInfo["ocrData"]) => void;
  removeDocument: (providerId: string, docKey: DocKey) => void;
  setProviderStatus: (id: string, status: ProviderStatus) => void;
  approveProvider: (id: string) => void;
  blockProvider: (id: string, reason: string) => void;

  // Alerts
  dismissAlert: (id: string) => void;

  // Notifications
  addNotification: (message: string, type: Notification["type"]) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Reset
  resetAll: () => void;
}

const Ctx = createContext<DemoStoreCtx | null>(null);

export function useDemoStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useDemoStore must be used inside DemoStoreProvider");
  return c;
}

/* ═══════════════════════════════════════════════════
   PROVIDER COMPONENT
   ═══════════════════════════════════════════════════ */

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [providers, setProviders] = useState<Provider[]>(SEED_PROVIDERS);
  const [history, setHistory] = useState<HistoryEntry[]>(SEED_HISTORY);
  const [alerts, setAlerts] = useState<AlertItem[]>(SEED_ALERTS);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addHistoryEntry = useCallback((action: HistoryAction, providerName: string, detail: string, providerId?: string) => {
    setHistory((prev) => [{ id: uid(), date: now(), action, providerId, providerName, detail }, ...prev]);
  }, []);

  const addNotif = useCallback((message: string, type: Notification["type"]) => {
    setNotifications((prev) => [{ id: uid(), message, type, timestamp: now(), read: false }, ...prev]);
  }, []);

  // ── CRUD ──

  const addProvider = useCallback((data: { nombre: string; nit: string; correo: string; telefono?: string; ciudad?: string }) => {
    const p: Provider = {
      id: uid(),
      nombre: data.nombre,
      nit: data.nit,
      correo: data.correo,
      telefono: data.telefono,
      ciudad: data.ciudad,
      status: "pendiente",
      docs: emptyDocs(),
      createdAt: now(),
      updatedAt: now(),
    };
    setProviders((prev) => [p, ...prev]);
    addHistoryEntry("creado", p.nombre, "Proveedor registrado en el sistema", p.id);
    addNotif(`Proveedor "${p.nombre}" registrado`, "success");
    return p;
  }, [addHistoryEntry, addNotif]);

  const updateProvider = useCallback((id: string, data: Partial<Pick<Provider, "nombre" | "nit" | "correo" | "telefono" | "ciudad">>) => {
    setProviders((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      const updated = { ...p, ...data, updatedAt: now() };
      addHistoryEntry("editado", updated.nombre, "Datos del proveedor actualizados", id);
      addNotif(`"${updated.nombre}" actualizado`, "info");
      return updated;
    }));
  }, [addHistoryEntry, addNotif]);

  const deleteProvider = useCallback((id: string) => {
    setProviders((prev) => {
      const found = prev.find((p) => p.id === id);
      if (found) {
        addHistoryEntry("eliminado", found.nombre, "Proveedor eliminado del sistema", id);
        addNotif(`"${found.nombre}" eliminado`, "warning");
      }
      return prev.filter((p) => p.id !== id);
    });
    setAlerts((prev) => prev.filter((a) => a.providerId !== id));
  }, [addHistoryEntry, addNotif]);

  const uploadDocument = useCallback((providerId: string, docKey: DocKey, fileName?: string, ocrData?: DocInfo["ocrData"]) => {
    setProviders((prev) => prev.map((p) => {
      if (p.id !== providerId) return p;
      const newDocs = { ...p.docs, [docKey]: { uploaded: true, fileName: fileName || `${docKey}_doc.pdf`, uploadDate: now(), ocrData } };
      const newStatus = computeStatus(newDocs, p.status);
      addHistoryEntry("documento_subido", p.nombre, `${DOC_LABELS[docKey]} subido`, providerId);
      if (newStatus === "completo" && p.status === "pendiente") {
        addNotif(`"${p.nombre}" tiene toda la documentación requerida`, "success");
      }
      return { ...p, docs: newDocs, status: newStatus, updatedAt: now() };
    }));
    // Remove related faltante alert
    setAlerts((prev) => prev.filter((a) => !(a.providerId === providerId && a.docKey === docKey && a.type === "faltante")));
  }, [addHistoryEntry, addNotif]);

  const removeDocument = useCallback((providerId: string, docKey: DocKey) => {
    setProviders((prev) => prev.map((p) => {
      if (p.id !== providerId) return p;
      const newDocs = { ...p.docs, [docKey]: { uploaded: false } };
      const newStatus = computeStatus(newDocs, p.status === "activo" ? "pendiente" : p.status);
      addHistoryEntry("documento_actualizado", p.nombre, `${DOC_LABELS[docKey]} removido`, providerId);
      return { ...p, docs: newDocs, status: newStatus, updatedAt: now() };
    }));
  }, [addHistoryEntry]);

  const setProviderStatus = useCallback((id: string, status: ProviderStatus) => {
    setProviders((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      addHistoryEntry("estado_cambiado", p.nombre, `Estado cambiado a ${status}`, id);
      addNotif(`"${p.nombre}" → ${status}`, status === "bloqueado" ? "error" : "info");
      return { ...p, status, updatedAt: now() };
    }));
  }, [addHistoryEntry, addNotif]);

  const approveProvider = useCallback((id: string) => {
    setProviderStatus(id, "activo");
  }, [setProviderStatus]);

  const blockProvider = useCallback((id: string, reason: string) => {
    setProviders((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      addHistoryEntry("estado_cambiado", p.nombre, `Bloqueado: ${reason}`, id);
      addNotif(`"${p.nombre}" bloqueado: ${reason}`, "error");
      return { ...p, status: "bloqueado" as ProviderStatus, updatedAt: now() };
    }));
  }, [addHistoryEntry, addNotif]);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const resetAll = useCallback(() => {
    setProviders(SEED_PROVIDERS);
    setHistory(SEED_HISTORY);
    setAlerts(SEED_ALERTS);
    setNotifications([]);
  }, []);

  return (
    <Ctx.Provider value={{
      providers, history, alerts, notifications,
      addProvider, updateProvider, deleteProvider, uploadDocument, removeDocument,
      setProviderStatus, approveProvider, blockProvider,
      dismissAlert,
      addNotification: addNotif, markNotificationRead, clearNotifications,
      resetAll,
    }}>
      {children}
    </Ctx.Provider>
  );
}
