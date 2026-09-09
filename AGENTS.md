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
- ✅ **Middleware** (`src/proxy.ts` con `jose`): `/dashboard*` solo ilustrador, `/perfil` requiere sesión. Sin sesión → redirige a `/login`. **Los ilustradores NO pueden entrar al store del comprador** (proxy 16/09): `/`, `/catalogo`, `/producto/*`, `/carrito`, `/login`, `/signup/*`, `/checkout`, `/pedidos/*`, `/perfil` → redirigen a `/dashboard`. Única excepción: `/artista/[usuario]` (su tienda pública). Navbar: "Explorar" y carrito ocultos para ilustradores logueados.
- ✅ **Frontend**: `AuthContext` real (fetch a `/api/auth/me` al montar + login/signup/logout async con manejo de errores). `usuario` + `isLoggedIn` + `loading`
- ✅ **Navbar**: si logueado → avatar (inicial) + primer nombre → link a `/perfil` (comprador) o `/dashboard` (ilustrador); si no → ícono de login. SIN lupa
- ✅ **Login/signup reales**: formularios client con validación + errores + redirección por rol
- ✅ **Página `/perfil`** (comprador): muestra foto (o inicial) + nombre + email + badge rol + últimas compras desde colección `pedidos`. Estado vacío lindo cuando no hay compras

### Dashboard del ilustrador (Fase D — implementado)
- ✅ **Navbar con `mode="store"|"dashboard"`** (`Navbar.tsx`): en dashboard NO hay carrito ni Explorar (el ilustrador vende, no compra). Solo avatar. El logo lleva al dashboard. (La tienda pública se accede desde el Sidebar.)
- ✅ **Sidebar reescrita** (`Sidebar.tsx`): identidad real de la tienda (avatar con inicial + nombre + @handle desde `useAuth`), links con ÍCONOS SVG (sin emojis), footer con "Ver tienda pública ↗" y "Cerrar sesión" CON modal de confirmación → redirige a `/login`. Responsive: `w-20` iconos-only en mobile, `w-72` en desktop.
- ✅ **Home `/dashboard` REAL** (server component): `getSession` + `getUsuarioById` + `getStickersByIlustrador(handle)` → "Hola, {nombre}" + @handle real + cards de stats con datos REALES (`getVentasDelMes` + `getPedidosPorEnviar`) + CTA "Subir sticker →".
- ✅ **"Mis stickers" REAL** (`/dashboard/stickers`): stickers del ilustrador logueado desde Mongo, cards `rounded-2xl` con precio es-AR + badge "X vendidos" (aggregate sobre `pedidos` → `getVentasPorStickerId`) + botón "Editar" → `/dashboard/stickers/[id]` + botón "Eliminar". Estado vacío lindo. **Cards chicas** (grid-cols 2/3/4, gap-4, padding compacto) y **SIN links al producto** (el ilustrador no navega el store; se previsualiza por la tienda pública).
- ✅ **Subir sticker REAL**: `POST /api/stickers` (valida sesión + rol ilustrador + categoría real; `ilustrador` = handle del usuario logueado, NUNCA del body). Form `StickerEditorForm.tsx` compartido entre nuevo y editar.
- ✅ **Editar sticker**: `/dashboard/stickers/[id]` (server: verifica dueño, si no → redirect) + `PATCH /api/stickers/[id]` (misma verificación: `sticker.ilustrador === handle`).
- ✅ **Acceso demo**: botón "Entrar como ilustrador demo" en `/login`, SOLO con `DEMO_MODE=true`. `POST /api/auth/demo` efectúa upsert del usuario demo (`demo@pegatina.app`, @demoilustrador, password aleatoria → no entra por login normal) y siembra 2 stickers demo la primera vez. **Cookie demo expira en 1 hora** (no queda logueada por 7 días). Sin `DEMO_MODE` → API responde 404 y el botón no se renderiza.
- ✅ **Handle como identidad**: `DBUsuario.usuario` + `Usuario.usuario` (en `publicUsuario`). `Sticker` serializado incluye `acabado` + `resistente_al_agua`.
- ✅ **Estilo alineado al sistema de marca** en TODAS las páginas del dashboard: cards `rounded-2xl` + border + shadow-sm, botones/inputs `rounded-full`, badges pill con la paleta (naranja/amarillo/azul).

### Sesión 9/9 — Logo, read-only, auth ilustrador, UX (implementado)
- ✅ **Logo SVG en navbar + footer**: `public/logo.svg` (subido por Mica). Navbar `h-10 md:h-12`, footer `h-14`. Reemplaza al texto "Pegatina".
- ✅ **Carrito solo para compradores logueados**: en el store, el botón del carrito se renderiza solo si `isLoggedIn && rol !== "ilustrador"`. Sin sesión no aparece (antes estaba siempre).
- ✅ **Tienda pública del artista READ-ONLY** (`/artista/[usuario]`): `StickerCard` acepta prop `readOnly` → sin carrito, sin links (imagen/nombre no clickeables). La vista es puramente informativa: "cómo un comprador vería la tienda del ilustrador".
- ✅ **Signup ilustrador pide @usuario** (handle único): campo en el form + validación en `POST /api/auth/signup` (3-24 chars, letras/números/_, único, se guarda con @). Sin esto no se podían crear stickers (la API lo frenaba). AuthContext `signup()` acepta `usuario?: string`.
- ✅ **Pedidos del ilustrador**: tabla con columnas separadas (items/estado) y colores semáforo: `pending` rojo, `in_progress` amarillo, `shipped` verde, `delivered` azul. Responsive (cards apiladas en mobile, filas en desktop).
- ✅ **Emojis → SVG icons en toda la UI de control** (sidebar, dashboard stats, modales Auth/Role, formularios, estados vacíos, envíos). Se mantienen emojis SOLO en las cards/thumbnails de producto (placeholder de imagen hasta que haya fotos) y en los stickers decorativos del hero.
- ✅ **Hero animado**: keyframes `flotar`/`flotar-suave`/`aparecer-arriba` en `globals.css` + stickers flotantes decorativos (solo desktop).
- ✅ **Responsive completo**: landing (grids 1→2→4), catálogo (filtros apilados en mobile), producto (galería full-width), carrito (cards que wrappean), login/signup (`p-6 md:p-10`), dashboard (`p-4 md:p-8`, sidebar iconos-only en mobile).
- ✅ **Login/signup comprador → `/catalogo`** (no a la home). Ilustrador sigue yendo a `/dashboard`.
- ✅ **Carrito ligado a la sesión**: el carrito pertenece a UNA identidad (CartProvider escucha `useAuth`). Al iniciar sesión arranca vacío y al cerrar sesión se limpia (items + localStorage + drawer cerrado). Al refrescar con la misma sesión se conserva. Invitados no pueden agregar (lo bloquean los AddToCart*).
- ✅ **Botón "Cerrar sesión" en `/perfil`** (comprador): componente client `LogoutButton.tsx` con confirmación (Sí, salir / Cancelar) → `/login`.

### Post 9/9 — Perfil real, pedidos reales, deuda técnica (implementado)
- ✅ **Perfil del ilustrador REAL**: `PATCH /api/usuarios/me` (valida sesión; nombre ≥ 2 chars, email con formato y ÚNICO entre otros usuarios, bio ≤ 300; el @usuario NO se puede editar — es identidad) + `MiPerfilForm.tsx` client (edita nombre/email/bio, muestra handle read-only, mensajes error/success) + `AuthContext.refreshMe()` para refrescar navbar/sidebar al guardar.
- ✅ **Pedidos del ilustrador REALES**: `getPedidosDelVendedor(handle)` en `data.ts` (filter `$or`: `items.ilustrador === handle` o `items.sticker_id ∈ ids` de sus stickers) + `PATCH /api/pedidos/[id]` (solo ilustrador, verifica pertenencia con el MISMO filtro, estados whitelist) + página `/dashboard/pedidos` server component con datos de Mongo (columna Cliente con nombre/email via lookup de `usuarios`, fecha, total es-AR, selector de estado client → `router.refresh()`).
- ✅ **Home del dashboard REAL**: `getVentasDelMes(handle)` (suma de totales de pedidos con sus stickers con `fecha >= 1er día del mes`) + `getPedidosPorEnviar(handle)` (estados pending/in_progress, acepta también español viejo) → stats "Ventas del mes" y "Pedidos por enviar" con números reales.
- ✅ **Convención de estados unificada** (`src/lib/pedidos.ts`): nuevo módulo con `PedidoEstado` (`pending|in_progress|shipped|delivered`), `normalizarEstado()` (acepta inglés O español viejo), `ESTADO_LABEL` (español), `ESTADO_STYLE` (semáforo). DB guarda INGLÉS. `types.ts` actualizado (Pedido.estado), perfil comprador usa `ESTADO_LABEL[normalizarEstado(...)]`.
- ✅ **Deuda técnica**: `src/middleware.ts` → `src/proxy.ts` (convención Next 16, export `proxy`, matcher igual) y `src/lib/mongodb.ts` con throw perezoso dentro de `getDb()` (builds sin MONGODB_URI no explotan al importar).
- ✅ **Limpieza**: eliminado `src/lib/mock-data.ts` + tipos `Order`/`OrderStatus` (sin uso).
- ✅ **Seed de pedidos demo**: `scripts/seed-pedidos-demo.mjs` (node, lee .env.local, idempotente) — crea pedidos para `@demoilustrador` con estados y fechas variadas (2 del mes, 2 de meses pasados). ⚠️ Convención CRÍTICA: el handle en la DB se guarda CON `@` en stickers, usuarios Y pedidos (items.ilustrador) — nunca sacarle el @ en queries internas.

### Checkout + seguimiento sin Mercado Pago (implementado)
- ✅ **Decisión de producto**: sin Mercado Pago el pago es por **transferencia** — el comprador confirma, el pedido nace `pending`, y el ilustrador le pasa sus datos de transferencia (lo aclara la UI del checkout y del seguimiento).
- ✅ **POST /api/pedidos** (crea pedido REAL): recalcula precios EN EL SERVER contra la DB (nunca confía en el cliente); valida items, cantidades ≥ 1 y campos de envío (nombre/calle/ciudad/provincia/código postal); guarda `usuario_id`, `items[]` (con `ilustrador` CON @), `envio{}`, `metodo_pago: "transferencia"`, `total`, `estado: "pending"`, `fecha: Date`.
- ✅ **`/checkout`** (protegido por proxy): `CheckoutForm.tsx` client con datos de envío (select de provincias argentinas), notas opcionales, resumen del carrito, aviso "Pago por transferencia". Al confirmar → `empty()` del carrito → `router.replace(/pedidos/[id]?comprado=1)`.
- ✅ **`/pedidos/[id]`** (seguimiento, protegido): server component que verifica OWNER (`usuario_id === session.sub`, si no `notFound()`); timeline visual de 4 pasos (pending→in_progress→shipped→delivered con conectores), badge semáforo, detalle de items + total, tarjeta de envío, banner "compra confirmada" solo con `?comprado=1`.
- ✅ **Conexiones**: `/carrito` pasó de "Continuar a la compra" (openCart) → Link "Finalizar compra" a `/checkout`; `/perfil` comprador linkea cada pedido (#ID + "Ver seguimiento →") a `/pedidos/[id]`.
- ✅ **Proxy**: matcher ahora es `["/dashboard/:path*", "/perfil", "/checkout", "/pedidos/:path*"]` — sin sesión → `/login?redirect=...`.
- ✅ **Fotos del sticker (hasta 4, URLs)**: `StickerEditorForm` (nuevo + editar) tiene slots dinámicos con botón "+ Agregar otra foto" (máx 4), quitar por slot (✕) y thumb preview por slot; `POST`/`PATCH /api/stickers` aceptan y validan `fotos[]` (cada URL http/https, máx 4) y guardan `fotos` + `foto: fotos[0]` (portada, compat); `StickerCard` muestra la portada, `/producto/[id]` muestra foto principal + hasta 3 miniaturas reales. Cuando Cloudinary esté listo, este input pasa a upload directo.
- ✅ **Detalle del sticker inteligente**: en `/producto/[id]`, si el visitante logueado es el DUEÑO del sticker (ilustrador con mismo @usuario) se muestra SOLO el botón "Editar sticker" (→ `/dashboard/stickers/[id]`) — sin carrito. Se eliminó el botón decorativo "Comprar ahora" (hacía nada). El AddToCartButton agrega y abre el drawer solo en contexto comprador/invitado.
- ✅ **El ilustrador SOLO vende (decisión de Mica)**: `AddToCartButton` y `AddToCartCard` muestran un aviso "Modo vendedor" en vez del botón de compra si el usuario logueado es ilustrador; `POST /api/pedidos` rechaza con 403 a cualquier sesión con rol `ilustrador`.
- ✅ **Eliminar stickers (ilustrador)**: `DELETE /api/stickers/[id]` (solo dueño con mismo @usuario: 401 sin sesión, 403 no-ilustrador o ajeno, 404 inexistente; borra el doc físico — los pedidos conservan nombre/precio snapshot) + `EliminarStickerButton.tsx` (confirmación inline "Sí, eliminar / Cancelar", ícono de alerta, refresca la grid con `router.refresh()`).
- ✅ **Imágenes de stickers completas**: todos los contenedores de imagen pasaron a `object-contain` (la foto se achica para verse entera, no se recorta) + cards con `aspect-square` (StickerCard de catálogo, grid de Mis stickers, galería del producto con miniaturas, previews del form). La grid de `/dashboard/stickers` ahora muestra la FOTO real (antes emoji 🎨).
- ✅ **Stickers verticales cuadrados con c_pad (09/09)**: 6 stickers con ratio ≠ 1 (Messi Topo Gigio 0.56, Snoopy 0.67, Argentina en el Corazón 0.71, Ancho de Espada 0.71, Obelisco 0.80, Matecito 0.92) tocaban los bordes del contenedor. Aplicado `c_pad,w_600,h_600,b_auto` en la URL (relleno del color de borde de la imagen) → todas quedan 600×600 y ninguna toca márgenes. Miniaturas del producto con `p-1`.

### Pendiente / próximos pasos
- 🔲 **Mercado Pago / Mercado Envíos** (pago online + etiquetas/envíos REALES — NO implementado a propósito, Mica lo marcó para más adelante)
- 🔲 **Cloudinary**: cuenta de Mica (cloud `w7w3bhqs`, credenciales en `.env.local` + faltan en env vars de Vercel). Todas las fotos de `imgStickers/` subidas y **mapeadas con correcciones de Mica (09/09)**: `messi.png`→Messi Topo Gigio, `corazon.png`→Argentina en el Corazón, `mate argentino.png`→Matecito Argentino, `alfajor.png`→Alfajor de Chocolate, etc. (scripts `upload-cloudinary.mjs` + `apply-fotos.mjs` + `apply-fotos-mica.mjs`). 🗑 **"Perro salchicha" y "Messi con la Copa del Mundo" @demoilustrador ELIMINADOS** (pedidos de Mica) — quedan **22 stickers, TODOS con foto** (healthcheck de URLs verificado 09/09: todas 200). ⚠️ **`Bandera Argentina`, `Termo y Mate` y (antes) `Gato con Camiseta` apuntaban a `https://example.com/...`** (placeholders pegados en Mongo, dominios falsos → 404). ✅ Gato corregido → gato.png de imgStickers (ccat8vd0d3kzvr00lkty.png). ✅ **Termo y Bandera resueltos 09/09**: Mica subió `termo.png` y `bandera.png` a imgStickers → subidos a Cloudinary (ixain0pa1xxo9lsyxvwa.png y azclvjasrjxgdfgunamh.png) y mapeados. Healthcheck final: **22/22 fotos 200 OK**. ⚠️ Foto `quilmes.png` en Cloudinary sin usar (Mica lo cambió por messi.png). ✅ **Upload directo implementado**: `POST /api/upload` (solo ilustrador, firma SHA-1 server-side, valida tipo/tamaño ≤5MB, folder "stickers") + botón de subir (ícono ↑) en cada slot de fotos del `StickerEditorForm`. 🔲 Falta: agregar `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET` a Vercel (sin CLI local: desde dashboard Vercel → Project settings → Environment Variables). Fotos huérfanas opcionales de borrar: `quilmes.png`, `argentina.png`, `mate.png` (reemplazadas) y 4 de imgStickers sin usar (`corazon.png` estaba... verificar).
- 🔲 Datos de pago del ilustrador (ej: CBU/alias para que el comprador le transfiera — hoy el checkout dice "el artista te pasa sus datos")
- 🔲 Rotar password de Mongo en Atlas ya HECHO por Mica — verificar que `.env.local` tenga la URI nueva ⚠️
- 🔲 Limpiar usuarios/pedidos demo en Atlas cuando se testee

### Usuarios de prueba (crear para testear, NO quedan guardados)
- Se crean desde `/signup/comprador` o `/signup/ilustrador` con un email real de prueba.
- ⚠️ Después del testing, limpiar la colección `usuarios` en Atlas (MongoDB Compass) si se dejaron de prueba.

### Comandos útiles
- Correr dev server: `cd pegatina-app && npm run dev` → `http://localhost:3000`
- Typecheck (sin build): `cd pegatina-app && node node_modules\typescript\bin\tsc --noEmit`
- Git: `main` sincronizado con `origin` (github.com/micaelasvatzky/pegatina.git)

### Nota de encoding (importante)
- NO usar PowerShell `Get-Content`/`Set-Content` para editar archivos con caracteres no-ASCII (acentos, emojis, `•`, `↗`, `−`): corrompe el encoding. Usar las herramientas `write`/`read`/`edit` (UTF-8 garantizado) o `[IO.File]::ReadAllText`/`WriteAllText` con UTF-8 explícito.
