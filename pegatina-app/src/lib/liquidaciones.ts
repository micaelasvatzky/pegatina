import type { ObjectId } from "mongodb";
import type { LiquidacionItem } from "./types";

export const COMISION_ADMIN = 0.1; // 10%

export interface PedidoParaLiquidar {
  _id: ObjectId;
  fecha: Date;
  estado: string;
  items: {
    sticker_id: string;
    nombre: string;
    precio: number;
    cantidad: number;
    ilustrador: string; // CON @
  }[];
  total: number;
}

export interface LiquidacionCalculada {
  total_bruto: number;
  comision_admin: number;
  neto_total_pagar: number;
  items: LiquidacionItem[];
}

/**
 * Agrupa pedidos shipped por vendedor (handle CON @).
 * Calcula bruto, comisión 10%, neto 90% por vendedor.
 */
export function calcularLiquidacion(
  pedidos: PedidoParaLiquidar[]
): LiquidacionCalculada {
  const porVendedor = new Map<
    string,
    {
      bruto: number;
      cantidad_items: number;
      pedidosSet: Set<string>;
    }
  >();

  let total_bruto = 0;

  for (const pedido of pedidos) {
    total_bruto += pedido.total;
    const pedidoId = pedido._id.toString();

    for (const item of pedido.items) {
      const handle = item.ilustrador;
      if (!handle) continue;

      const key = handle;
      const entry = porVendedor.get(key) ?? {
        bruto: 0,
        cantidad_items: 0,
        pedidosSet: new Set<string>(),
      };

      entry.bruto += item.precio * item.cantidad;
      entry.cantidad_items += item.cantidad;
      entry.pedidosSet.add(pedidoId);
      porVendedor.set(key, entry);
    }
  }

  const items: LiquidacionItem[] = Array.from(porVendedor.entries())
    .map(([vendedor_handle, datos]) => {
      const bruto = Math.round(datos.bruto * 100) / 100;
      const comision_admin = Math.round(bruto * COMISION_ADMIN * 100) / 100;
      const neto_vendedor = Math.round((bruto - comision_admin) * 100) / 100;

      return {
        vendedor_handle,
        vendedor_id: "", // se completa en API si se quiere mapear por usuario
        bruto,
        comision_admin,
        neto_vendedor,
        pedidos: Array.from(datos.pedidosSet).sort(),
        cantidad_items: datos.cantidad_items,
      };
    })
    .sort((a, b) => a.vendedor_handle.localeCompare(b.vendedor_handle));

  const comision_admin_total = Math.round(
    items.reduce((sum, it) => sum + it.comision_admin, 0) * 100
  ) / 100;

  const neto_total_pagar = Math.round(
    items.reduce((sum, it) => sum + it.neto_vendedor, 0) * 100
  ) / 100;

  return {
    total_bruto: Math.round(total_bruto * 100) / 100,
    comision_admin: comision_admin_total,
    neto_total_pagar,
    items,
  };
}

/** Devuelve rango quincenal por defecto: últimos 15 días (fecha_fin = hoy) */
export function rangoQuincenalPorDefecto(): {
  fecha_inicio: Date;
  fecha_fin: Date;
} {
  const hoy = new Date();
  const fecha_fin = new Date(
    hoy.getFullYear(),
    hoy.getMonth(),
    hoy.getDate(),
    23,
    59,
    59,
    999
  );

  const fecha_inicio = new Date(fecha_fin);
  fecha_inicio.setDate(fecha_inicio.getDate() - 14);
  fecha_inicio.setHours(0, 0, 0, 0);

  return { fecha_inicio, fecha_fin };
}

/** Formatea periodo YYYY-MM-DD_YYYY-MM-DD */
export function formatoPeriodo(fecha_inicio: Date, fecha_fin: Date): string {
  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };
  return `${fmt(fecha_inicio)}_${fmt(fecha_fin)}`;
}
