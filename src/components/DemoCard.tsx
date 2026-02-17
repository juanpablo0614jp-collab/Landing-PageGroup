"use client";

import { motion } from "framer-motion";

interface DemoCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function DemoCard({
  children,
  className = "",
  delay = 0,
}: DemoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}
