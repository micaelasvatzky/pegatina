# Recuperación de contraseña

El enlace “¿Olvidaste tu contraseña?” del login abre `/recuperar-contrasena`.
El email lleva a `/restablecer-contrasena?token=...`. El token es aleatorio,
dura 30 minutos y Mongo guarda únicamente su hash SHA-256 en el usuario.
El cambio de contraseña consume el token en una sola escritura; un enlace
nuevo reemplaza al anterior. Hay un límite persistido de un envío por minuto
por cuenta. La respuesta no revela si el email está registrado.

## Configuración pendiente

En Resend, configurar un remitente de un dominio verificado. En Vercel,
agregar a las variables del entorno correspondiente y volver a desplegar:

- `RESEND_API_KEY`: clave de envío de Resend (solo servidor).
- `EMAIL_FROM`: remitente, por ejemplo `Pegatina <cuentas@tu-dominio.com>`.
- `APP_URL`: URL pública HTTPS de Pegatina, sin rutas adicionales.

No guardar claves en git ni enviarlas por el chat. Sin configuración completa,
la API devuelve 503 y la UI avisa que la recuperación no está disponible.
Si el proveedor falla, se invalida el enlace y se registra un mensaje sin
email ni token. El cliente mantiene una respuesta genérica para no revelar
la existencia de la cuenta.

Referencia de integración: https://resend.com/docs/api-reference/emails/send-email

## Verificaciones

`node --test scripts/test-auth-recovery.mjs` desde `pegatina-app/` prueba
generación, vencimiento, consumo único, concurrencia, respuestas genéricas,
fallos de envío, falta de configuración y el modo manual de Checkout Pro.
Son pruebas aisladas con Mongo y proveedores simulados.

Falta la prueba real de entrega con Resend configurado y el recorrido de
navegador. El cambio borra la cookie del navegador que lo realiza; las
sesiones ya abiertas en otros dispositivos conservan su vencimiento actual.
