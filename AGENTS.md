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
- **Store (comprador)**: `/` (landing), `/catalogo`, `/producto/[id]`, `/artista/[usuario]`, `/carrito`, `/login`, `/signup/comprador`, `/signup/ilustrador` — layout con `Navbar` + footer + panel de carrito lateral
- **Dashboard (ilustrador)**: `/dashboard`, `/dashboard/stickers`, `/dashboard/stickers/nuevo`, `/dashboard/pedidos`, `/dashboard/perfil` — layout con `Navbar` + `Sidebar`
- **Componentes compartidos**: `Navbar.tsx`, `Sidebar.tsx`, `StickerCard.tsx`, `CartDrawer.tsx`, `AuthModal.tsx`, `AddToCartButton.tsx`, `Providers.tsx`
- **Contextos**: `CartContext.tsx` (carrito con localStorage), `AuthContext.tsx` (auth simulada con flag localStorage)
- **Datos**: `src/lib/types.ts` (DBSticker + Sticker), `src/lib/mongodb.ts` (client Mongo cacheado), `src/lib/data.ts` (queries a colección "stickers")

### Base de datos (MongoDB Atlas)
- **URI**: `process.env.MONGODB_URI` leída de `.env.local` (ver `.env.example`). ⚠️ Credencial ya filtrada en historial de git — pendiente rotar password en Atlas / hacer repo privado
- **DB**: `pegatina`, colección `stickers` (20 docs)
- **Esquema sticker**: `_id`, `nombre`, `precio`, `ilustrador` (@usuario), `categoria`, `foto`, `material`, `resistente_al_agua`, `acabado`
- **Categorías**: Bebidas, Comida, Buenos Aires, Argentina, Animales, Cultura
- **Driver**: `mongodb` instalado en el proyecto

### Funcionalidades implementadas (Fase B)
- ✅ Búsqueda hero → lleva a `/catalogo?q=...`
- ✅ Buscador en catálogo por nombre O ilustrador
- ✅ Filtro por categoría + rango de precios (server-side via searchParams, combinables)
- ✅ StickerCard: fondo neutro + emoji placeholder (fotos reales vienen pronto), solo nombre/precio/ilustrador
- ✅ Perfil de artista público `/artista/[usuario]` con sus stickers (ruta SIN `@`, SEO-friendly)
- ✅ Carrito: panel lateral desplegable + página `/carrito`, persistido en localStorage
- ✅ Modal de login/signup al agregar sin estar logueado (redirige a /login con ?redirect)

### Auth REAL (Fase C — implementado)
- ✅ **Backend**: colección `usuarios` en Mongo (`nombre`, `email`, `password_hash`, `rol`, `foto`, `direccion`, `bio`, `createdAt`) con bcrypt
- ✅ **Sesión**: JWT en cookie httpOnly (`pegatina-sesion`), 7 días, expiración, secreto por backend `jose` (edge)
- ✅ **API routes**: `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `GET /api/pedidos`
- ✅ **Middleware** (`src/middleware.ts` con `jose`): `/dashboard*` solo ilustrador, `/perfil` requiere sesión. Sin sesión → redirige a `/login`
- ✅ **Frontend**: `AuthContext` real (fetch a `/api/auth/me` al montar + login/signup/logout async con manejo de errores). `usuario` + `isLoggedIn` + `loading`
- ✅ **Navbar**: si logueado → avatar (inicial) + primer nombre → link a `/perfil` (comprador) o `/dashboard` (ilustrador); si no → ícono de login. SIN lupa
- ✅ **Login/signup reales**: formularios client con validación + errores + redirección por rol
- ✅ **Página `/perfil`** (comprador): muestra foto (o inicial) + nombre + email + badge rol + últimas compras desde colección `pedidos`. Estado vacío lindo cuando no hay compras

### Pendiente / próximos pasos
- 🔲 Logo SVG de Pegatina (Mica lo sube) para Navbar + footer (hoy es texto "Pegatina")
- 🔲 Conectar `AuthModal` → ya redirige a login; falta completar el flujo de "volver al producto y agregar" tras loguear
- 🔲 Foto de perfil del comprador (subida real de imagen; hoy se muestra la inicial)
- 🔲 Fotos reales de stickers (el usuario las sube, reemplazan emojis placeholder)
- 🔲 Checkout + pago con Mercado Pago / Mercado Envíos + datos de envío (MARCADO como "otra entrega" por el usuario)
- 🔲 Datos extra de pago: definir campos de envío (comprador) + datos del ilustrador (ej: CBU)
- 🔲 Rotar password de Mongo en Atlas (credencial filtrada en historial) / hacer repo privado ⚠️
- 🔲 Perfil/dashboard completo del ILUSTRADOR (usuario dijo "dsp pasamos al usuario ilustrador")

### Usuarios de prueba (crear para testear, NO quedan guardados)
- Se crean desde `/signup/comprador` o `/signup/ilustrador` con un email real de prueba.
- ⚠️ Después del testing, limpiar la colección `usuarios` en Atlas (MongoDB Compass) si se dejaron de prueba.

### Comandos útiles
- Correr dev server: `cd pegatina-app && npm run dev` → `http://localhost:3000`
- Typecheck (sin build): `cd pegatina-app && node node_modules\typescript\bin\tsc --noEmit`
- Git: `main` sincronizado con `origin` (github.com/micaelasvatzky/pegatina.git)

### Nota de encoding (importante)
- NO usar PowerShell `Get-Content`/`Set-Content` para editar archivos con caracteres no-ASCII (acentos, emojis, `•`, `↗`, `−`): corrompe el encoding. Usar las herramientas `write`/`read`/`edit` (UTF-8 garantizado) o `[IO.File]::ReadAllText`/`WriteAllText` con UTF-8 explícito.
