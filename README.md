# Gestión Documental de Proveedores — Landing Page

Landing page profesional para JP Digital Solutions, presentando la propuesta de **Gestión Documental de Proveedores** para PageGroup.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS 3**
- **Framer Motion** (animaciones al scroll)
- **Lucide React** (íconos)

## Estructura del proyecto

```
landing-proveedores/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
├── public/
└── src/
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    └── components/
        ├── ui.tsx            # Badge, Check, Btn, Logo, Reveal, SectionTag
        ├── Navbar.tsx         # Nav con scroll-spy + menú móvil + sticky CTA
        ├── Hero.tsx           # Sección principal
        ├── Problema.tsx       # Los 5 dolores
        ├── Flujo.tsx          # Diagrama swimlane visual
        ├── Opciones.tsx       # 2 cards de implementación
        ├── Comparativa.tsx    # Tabla comparativa (25 filas)
        ├── Seguridad.tsx      # Seguridad y control
        ├── Costos.tsx         # Precios y modelo
        ├── FAQ.tsx            # Acordeón con 6 preguntas
        ├── CTAFinal.tsx       # CTA de cierre
        ├── Footer.tsx         # Pie de página
        └── BackToTop.tsx      # Botón flotante
```

## Instrucciones para ejecutar

### 1. Copiar la carpeta al destino deseado

```bash
# Windows (PowerShell)
Copy-Item -Recurse landing-proveedores "C:\Users\JuanPablo\Documents\JP-DigitalSolutions\landing-proveedores"
```

### 2. Instalar dependencias

```bash
cd C:\Users\JuanPablo\Documents\JP-DigitalSolutions\landing-proveedores
npm install
```

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### 4. Build para producción

```bash
npm run build
npm start
```

## Personalización rápida

- **Colores**: edita `tailwind.config.ts` → `theme.extend.colors`
- **Contenido**: cada sección es un componente independiente en `src/components/`
- **Precios**: modifica los valores en `Costos.tsx` y `Opciones.tsx`
- **Email de contacto**: busca `mailto:contacto@jpdigital.co` y reemplaza
- **Logo**: personaliza el componente `Logo` en `ui.tsx`

## Características

- ✅ Responsive mobile-first
- ✅ Scroll-spy en navbar
- ✅ Sticky CTA en móvil
- ✅ Animaciones al scroll (framer-motion)
- ✅ Tabla comparativa con header fijo
- ✅ FAQ acordeón interactivo
- ✅ Diagrama de flujo visual (CSS puro)
- ✅ Sin imágenes externas
- ✅ Accesible (aria labels, buen contraste)
