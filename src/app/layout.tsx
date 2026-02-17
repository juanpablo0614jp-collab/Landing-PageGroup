import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gestión Documental de Proveedores — JP Digital Solutions",
  description:
    "Centraliza la documentación de tus proveedores, controla vigencias y reduce el seguimiento manual.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
