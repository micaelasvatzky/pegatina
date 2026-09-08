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
- **Dashboard (ilustrador)**: `/dashboard`, `/dashboard/stickers`, `/dashboard/stickers/nuevo`, `/dashboard/stickers/[id]` (editar), `/dashboard/pedidos`, `/dashboard/perfil` — layout con `Navbar` (modo dashboard) + `Sidebar` (ver Fase D)
- **Componentes compartidos**: `Navbar.tsx`, `Sidebar.tsx`, `StickerCard.tsx`, `CartDrawer.tsx`, `AuthModal.tsx`, `AddToCartButton.tsx`, `Providers.tsx`
- **Contextos**: `CartContext.tsx` (carrito con localStorage), `AuthContext.tsx` (auth REAL con cookie httpOnly + `demoLogin`)
- **Datos**: `src/lib/types.ts` (DBSticker + Sticker + DBUsuario + Usuario), `src/lib/mongodb.ts` (client Mongo cacheado), `src/lib/data.ts` (queries: stickers por categoría/ilustrador/id, categorías, `getVentasPorStickerId`)

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
- ✅ Nombres de ilustradores como links evidentes (primario + subrayado + ↗ → `/artista/[usuario]`)
- ✅ **RoleModal** (`src/components/RoleModal.tsx`): "¿Qué tipo de cuenta querés?" (Comprador/Ilustrador) al tocar "Creala gratis" en login y en AuthModal. Soporta prop `redirect`
- ✅ **Selector de cantidad** en detalle (`AddToCartButton`) y en cards (`AddToCartCard`); `add(sticker, cantidad)` en CartContext
- ✅ **Botón "Agregar"** en cada card (grilla) + selector de cantidad

### Auth REAL (Fase C — implementado)
- ✅ **Backend**: colección `usuarios` en Mongo (`nombre`, `email`, `password_hash`, `rol`, `foto`, `direccion`, `bio`, `createdAt`) con bcrypt
- ✅ **Sesión**: JWT en cookie httpOnly (`pegatina-sesion`), 7 días, expiración, secreto por backend `jose` (edge)
- ✅ **API routes**: `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `GET /api/pedidos`
- ✅ **Middleware** (`src/middleware.ts` con `jose`): `/dashboard*` solo ilustrador, `/perfil` requiere sesión. Sin sesión → redirige a `/login`
- ✅ **Frontend**: `AuthContext` real (fetch a `/api/auth/me` al montar + login/signup/logout async con manejo de errores). `usuario` + `isLoggedIn` + `loading`
- ✅ **Navbar**: si logueado → avatar (inicial) + primer nombre → link a `/perfil` (comprador) o `/dashboard` (ilustrador); si no → ícono de login. SIN lupa
- ✅ **Login/signup reales**: formularios client con validación + errores + redirección por rol
- ✅ **Página `/perfil`** (comprador): muestra foto (o inicial) + nombre + email + badge rol + últimas compras desde colección `pedidos`. Estado vacío lindo cuando no hay compras

### Dashboard del ilustrador (Fase D — implementado)
- ✅ **Navbar con `mode="store"|"dashboard"`** (`Navbar.tsx`): en dashboard NO hay carrito ni Explorar (el ilustrador vende, no compra). Muestra "Ver mi tienda ↗" (link a `/artista/{handle}` sin @, solo si el usuario tiene @usuario) + avatar. El logo lleva al dashboard.
- ✅ **Sidebar reescrita** (`Sidebar.tsx`): identidad real de la tienda (avatar con inicial + nombre + @handle desde `useAuth`), links con emoji, footer con "Ver tienda pública ↗" y "Cerrar sesión". ELIMINADO el banner vacío `bg-ink` (era el "rectángulo negro" — hoy no existe ningún bloque negro en el dashboard; si se ve, es caché → Ctrl+Shift+R).
- ✅ **Home `/dashboard` REAL** (server component): `getSession` + `getUsuarioById` + `getStickersByIlustrador(handle)` → "Hola, {nombre} 👋" + @handle real + cards de stats (Stickers publicados REAL; Ventas/pedidos placeholder 0 hasta conectar queries de pedidos) + CTA "Subir sticker →".
- ✅ **"Mis stickers" REAL** (`/dashboard/stickers`): stickers del ilustrador logueado desde Mongo, cards `rounded-2xl` con precio es-AR + badge "X vendidos" (aggregate sobre `pedidos` → `getVentasPorStickerId`) + botón "Editar" → `/dashboard/stickers/[id]`. Estado vacío lindo.
- ✅ **Subir sticker REAL**: `POST /api/stickers` (valida sesión + rol ilustrador + categoría real; `ilustrador` = handle del usuario logueado, NUNCA del body). Form `StickerEditorForm.tsx` compartido entre nuevo y editar.
- ✅ **Editar sticker**: `/dashboard/stickers/[id]` (server: verifica dueño, si no → redirect) + `PATCH /api/stickers/[id]` (misma verificación: `sticker.ilustrador === handle`).
- ✅ **Acceso demo**: botón "🎨 Entrar como ilustrador demo" en `/login`, SOLO con `DEMO_MODE=true`. `POST /api/auth/demo` efectúa upsert del usuario demo (`demo@pegatina.app`, @demoilustrador, password aleatoria → no entra por login normal) y siembra 2 stickers demo la primera vez. Sin `DEMO_MODE` → API responde 404 y el botón no se renderiza. Requiere `DEMO_MODE=true` en `.env.local` (Mica debe agregarla).
- ✅ **Handle como identidad**: `DBUsuario.usuario` + `Usuario.usuario` (en `publicUsuario`). `Sticker` serializado incluye `acabado` + `resistente_al_agua`.
- ✅ **Estilo alineado al sistema de marca** en TODAS las páginas del dashboard: cards `rounded-2xl` + border + shadow-sm, botones/inputs `rounded-full`, badges pill con la paleta (naranja/amarillo/azul).

### Pendiente / próximos pasos
- 🔲 **Signup del ilustrador debe pedir el @usuario** (handle único) — hoy solo el demo lo tiene; sin @usuario no se pueden crear/editar stickers (la API lo frena con mensaje claro)
- 🔲 Perfil del ilustrador: guardar cambios REAL (nombre/email/bio) → `PATCH /api/usuarios/me` (hoy es un form estático)
- 🔲 Pedidos del ilustrador: conectar `/dashboard/pedidos` a datos REALES (pedidos que contengan sus stickers) + poder cambiar el estado de envío
- 🔲 Home: ventas del mes y pedidos por enviar con datos REALES (hoy placeholder 0)
- 🔲 Foto de perfil del comprador (subida real de imagen; hoy se muestra la inicial)
- 🔲 Fotos reales de stickers (subida de imagen; hoy emojis placeholder + `foto: ""`)
- 🔲 Logo SVG de Pegatina (Mica lo sube) para Navbar + footer (hoy es texto "Pegatina")
- 🔲 Checkout + pago con Mercado Pago / Mercado Envíos + datos de envío (MARCADO como "otra entrega" por el usuario)
- 🔲 Datos extra de pago: definir campos de envío (comprador) + datos del ilustrador (ej: CBU)
- 🔲 Rotar password de Mongo en Atlas (credencial filtrada en historial) / hacer repo privado ⚠️
- 🔲 Migrar `src/middleware.ts` → `proxy` (convención "middleware" deprecada en Next 16; warning en build)
- 🔲 Refactor opcional: `src/lib/mongodb.ts` lanza al evaluar el módulo si falta `MONGODB_URI` → mover el throw dentro de `getDb()` (perezoso) para builds sin la var
- 🔲 Limpiar usuarios demo de la colección `usuarios` en Atlas cuando se testee

### Usuarios de prueba (crear para testear, NO quedan guardados)
- Se crean desde `/signup/comprador` o `/signup/ilustrador` con un email real de prueba.
- ⚠️ Después del testing, limpiar la colección `usuarios` en Atlas (MongoDB Compass) si se dejaron de prueba.

### Comandos útiles
- Correr dev server: `cd pegatina-app && npm run dev` → `http://localhost:3000`
- Typecheck (sin build): `cd pegatina-app && node node_modules\typescript\bin\tsc --noEmit`
- Git: `main` sincronizado con `origin` (github.com/micaelasvatzky/pegatina.git)

### Nota de encoding (importante)
- NO usar PowerShell `Get-Content`/`Set-Content` para editar archivos con caracteres no-ASCII (acentos, emojis, `•`, `↗`, `−`): corrompe el encoding. Usar las herramientas `write`/`read`/`edit` (UTF-8 garantizado) o `[IO.File]::ReadAllText`/`WriteAllText` con UTF-8 explícito.
