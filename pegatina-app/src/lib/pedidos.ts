/**
 * Módulo de pedidos: tipos serializados, normalización de estados y
 * etiquetas para UI. La DB guarda estados en INGLÉS (canónico):
 *
 *   pending → in_progress → shipped → delivered
 *
 * (En la UI se muestran en español vía ESTADO_LABEL.)
 */

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

/** Pedido tal como lo ve el ILUSTRADOR (vendedor) en su dashboard. */
export interface PedidoVendedor {
  id: string;
  cliente: { nombre: string; email: string } | null;
  items: PedidoItem[];
  total: number;
  estado: PedidoEstado;
  fecha: string | null;
}