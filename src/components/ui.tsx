"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

/* ─── Badge ─── */
export function Badge({
  children,
  variant = "green",
}: {
  children: React.ReactNode;
  variant?: "green" | "navy";
}) {
  return (
    <span
      className={`inline-block text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-full ${
        variant === "navy"
          ? "bg-navy/10 text-navy"
          : "bg-accent-pale text-accent-dark"
      }`}
    >
      {children}
    </span>
  );
}

/* ─── Check icon ─── */
export function Check({ ok = true }: { ok?: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
        ok
          ? "bg-accent-pale text-accent-dark"
          : "bg-gray-100 text-gray-400"
      }`}
    >
      {ok ? "✓" : "—"}
    </span>
  );
}

/* ─── Section tag ─── */
export function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold tracking-widest uppercase text-accent mb-2">
      {children}
    </p>
  );
}

/* ─── Button ─── */
export function Btn({
  children,
  variant = "primary",
  href,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "dark";
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  const base =
    "inline-flex items-center gap-2 font-semibold text-sm rounded-xl px-7 py-3.5 transition-all duration-200 no-underline cursor-pointer border-none";
  const styles = {
    primary: `${base} bg-accent text-navy hover:bg-accent-dark`,
    outline: `${base} bg-transparent ring-2 ring-gray-200 text-navy hover:ring-accent`,
    dark: `${base} bg-navy text-white hover:bg-navy-light`,
  };

  const cls = `${styles[variant]} ${className}`;

  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <button onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

/* ─── Logo ─── */
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-extrabold bg-gradient-to-br from-navy to-accent">
        JP
      </div>
      <span
        className={`font-bold text-sm tracking-tight ${
          light ? "text-white" : "text-navy"
        }`}
      >
        JP Digital Solutions
      </span>
    </div>
  );
}

/* ─── Reveal on scroll ─── */
export function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
