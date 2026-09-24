/**
 * Módulo de pedidos: tipos serializados, normalización de estados y
 * etiquetas para UI. La DB guarda estados en INGLÉS (canónico):
 *
 *   pending → in_progress → shipped → delivered
 *
 * (En la UI se muestran en español vía ESTADO_LABEL.)
 *
 * El estado de PAGO es independiente del de envío y vive en `pago`
 * (PagoInfo de lib/mercadopago): pendiente → aprobado / rechazado.
 */

import type { PagoInfo } from "./mercadopago";

export type PedidoEstado =
  | "pending"
  | "in_progress"
  | "shipped"
  | "delivered";

export const ESTADOS_VALIDOS: PedidoEstado[] = [
  "pending",
  "in_progress",
  "shipped",
  "delivered",
];

/** Estados viejos en español que puedan existir en la DB — los normalizamos. */
const SINONIMOS: Record<string, PedidoEstado> = {
  pendiente: "pending",
  en_progreso: "in_progress",
  enviado: "shipped",
  entregado: "delivered",
};

/** Normaliza cualquier valor (inglés o español) al estado canónico. */
export function normalizarEstado(valor: string | null | undefined): PedidoEstado {
  const v = (valor ?? "").toLowerCase().trim();
  if (SINONIMOS[v]) return SINONIMOS[v];
  if ((ESTADOS_VALIDOS as string[]).includes(v)) return v as PedidoEstado;
  return "pending";
}

/** Etiqueta en español para la UI. */
export const ESTADO_LABEL: Record<PedidoEstado, string> = {
  pending: "Pendiente",
  in_progress: "En progreso",
  shipped: "Enviado",
  delivered: "Entregado",
};

/** Colores semáforo: rojo → amarillo → verde → azul. */
export const ESTADO_STYLE: Record<PedidoEstado, string> = {
  pending: "bg-red-100 text-red-700",
  in_progress: "bg-acento/30 text-[#a07d00]",
  shipped: "bg-green-100 text-green-700",
  delivered: "bg-secundario/20 text-ink",
};

/** Item dentro de un pedido, serializado para UI. */
export interface PedidoItem {
  nombre: string;
  cantidad: number;
  precio: number;
}

/**
 * Datos de seguimiento del envío que el ilustrador comparte con el comprador
 * cuando el pedido sale (estado "shipped" o "delivered"). El link apunta a la
 * web de la empresa de correo (Correo Argentino, Andreani, etc.). No es
 * Mercado Envíos — MVP: el envío lo gestiona cada artista por su cuenta.
 */
export interface SeguimientoEnvio {
  /** Número de seguimiento que da la empresa de correo (opcional). */
  numero?: string;
  /** Link al seguimiento online (opcional). */
  link?: string;
}

/** Pedido tal como lo ve el ILUSTRADOR (vendedor) en su dashboard. */
export interface PedidoVendedor {
  id: string;
  cliente: { nombre: string; email: string } | null;
  items: PedidoItem[];
  total: number;
  estado: PedidoEstado;
  fecha: string | null;
  /** Estado del pago (MP aprobado/pendiente, etc.). */
  pago?: PagoInfo | null;
  /** Seguimiento del envío compartido con el comprador (opcional). */
  seguimiento?: SeguimientoEnvio | null;
}

/** Etiquetas y estilos para el estado del PAGO (no el de envío). */
export const PAGO_LABEL: Record<PagoInfo["estado"], string> = {
  pendiente: "Pago pendiente",
  aprobado: "Pago aprobado",
  rechazado: "Pago rechazado",
  cancelado: "Pago cancelado",
};

export const PAGO_STYLE: Record<PagoInfo["estado"], string> = {
  pendiente: "bg-acento/40 text-[#a07d00]",
  aprobado: "bg-green-100 text-green-700",
  rechazado: "bg-red-100 text-red-700",
  cancelado: "bg-ink/10 text-ink/50",
};