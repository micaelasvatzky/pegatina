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
