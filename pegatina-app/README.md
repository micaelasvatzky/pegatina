# Pegatina App

Marketplace argentino de stickers. Next.js 16, React 19, TypeScript, Tailwind 4 y MongoDB; pagos con Mercado Pago y fotos con Cloudinary.

## Desarrollo local

Desde la raíz del repositorio:

```powershell
cd pegatina-app
npm install
npm run dev
```

Abrí http://localhost:3000. Configurá `.env.local` según `.env.example`, sin publicar credenciales.

`npm run dev` ejecuta `scripts/dev.mjs`: genera una firma JWT nueva por arranque. Al reiniciar el comando hay que iniciar sesión de nuevo. Recargar o abrir pestañas durante la misma ejecución conserva la sesión. No modifica `.env.local` ni las sesiones de producción.

## Funcionalidades

- Comprador: catálogo, filtros, carrito de un solo artista, checkout y seguimiento.
- Ilustrador: stickers, fotos, pedidos y perfil. El envío solo se puede actualizar con pago aprobado, validado en UI y API.
- Admin: panel y liquidaciones centralizadas, 10% comisión y 90% neto del artista.
- Menú de cuenta compacto; para ilustrador solo Cerrar sesión. Botones de salida con bordes y texto rojos.
- Ojo para mostrar/ocultar contraseñas en login y registros, ocultas inicialmente.

## Verificación

```powershell
npm run lint
node node_modules/typescript/bin/tsc --noEmit
```

No ejecutar build salvo pedido explícito de Mica.

El script opcional `scripts/set-demo-creds.mjs` requiere `DEMO_PASSWORD` y modifica MongoDB. No ejecutarlo como parte del arranque.

## Contexto

Leer [AGENTS de la raíz](../AGENTS.md) y el [cierre del 29/10/2026](../docs/sesiones/2026-10-29.md). Sigue pendiente adaptar el copy de cobros al modelo centralizado y decidir el alcance con Mica.