"use client";

import { Badge, Btn } from "./ui";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-navy to-navy-light pt-36 pb-24 px-6 text-center">
      {/* decorative circles */}
      <div className="absolute -top-32 -right-20 w-[400px] h-[400px] rounded-full bg-accent/5" />
      <div className="absolute -bottom-16 -left-24 w-[300px] h-[300px] rounded-full bg-accent/4" />

      <motion.div
        className="max-w-[760px] mx-auto relative"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <Badge>Propuesta para PageGroup</Badge>

        <h1 className="text-[clamp(32px,5vw,52px)] font-extrabold text-white leading-[1.12] mt-5 mb-3 tracking-tight">
          Gestión Documental
          <br />
          de Proveedores
        </h1>

        <p className="text-[clamp(17px,2.2vw,22px)] text-accent font-semibold mb-5">
          Documentación organizada y siempre al día
        </p>

        <p className="text-base text-white/70 max-w-[560px] mx-auto mb-9 leading-relaxed">
          Centraliza la documentación de tus proveedores, controla vigencias y
          reduce el seguimiento manual con un flujo claro de vinculación.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <Btn variant="primary" href="#opciones">
            Ver opciones ↓
          </Btn>
          <Btn
            variant="outline"
            href="mailto:contacto@jpdigitalsolutionscol.com"
            className="!text-white !ring-white/30"
          >
            Agendar reunión
          </Btn>
        </div>
      </motion.div>
    </section>
  );
}
