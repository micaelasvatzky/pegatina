# Recuperación de contraseña

El enlace “¿Olvidaste tu contraseña?” del login abre `/recuperar-contrasena`.
El email lleva a `/restablecer-contrasena?token=...`. El token es aleatorio,
dura 30 minutos y Mongo guarda únicamente su hash SHA-256 en el usuario.
El cambio de contraseña consume el token en una sola escritura; un enlace
nuevo reemplaza al anterior. Hay un límite persistido de un envío por minuto
por cuenta. La respuesta no revela si el email está registrado.

## Configuración con Gmail

Crear una cuenta Gmail para Pegatina, activar verificación en dos pasos y
generar una contraseña de aplicación. No usar la contraseña habitual de la cuenta.
En Vercel → Settings → Environment Variables → Production, guardar:

- `GMAIL_USER`: dirección completa del Gmail de Pegatina.
- `GMAIL_APP_PASSWORD`: contraseña de aplicación de 16 caracteres. Se normalizan los espacios de presentación de Google.
- `APP_URL`: `https://pegatina-app.vercel.app`.

Después volver a desplegar. Gmail envía por SMTP con TLS en smtp.gmail.com:465.
El remitente es la misma cuenta autenticada, con nombre Pegatina. No hace falta
comprar un dominio ni contratar Workspace para este envío de prueba.

Para desarrollo local, cargar las mismas variables en `pegatina-app/.env.local`,
usando `APP_URL=http://localhost:3000` si el enlace debe volver al servidor local.
Reiniciar `npm run dev` después de cambiarlas. Esto invalida las sesiones locales
por la regla existente del secreto temporal, pero no afecta las de Vercel.

## Alternativa con Resend

Se conserva Resend para usarlo más adelante con un dominio verificado:
`RESEND_API_KEY`, `EMAIL_FROM` y `APP_URL`. Gmail tiene prioridad cuando se define
alguna variable GMAIL_*; si esa configuración está incompleta, no se intenta usar
otro remitente automáticamente.

No guardar claves en git ni enviarlas por el chat. Sin configuración completa,
la API devuelve 503 y la UI avisa que la recuperación no está disponible.
Si el proveedor falla, se invalida el enlace y se registra un mensaje sin
email ni token. El cliente mantiene una respuesta genérica para no revelar
la existencia de la cuenta.

Referencias: https://nodemailer.com/smtp y https://support.google.com/accounts/answer/185833

## Verificaciones

`node --test scripts/test-auth-recovery.mjs` desde `pegatina-app/` prueba
generación, vencimiento, consumo único, concurrencia, respuestas genéricas,
fallos de envío, falta de configuración y el modo manual de Checkout Pro.
Son pruebas aisladas con Mongo y proveedores simulados.

Falta la prueba real de entrega con Gmail configurado y el recorrido de
navegador. El cambio borra la cookie del navegador que lo realiza; las
sesiones ya abiertas en otros dispositivos conservan su vencimiento actual.
