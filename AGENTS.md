# Pegatina — Agent Instructions

## Comandos de Sesión

- **"iniciar sesion"**: Cargar la memoria persistente del proyecto desde Engram (`mem_context` + `mem_search` con keywords del proyecto). Recuperar contexto de sesiones anteriores antes de trabajar.
- **"cerrar sesion"**: Guardar TODO en Engram: decisiones, cambios, descubrimientos, convenciones. Llamar `mem_session_summary` con el formato completo (Goal/Instructions/Discoveries/Accomplished/Next Steps/Relevant Files).

## Reglas Generales

- Conventional commits sin "Co-Authored-By" ni atribución a IA.
- Español rioplatense con voseo.
- No construir/build después de cambios a menos que se pida explícitamente.
- No asumir respuestas — preguntar y esperar.
- Verificar claims técnicos antes de afirmar.

## Identidad de Marca

### Paleta de Colores
- **Naranja** (primario): `#ea7f20`
- **Crema** (fondo): `#fbfae1`
- **Amarillo/Dorado** (acento): `#fdc623`
- **Azul** (secundario): `#71a5ca`

### Tipografías
- **H1 y títulos**: Kids Word
- **Body / todo lo demás**: Montserrat

### Logo
- Pendiente: subir SVG del logo

## Brief del Proyecto

### Qué es Pegatina
Marketplace web donde ilustradores y diseñadores independientes argentinos venden stickers desde su propia tienda virtual, y los compradores acceden a un catálogo centralizado de arte local original.

### Usuarios
- **Ilustradores**: crean y administran su tienda, suben diseños, fijan precios, gestionan pedidos
- **Compradores**: exploran catálogo centralizado, filtran, compran en pesos con envío nacional

### Diferencial
Foco local: mercado argentino, pesos, envío nacional, comunidad de artistas locales curada.

### Monetización
Comisión del 10-15% por venta. El artista no paga nada por tener su tienda activa.

### Stack Tecnológico
- **Frontend**: React + Next.js + TypeScript (SSR)
- **Backend**: Node.js
- **Base de datos**: MongoDB
- **Pagos**: Mercado Pago (comisiones automáticas)
- **Envíos**: Mercado Envíos
- **Auth**: Login con roles diferenciados (ilustrador / comprador)

### Tono de Comunicación
Juvenil e informal, directo y poco técnico. Público objetivo: 18-35 años.

### Plazos
- Inicio: Agosto 2026
- Entrega final: 19 de Noviembre 2026
- 4 meses de desarrollo con instancias de avance mensuales

### Valores
- Autenticidad, Accesibilidad, Independencia, Comunidad

## Estado del Proyecto

### Ubicación
- Proyecto real: `pegatina-app/` (Next.js 16 + TypeScript + Tailwind 4)
- Fuente de verdad de marca: este `AGENTS.md`

### Stack implementado
- **Frontend**: Next.js 16.3.3 + TypeScript + Tailwind 4 (SSR), en `pegatina-app/`
- **Theme/design tokens** en `src/app/globals.css` (`@theme`):
  - `--color-primario` `#ea7f20` (naranja), `--color-crema` `#fbfae1` (fondo), `--color-acento` `#fdc623` (amarillo), `--color-secundario` `#71a5ca` (azul), `--color-ink` `#2c2c2c` (texto), `--color-muted` `#939393`, `--color-line` `#e2e2e2`

### Pantallas construidas (MVP, con paleta de marca aplicada)
- **Store (comprador)**: `/` (landing), `/catalogo`, `/producto/[id]`, `/login`, `/signup/comprador`, `/signup/ilustrador` — layout con `Navbar` + footer
- **Dashboard (ilustrador)**: `/dashboard`, `/dashboard/stickers`, `/dashboard/stickers/nuevo`, `/dashboard/pedidos`, `/dashboard/perfil` — layout con `Navbar` + `Sidebar`
- **Componentes compartidos**: `Navbar.tsx`, `Sidebar.tsx`, `StickerCard.tsx`
- **Datos/dominio**: `src/lib/types.ts` (Sticker, Order, Role, OrderStatus) + `src/lib/mock-data.ts` (mock)

### Pendiente / próximos pasos
- 🔲 Logo SVG de Pegatina (Mica lo sube) para Navbar + footer (hoy es texto "Pegatina")
- 🔲 Auth real con roles + middleware de redirección (login → `/dashboard` si ilustrador, `/catalogo` si comprador) — hoy es solo UI
- 🔲 Backend MongoDB + API REST (hoy es `mock-data.ts`)
- 🔲 Carrito real + checkout con Mercado Pago / Mercado Envíos
- 🔲 Revisión visual del MVP en el navegador (`npm run dev` en `pegatina-app/`)

### Comandos útiles
- Correr dev server: `cd pegatina-app && npm run dev` → `http://localhost:3000`
- Typecheck (sin build): `cd pegatina-app && node node_modules\typescript\bin\tsc --noEmit`
- Git: `main` sincronizado con `origin` (github.com/micaelasvatzky/pegatina.git)

### Nota de encoding (importante)
- NO usar PowerShell `Get-Content`/`Set-Content` para editar archivos con caracteres no-ASCII (acentos, emojis, `•`, `↗`, `−`): corrompe el encoding. Usar las herramientas `write`/`read`/`edit` (UTF-8 garantizado) o `[IO.File]::ReadAllText`/`WriteAllText` con UTF-8 explícito.
