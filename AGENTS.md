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

### Design system neo-brutalista de Stitch (14/09 — primera pasada aplicada y commiteada d3a2d43)
- **Origen**: Mica pasó 4 HTML de referencia de Google Stitch (landing, catálogo, producto, perfil artista). El `home.html` completo quedó guardado en `pegatina-app/referencia-stitch/home.html` (referencia de diseño, no es parte de la app). Los otros 3 HTML ESTÁN SOLO EN EL CHAT — si se pierden, pedírselos de nuevo a Mica.
- **Tokens en `globals.css`** (`@theme`): `paper` #faf6ee (fondo), `card` #ffffff, `ink` #1b1b1c (texto), `line` #1e1e1e (bordes), `primario` #ea7f20 (naranja), `acento` #fec724 (amarillo), `secundario` #2c6385 (azul), `terracotta` #944a00, `secondary` #775a00, `lilac` #eadef7, `mint` #d7ebd9, `wash` #e5eef5, `muted` #4f4633. Fuentes: **Epilogue** (display/títulos) + **Work Sans** (body) en `layout.tsx`.
- **Utilities** en `globals.css`: `nb-shadow` / `nb-shadow-sm` / `nb-shadow-md` / `nb-shadow-lg`, `nb-lift`, `nb-stamp`, `nb-washi`.
- **Mapeo Stitch → nosotros**: `bg-paper-canvas`→`bg-paper`; `bg-paper-card`→`bg-card`; `text-stamp-ink`/`text-on-surface`/`text-ink-black`→`text-ink`; `bg-primary-container`→`bg-primario`; `bg-secondary-container`→`bg-acento`; `border-[2px] border-[#1E1E1E]`→`border-2 border-line`; `shadow-[4px_4px_0px_#1E1E1E]`→`nb-shadow`; `shadow-[6px_6px_0px_]`→`nb-shadow-md`; `rounded-[24px]`→`rounded-2xl`; `font-headline-xl`→`h1 font-display`.
- **Iconos**: los HTML de Stitch usan Material Symbols (`material-symbols-outlined`). Verificar si `layout.tsx` carga esa fuente o reemplazar por iconos SVG existentes.
- **EXCLUSIONES de Mica (NO agregar)**: (1) nav sin rutas inexistentes (Arte DIY, Ilustradores, Feria Virtual, Abrí tu tienda, FAQ — solo rutas reales); (2) landing sin sección "¿Sos ilustrador o hacés microediciones gráficas?"; (3) catálogo sin banner "Comprás directo al mesón de cada dibujante"; (4) perfil artista sin banner "Cada calcomanía apoya el trabajo de dibujantes de acá"; (5) NO usar la palabra **"microediciones"** en ningún lado (incluye footer de Stitch — adaptar copy); (6) sin card "encargo personalizado" en perfil artista.
- **Stats**: "85% directo al autor" es REAL (comisión 15%). Stats decorativas de Stitch (4.9/5, +14.000, "22 piezas", "450 stickers") → adaptar a datos reales o eliminar. Promos (15% OFF 5+, cupón PEGATINERO, envío gratis $18.000/$2.000) NO se implementan — no existen cupones/descuentos en el sistema.
- **LOGO**: `fotos/LogoPegatina.svg` subido y commiteado (pendiente mover a `public/` o referenciar donde corresponda).

### Reescritura fiel a Stitch (IMPLEMENTADO — 16/09, segunda pasada)
- ✅ **`StickerCard.tsx`**: estilo Stitch — chip de categoría con color por categoría (Bebidas azul, Comida naranja, BsAs/Argentina wash, Animales mint, Cultura lilac), material, autor link azul con ↗, precio `$X ARS`, stepper + botón "Agregar" (vía `AddToCartCard`), modo `readOnly` (página artista, sin links ni carrito).
- ✅ **`(store)/page.tsx`** (landing): notification tape (sin promos inventadas), hero badge "Feria Activa · N pieces en catálogo" (real), headline "Arte local en stickers & calcos" con subrayado amarillo, pills reales (vinilo/a prueba de mate/envíos federales), 3-panel showcase (Top del mes real por ventas + CTA "Pegá arte en tu vida" + "85% directo al autor" REAL), search strip estilo Stitch, destacados con StickerCards, tape #2 "¿Pedís para un grupo?", categorías tiles con emoji+count real desde `getCategoriasConConteo`, sello circular giratorio (animación `anim-girar-lento` en globals.css).
- ✅ **`(store)/catalogo/page.tsx`**: title bar "Feria de Stickers" na bg-primario con breadcrumbs, FERIA ACTIVA badge, "85% directo al autor" (real), sidebar (Libreta de Stickers, buscador, categorías con conteo REAL, precio radio), sort funcional client via `OrdenarSelect.tsx` (destacados/precio asc/desc/alfabético), grid StickerCards, pagination real ("Mostrando N de N"), banner "Comprás directo al mesón de cada dibujante" + CTA ilustrador (ambos fieles a Stitch — Mica pidió "todo como stitch" y dijo qué sacar después).
- ✅ **`(store)/producto/[id]/page.tsx`**: breadcrumbs, badges técnicos reales (resistente al agua / acabado / hecho en Argentina), autor chip con avatar real (`getUsuarioPorHandle`), ficha técnica real (material/acabado/agua/categoría), precio display grande, stepper + AddToCartButton amarillo, esDueño → "Editar sticker", shipping (envío gratis +$2.000, 3-7 días, devoluciones 10 días, 85% al autor), Artist Spotlight real (nombre/bio/foto desde Mongo + métricas reales: stickers del mesón, unidades vendidas), related reales (misma categoría).
- ✅ **`(store)/artista/[usuario]/page.tsx`**: breadcrumb "← Volver al catálogo", hero banner primario con dots, card flotante del artista (avatar foto real o inicial, badges PRO/Sticker Maker/Feria Activa, handle, nombre real, bio real, tags), métricas reales (stickers activos, unidades vendidas SUMADAS de `getVentasPorStickerId`, 85% al autor), grid readOnly con StickerCards, banner INK "85% DIRECTO AL ARTISTA" + CTA abrir tienda, otros artistas reales (`getIlustradoresUnicos`).
- ✅ **Footer multi-column** en `(store)/layout.tsx`: logo + descripción (sin "microediciones"), badges (Hecho a mano/Tiradas cortas/Feria federal), columnas Explorar/Artistas/Ayuda con links SOLO a rutas reales, barra inferior con copyright.
- ✅ **`globals.css`**: agregado `@keyframes girar` + clase `.anim-girar-lento` (sello circular landing).
- ✅ **`auth.ts`**: nuevo helper `getUsuarioPorHandle(handle)` (busca en `usuarios` por `usuario` campo, CON @).
- ✅ **`data.ts`**: nuevos `getCategoriasConConteo()` (aggregate `$group` por categoría) y `getIlustradoresUnicos()` (handles con count).
- ⚠️ **Nota de decisión**: las secciones que Mica excluyó en la sesión del 14/09 (¿Sos ilustrador? en landing, "Comprás directo al mesón" en catálogo, "Cada calcomanía apoya..." en perfil) fueron INCLUIDAS en esta pasada porque Mica pidió el 16/09 "hace todo como stitch... lo demás después de que termines te marco que tenés que ir sacando". ✅ **YA MARCADAS (16/09 tarde)**: Mica pidió sacar tape #2, pills extra, chips de categoría, "Libreta de Stickers", banner "Comprás directo al mesón", "85% directo al autor" de TODO el store, métricas del perfil artista y manifest 85% (ver pasada 3 abajo). NO se incluyó en ninguna pasada: card "encargo personalizado" (vetada explícitamente + botón sin ruta) ni stats inventadas (4.9/5, +14.000, stock 24u, "450 piezas").
- ✅ `npx tsc --noEmit` SIN errores (16/09).

### Ajustes post-pasada (IMPLEMENTADO — 16/09, tercera pasada, pendiente de commit)
- ✅ **Carrito de UN SOLO artista** (decisión de Mica): el carrito solo puede contener stickers del MISMO ilustrador (el envío lo hace el artista, no se mezclan mesones). `CartContext.add()` ahora devuelve `{ ok: boolean; otroArtista?: string }` y valida contra el primer item (`items[0].sticker.ilustrador`). `AddToCartCard` y `AddToCartButton` muestran modal centrado "Tu carrito solo puede tener stickers de un artista" cuando `!res.ok`.
- ✅ **Modales centrados en pantalla**: `AddToCartCard` pasó sus modales (login + otro-artista) a `createPortal(document.body)` — ANTES se renderizaban inline dentro de la card y `overflow-hidden` de `StickerCard` los recortaba/descentraba. El modal de login ahora usa `bg-ink/50` como overlay dim. `AddToCartButton` usa `AuthModal` (ya centrado con `fixed inset-0`) + el mismo modal portal de "otro artista".
- ✅ **Mongo reasignado a 4 artistas (decidido CON Mica)**: NINGÚN sticker se borró — los 22 stickers quedaron repartidos entre @arteconsofi (8: Bondi, Ancho de Espada, Choripán, Fernet con Coca, Fileteado BA, Messi Topo Gigio, Obelisco, Pizza de Guerrín), @mateconmili (6: Matecito, Argentina en el Corazón, Capibara, Gato con Camiseta, Pochoclos, Termo y Mate), @dibujitosdefacu (6: Empanada, Alfajor, Bandera, Medialuna, Snoopy, Sol de Mayo) + @demoilustrador (2: Dibu atajando, Escudo de River — oculto en producción). ⚠️ Los handles (@dibujandoconlu, @soydibujito, etc.) de los 16 stickers restaurados se reasignaron por script (rotativo), NO a mano — los stickers como docs nunca se perdieron (backup restaurado: `C:\Users\svatz\AppData\Local\Temp\opencode\backup-stickers-eliminados.json`).
- ✅ **Sin "85% directo al autor" en NINGÚN lado** (Mica: "a nadie le importa"): sacado de landing (panel C + CTA ilustrador), catálogo (title bar + banner), producto (shipping + texto bajo botón), perfil artista (métricas + manifest INK completo) y footer. El 85% sigue siendo el dato REAL del negocio, pero YA NO se menciona en la UI.
- ✅ **Sin "mesón" en ningún lado del store**: reemplazado por "feria", "tienda", "perfil", "stickers de X". Banner del catálogo ahora es "Cada calco es de un ilustrador real: conocé quién está detrás" → CTA "Conocer a los dibujantes →" (sigue yendo al primer artista).
- ✅ **StickerCard sin chip de categoría**: solo chip de material (`sticker.material`) a la izquierda. Se eliminaron `CATEGORIA_CHIP` y `categoriaChip()`.
- ✅ **Perfil artista reescrito**: card flotante del artista ahora es **full width** (Mica: "el rectángulo blanco abarque más longitud"), sin métricas (sacadas "1 sticker en el mesón"/"0 vendidos en feria"/85%), sin manifest INK, grid con **StickerCards clickeables (ligan al detalle + carrito como en catálogo — NADA de readOnly)**.
- ✅ **Producto**: spotlight del artista sin métricas ni "Ver el mesón ↗" → solo botón "Ver perfil ↗"; "Ver {Categoría} →" → "Ver más stickers de {Categoría} →"; título related "Del mismo mesón 🤍" → "Quizás te guste 🤍"; sacado el ítem "85% del valor va directo al autor" del shipping.
- ✅ **Hero de la landing simplificado**: badge sin número ("FERIA ACTIVA · PIEZAS EN CATÁLOGO"), pills SOLO "✉️ Envíos federales" (sacan vinilo y a prueba de mate), sin número de diseñadores ("Ilustraciones originales de diseñadores independientes argentinos"), panel C rediseñado a "✉️ ENVÍOS FEDERALES / Llega a todo el país...", los 3 paneles del hero ya NO son clickeables (era `Link` → ahora `div`).
- ✅ **Buscador landing**: placeholder corregido — `"Buscar entre {totalStickers} stickers..."` mostraba el literal `{totalStickers}` (string plano, no template) → ahora `placeholder={`Buscar entre ${totalStickers} stickers · por nombre o dibujante…`}`.
- ✅ **Tape #2 eliminada** (¿Pedís para un grupo? / Armar pack a medida).
- ✅ **"Libreta de Stickers" eliminada** del sidebar del catálogo.
- ✅ **"autorxs" → "ilustradores"** en catálogo ("{total} piezas originales de ilustradores independientes de Argentina") y revisado en todo el store (sin x inclusiva).
- ✅ **Carrito con imagen real**: `CartDrawer` ahora muestra `sticker.foto` (objeto-contain, bg-crema, p-1) en vez del emoji 🎨 como thumb.
- ✅ **Foto de perfil SOLO para ilustradores** (decisión de Mica): `PATCH /api/usuarios/me` acepta `foto` (URL http/https o "" para borrar) y rechaza con **403 si `rol !== "ilustrador"`**. `MiPerfilForm` (dashboard/perfil) tiene campo "Foto de perfil" con preview circular + input URL + hint. La page del perfil, `Sidebar` y `Navbar` (ambos avatares) muestran la foto real si existe, sino inicial. Los compradores NO tienen campo de foto (y el API se lo bloquea).

### Pasada de COLOR (IMPLEMENTADO — 16/09, cuarta pasada, pendiente de commit)
Mica: "no me gusta que haya tan poco color... usa esas cosas para todas las pantallas". Sistema de color replicado desde la landing a TODO el store + dashboard:
- ✅ **Componente `ColorBlobs`** (`src/components/ColorBlobs.tsx`): 3 manchas difuminadas `blur-3xl` de la paleta (acento/50, secundario/20, primario/20) para fondos con `relative overflow-hidden`; el contenido va en wrapper `relative z-10`. Server component, sin estado.
- ✅ **Landing**: hero con ColorBlobs (reemplazó los spans inline).
- ✅ **Catálogo**: title bar `bg-primario` con ColorBlobs; banner "Conocer a los dibujantes" pasó de `bg-crema` → **`bg-secundario` pleno** con texto blanco + botón amarillo; CTA ilustrador pasó de `bg-acento/30` → **`bg-acento` pleno** (label a text-secundario para contraste).
- ✅ **Producto**: breadcrumb de `bg-card` → `bg-crema` + ColorBlobs.
- ✅ **Perfil artista público**: breadcrumb igual (crema + ColorBlobs).
- ✅ **Carrito**: nuevo header `bg-primario` + ColorBlobs con h1 display blanco + subtítulo con count.
- ✅ **Checkout**: nuevo header `bg-primario` + ColorBlobs ("Finalizar compra 📦").
- ✅ **Seguimiento de pedido** (`/pedidos/[id]`): header `bg-primario` + ColorBlobs con badge de estado y fecha (texto blanco/80); timeline abajo.
- ✅ **Perfil comprador** (`/perfil`): header **`bg-secundario`** + ColorBlobs "Mi perfil".
- ✅ **Login**: wrapper con ColorBlobs detrás de la card (lado derecho sigue naranja).
- ✅ **Signup comprador e ilustrador**: wrapper con ColorBlobs detrás de la card.
- ✅ **Dashboard**: `<main>` del layout con `bg-crema` + ColorBlobs + children en `relative z-10` — TODAS las páginas del dashboard (home, stickers, pedidos, perfil) heredan el fondo con color.
- ⚠️ Regla: los headers de sección son `relative overflow-hidden` + `<ColorBlobs />` + contenido en `relative z-10`. No agregar más allá de eso (no saturar).

### Reescritura fiel a los refs REFINADOS con acentos azules (16/09, quinta pasada, commit pendiente)
- **Origen**: Mica pasó 4 HTML NUEVOS (más refinados, acento COBALT) en `docs/stitch_pegatina_argentine_sticker_marketplace/` (carpeta anidada: 5 subcarpetas `pegatina_{home,cat_logo,detalle_de_producto,perfil_de_artista}_refinado_con_acentos_azules` + `taller_pegatina/DESIGN.md`, cada una con `code.html` + `screen.png`). Los refs ANTERIORES (`pegatina-app/referencia-stitch/home.html`) siguen en el repo; la carpeta nueva quedó en `docs/` SIN trackear (decisión: trackearla por ahora).
- **Tokens nuevos en `globals.css`**: `--color-cobalt` #2563eb (acento azul de los refs), `--color-cobalt-dark` #1d4ed8, `--color-cobalt-light` #eff6ff, `--color-ink-soft` #3c3c3c (texto secundario más oscuro que `muted`).
- **⚠️ Gotcha Material Symbols**: `next/font/google` NO incluye icon fonts (error TS2305 al importar `Material_Symbols_Outlined`). Solución: `<link>` al CSS de Google Fonts en el `<head>` del `layout.tsx` + clase `.icon` en globals.css con `font-family: "Material Symbols Outlined"`. Uso: `<span className="icon" aria-hidden>north_east</span>`. Los refs Stitch cargan la fuente igual.
- **`Navbar` modo store**: announcement bar amarilla (adaptada: "Feria Activa · Envíos federales de cada ilustrador" — SIN el $18.000 del ref), logo pill con `logo.svg` + estrella girando, nav pill ÚNICA "Catálogo" (activa bg-cobalt — las otras rutas del ref no existen), search pill md+ (GET `/catalogo?q=`), botón "Abrí tu tienda" bg-primario (oculto para ilustrador), carrito circular con badge acento (solo comprador logueado), avatar con foto/inicial. Ilustrador en el store ve solo announcement + logo + avatar.
- **`StickerCard` con `variant`**: `"catalogo"` (product card: rounded-2xl, shadow 3→5px, imagen hover bg-cobalt-light/40, título hover cobalt, autor cobalt con `north_east`, precio + AddToCartCard) y `"home"` (community card: rounded-[24px], shadow 4→7px, tag opcional, autor chico arriba, sub "material · acabado"). Props: `variant`, `tag`, `tagClassName`, `botonCobalt`. `readOnly` ELIMINADO (perfil artista usa cards clickeables).
- **`AddToCartCard` compacto**: prop `accent: "primario"|"cobalt"|"acento"`, stepper chico, botón "Agregar" con `add_shopping_cart`, modales (login/otro-artista) con createPortal, ilustrador → pill "Modo vendedor — no compra por acá".
- **Footer** `(store)/layout.tsx` 12-col: marca (logo pill + desc + 3 badges: Hecho a mano mint / Tiradas cortas lilac / Feria federal wash), Explorar (Catálogo + 6 categorías reales), Comunidad (signup/ilustrador, dashboard, login, signup/comprador), "Feria Semanal" newsletter DECORATIVO (hint "Newsletter en camino" — no hay feature de mail), bottom bar "© 2026 Pegatina… Buenos Aires, Argentina".
- **Landing** reescrita: hero centrado (badge "⭐ 🎨 ✂️ 💛 Feria Federal Indie", h1 "Arte local en [STICKERS] caja naranja rotada de ilustradores", search pill con botón negro "Explorar", 3 pills REALES: Vinilo mate laminado / Envíos a todo el país / Hecho en Argentina), destacados con 4 StickerCard home (tag "MÁS PEDIDO" según ventas reales / "CLÁSICO", botonCobalt en uno), categorías tiles con SUBS místicos del ref (Fernet & Mate / Bodegones & Más / Calles & Subtes / Patria Gráfica / Carpinchos & + / Fanzines & Rock) + counts reales, callout ilustrador bg-acento rounded-[32px] (badge negro "Convocatoria permanente", CTA blanco "Abrir mi tienda gratis", sello circular con `textPath` + `anim-girar-lento`).
- **Catálogo** reescrito: breadcrumbs con badge; hero bg-primario con círculo amarillo decorativo `-bottom-10 -right-10` + badge "Feria Federal Autogestiva" + `OrdenarSelect` pill (icono `swap_vert` cobalt); sidebar card única sticky (buscador, categorías con activo bg-cobalt + counts, radios "Costo en feria (ARS)" con círculo cobalt, callout amarillo "Crear mi tienda", trust `water_drop`); grid StickerCard catalogo; paginación card ("Mostrando N de N stickers de la feria independiente", chevrons); banner final card blanca "Cada calco es de un ilustrador real" + botón "Conocer a los ilustradores" → `/artista/{primerHandle}`. SIN CTA ilustrador al final, SIN "Libreta de Stickers".
- **Producto** reescrito: breadcrumbs (pill "← Catálogo" + categoría + nombre cobalt + badges "★ Pieza original de taller"/"Troquelado individual"); stage con `ProductViewTabs` NUEVO (pills ✨ Sticker solo / 🧉 En termo / 💻 En notebook → transforman la imagen con rotate/scale; badges "★ Pieza original" + "Hecho en Argentina"); mini cards de datos REALES (Waterproof/Material/Acabado); info card: chip autor avatar+handle con `open_in_new`, badge "★ Original Pegatina", descripción, precio + "ARS" + pill mint "Disponible en feria"; `AddToCartButton` ahora NARANJA (bg-primario hover bg-ink) + `ComprarAhoraButton` NUEVO COBALT (`bolt` → add(1) + router.push("/checkout"); sin sesión → AuthModal; ilustrador → null); shipping 3 rows (envío gratis +$2.000 — el ref decía $18.000, se usa el $2.000 ya aprobado); Ficha técnica & taller 4 datos reales; Artist Spotlight con métricas REALES (stickers en feria, unidades vendidas sumadas, "Miembro desde {año}" con `createdAt`) + botón "Ver todos sus stickers (N)"; related "COMPLETA TU PLANCHA · Quizás te guste 🤍" 3 cards catalogo. `esDueño` → solo "Editar sticker".
- **Perfil artista** reescrito: breadcrumb "← Volver al catálogo" + pills "Feria Activa" (dot verde) y "Envíos a todo el país"; banner gradiente primario→acento con ColorBlobs + patrón radial + chip "🎨 Taller de {nombre}"; tarjeta flotante `-mt-14 md:-mt-16` (avatar foto/inicial + badge "★ Sticker Maker", badges Feria Activa / Ilustrador/a independiente / Colectivo federal, h1 handle + nombre, bio real en caja paper, tags reales del primer sticker, `SharePerfilButton` NUEVO: Web Share API con fallback clipboard + "Link copiado ✓"); 3 métricas REALES en cards; catálogo "Sus stickers" filtrable por categoría (pills con activo cobalt, estado vacío lindo); "Comunidad gráfica" (3 otros artistas reales con avatar/nombre/count + card CTA "¿Sos ilustrador? · Sumate"). Sin manifest 85%, sin encargos personalizados.
- **Copy vetado re-adaptado en esta pasada** (Mica aprobó "todo como stitch", estos del ref nuevo NO se incluyeron por vetos previos → reportar al cierre): monto $18.000 de envío gratis (se usa $2.000 aprobado), "Microediciones"/"mesón" (ausentes), stock/"482 ventas"/provincias/"4.9/114 reseñas"/"+42 creadores" (→ métricas reales), botón "Seguir artista" (no existe la feature), card "Encargo personalizado" (vetada), perfiles "PRO" casi idénticos.
- ✅ `npx tsc --noEmit` SIN errores + render verificado en dev (/, /catalogo, /producto/[id], /artista/{h} con y sin ?categoria= → 200; Material Symbols + `.icon` presentes en el HTML; sin warnings en el log).
- ⚠️ **Pendiente de decisión**: los refs de `docs/` quedaron trackeados de este commit — si Mica prefiere no trackearlos, removerlos del repo sin problema.

### Mercado Pago (IMPLEMENTADO — 23/09, commits 2da5fb3 + e94e2d3)
- ✅ **Checkout Pro vía Orders API**: `crearOrderCheckout()` en `src/lib/mercadopago.ts` crea la order SOLO si `MP_ACCESS_TOKEN` está configurado; si no, el checkout cae en **transferencia** (fallback automático). `POST /api/pedidos` devuelve `checkout_url` y el frontend redirige con `window.location.assign`.
- ✅ **Split 90/10**: si el artista conectó su cuenta (OAuth), la order usa SU token + `marketplace_fee` (10% automático de MP). Si no (hoy, Opción B), se crea con el token de Pegatina y el split se calcula y guarda en `pago.comision`/`pago.neto_artista`.
- ✅ **Webhook**: `POST /api/mercadopago/webhook` (force-dynamic) — topics `payment` / `orders` / `order`, matchea por `external_reference` o `order_id`, actualiza `pago.estado` + `payment_id`. Firma validada con `X-Signature` SOLO si existe `MP_NOTIFICATION_SECRET` (si no, loguea warning y procesa). ⚠️ `data.id` llega en MAYÚSCULAS pero la firma va en minúsculas — se usa `dataId.toLowerCase()`.
- ✅ **OAuth de vendedores**: `GET /api/mercadopago/connect` (state `userId:nonce`, 503 sin `MP_CLIENT_ID`/`MP_CLIENT_SECRET`) + `GET /api/mercadopago/oauth/callback` (canjea code, guarda `usuario.mp` en Mongo, redirect `/dashboard/perfil?mp=conectado|error`). UI: tarjeta "Cobros con Mercado Pago" en `/dashboard/perfil`.
- ✅ **UI comprador**: checkout con box MP (o transferencia si no hay token), seguimiento `/pedidos/[id]` con badge de pago + banner condicional, `ComprarAhoraButton` cobalt en producto (add(1) → /checkout; ilustrador → null), `AddToCartButton` naranja.
- ✅ **UI vendedor**: pill de pago en `/dashboard/pedidos` (PAGO_LABEL/PAGO_STYLE en `src/lib/pedidos.ts`).
- **Env vars MP** (test en `.env.local`, producción en Vercel): `MP_ACCESS_TOKEN`, `NEXT_PUBLIC_MP_PUBLIC_KEY`, `APP_URL` (¡CRÍTICA! las back_urls usan `getAppUrl()`), `MP_NOTIFICATION_SECRET` (se genera al guardar webhook en el panel), `MP_CLIENT_ID`/`MP_CLIENT_SECRET` (producción, para OAuth real).

### CÓMO TESTEAR MERCADO PAGO (guía oficial, verificada 23/09)
- **Cuentas de prueba**: panel MP Developers → Tus integraciones → tu app → **Cuentas de prueba**. Comprador: `3709481601`. Vendedor: `3709481591` (es el dueño del Access Token test). Las contraseñas y el **Código de verificación** se ven/regeneran desde la tabla (3 puntos verticales de la fila).
- ⚠️ **CRÍTICO — cómo iniciar sesión con cuenta de prueba**: el login de MP pide "DNI, email o teléfono" y **NO acepta el User ID numérico**. Hay que entrar con el **Usuario (nickname que empieza con `TEST...`)** + la contraseña de la tabla, y si pide verificación por email → ingresar el **Código de verificación** de 6 dígitos (del comprador = `481601`, del vendedor = `481591`, son los últimos 6 dígitos del User ID).
  - Paso a paso: ventana **incógnito** (Ctrl+Shift+N) → `mercadopago.com.ar` → Iniciar sesión → nickname `TEST...` + contraseña → código si lo pide → ya dentro como compradora test → abrir la tienda en la MISMA ventana y pagar.
- ⚠️ **SIEMPRE en incógnito**: la sesión REAL de MP en el navegador rompe el checkout de prueba ("la operación no acepta este medio de pago" + se ve como producción). La doc oficial lo exige para evitar duplicidad de credenciales.
- **Tarjetas de prueba oficiales Argentina (MLA)**: Visa crédito `4509 9535 6623 3704` · Mastercard crédito `5031 7557 3453 0604` · débito Visa `4002 7686 9439 5619` · débito MC `5287 3383 1025 3304` — vto `11/30`, CVV `123`. **Resultado según titular**: `APRO` → aprobado, `OTHE` → rechazado, `CONT` → pendiente, con DNI `12345678`. ❌ El `5033 5033 5033 5033` NO es válida para Argentina.
- **Entorno de prueba NO se ve**: el checkout nuevo de MP (px-checkout-frontend) ya NO muestra banner "entorno de prueba". Si el order_id empieza con `ORDTST...` ES test (TST = test). No hay que buscar carteles.
- **Verificación técnica**: `GET https://api.mercadopago.com/v1/orders/{order_id}` con Bearer token test → 200 confirma que la app usa token TEST. Scripts de referencia en `C:\Users\svatz\AppData\Local\Temp\opencode` (check-pedido-mp.cjs, check-order-detalle.cjs).
- ❌ NO se pueden crear cuentas de prueba por API con token test: `POST /users/test` → 403 "caller.id must be a productive user" (solo credenciales de producción).

### Pendiente / próximos pasos
- 🔲 **Test lado VENDEDOR (próxima sesión)**: Mica compra de prueba como compradora (cuenta 3709481601 + tarjeta Visa APRO) → verificar pedido aprobado en dashboard del ilustrador con badge de pago + neto artista.
- 🔲 **Webhook en panel MP**: configurar URL `https://pegatina-app.vercel.app/api/mercadopago/webhook` con evento "Order (Mercado Pago)" (+ opcional "Pagos (legacy)") → pegar `MP_NOTIFICATION_SECRET` en Vercel → redeploy → probar con "Simular".
- 🔲 Limpiar 3 pedidos de prueba huérfanos en Mongo (order ORDTST01..., todos pago.estado "pendiente") cuando se termine de testear.
- 🔲 Al validar flujo test: activar credenciales de PRODUCCIÓN en Vercel (`MP_ACCESS_TOKEN`, `NEXT_PUBLIC_MP_PUBLIC_KEY`) + `MP_CLIENT_ID`/`MP_CLIENT_SECRET` producción por el OAuth de artistas (Mica los pega directo en Vercel, nunca en el chat).
- 🔲 **Cloudinary**: cuenta de Mica (cloud `w7w3bhqs`, credenciales en `.env.local` + faltan en env vars de Vercel). Todas las fotos de `imgStickers/` subidas y **mapeadas con correcciones de Mica (09/09)**: `messi.png`→Messi Topo Gigio, `corazon.png`→Argentina en el Corazón, `mate argentino.png`→Matecito Argentino, `alfajor.png`→Alfajor de Chocolate, etc. (scripts `upload-cloudinary.mjs` + `apply-fotos.mjs` + `apply-fotos-mica.mjs`). 🗑 **"Perro salchicha" y "Messi con la Copa del Mundo" @demoilustrador ELIMINADOS** (pedidos de Mica). ⚠️ **`Bandera Argentina`, `Termo y Mate` y (antes) `Gato con Camiseta` apuntaban a `https://example.com/...`** (placeholders pegados en Mongo, dominios falsos → 404). ✅ Gato corregido → gato.png de imgStickers (ccat8vd0d3kzvr00lkty.png). ✅ **Termo y Bandera resueltos 09/09**: Mica subió `termo.png` y `bandera.png` a imgStickers → subidos a Cloudinary (ixain0pa1xxo9lsyxvwa.png y azclvjasrjxgdfgunamh.png) y mapeados. ⚠️ Foto `quilmes.png` en Cloudinary sin usar (Mica lo cambió por messi.png). ✅ **Upload directo implementado**: `POST /api/upload` (solo ilustrador, firma SHA-1 server-side, valida tipo/tamaño ≤5MB, folder "stickers") + botón de subir (ícono ↑) en cada slot de fotos del `StickerEditorForm`. ✅ **Env vars en Vercel** (09/09, Mica las subió al dashboard): `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` → el upload directo ya debería funcionar en producción tras el redeploy. Fotos huérfanas opcionales de borrar: `quilmes.png`, `argentina.png`, `mate.png` (reemplazadas) y 4 de imgStickers sin usar (`corazon.png` estaba... verificar). ⚠️ **Tras reasignación del 16/09 los 22 stickers pertenecen a 4 artistas** (@arteconsofi ×8, @mateconmili ×6, @dibujitosdefacu ×6, @demoilustrador ×2 — este último oculto en producción) — los healthchecks previos de 22 fotos siguen aplicando (mismas URLs, distintos ilustradores).
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
