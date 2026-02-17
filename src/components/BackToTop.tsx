"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const fn = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Volver arriba"
      className="fixed bottom-20 lg:bottom-6 right-5 z-50 w-11 h-11 rounded-full bg-navy text-white flex items-center justify-center shadow-lg hover:bg-navy-light transition-colors"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
