import { ObjectId } from "mongodb";
import type { PedidoEstado } from "./pedidos";
import type { PagoInfo } from "./mercadopago";

export type Role = "comprador" | "ilustrador" | "admin";

/** Usuario tal como se guarda en MongoDB (colección "usuarios"). */
export interface DBUsuario {
  _id: ObjectId;
  nombre: string;
  email: string;
  password_hash: string;
  rol: Role;
  /** @usuario (handle público) — el identificador que une al usuario con sus stickers. */
  usuario?: string | null;
  foto?: string | null;
  direccion?: string | null;
  bio?: string | null;
  /** Conexión OAuth con Mercado Pago (solo ilustradores). El access_token
   *  es del VENDEDOR y se usa para crear orders con split (marketplace_fee). */
  mp?: {
    access_token?: string;
    refresh_token?: string;
    user_id?: number;
    public_key?: string;
    /** Fecha en que conectó su cuenta. */
    conectado_en?: Date;
  };
  createdAt: Date;
}

/** Usuario serializado, seguro de exponer al cliente (NUNCA el password). */
export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: Role;
  /** @usuario público (handle) — puede faltar si el signup no lo pedía aún. */
  usuario?: string | null;
  foto?: string | null;
}

/** Item de una liquidación por vendedor */
export interface LiquidacionItem {
  /** Handle del vendedor CON @ (ej. "@arteconsofi") */
  vendedor_handle: string;
  vendedor_id: string;
  /** Suma bruta de items de este vendedor en pedidos incluidos (shipped) */
  bruto: number;
  /** 10% comisión admin sobre bruto */
  comision_admin: number;
  /** 90% neto a pagar al vendedor */
  neto_vendedor: number;
  /** IDs de pedidos incluidos en esta liquidación para este vendedor */
  pedidos: string[];
  /** Cantidad total de items */
  cantidad_items: number;
}

/** Estado de una liquidación */
export type LiquidacionEstado = "pendiente" | "pagada";

/** Documento de liquidación en MongoDB */
export interface DBLiquidacion {
  _id: ObjectId;
  /** Rango quincenal: "YYYY-MM-DD_YYYY-MM-DD" */
  periodo: string;
  fecha_inicio: Date;
  fecha_fin: Date;
  estado: LiquidacionEstado;
  fecha_generada: Date;
  fecha_pagada?: Date;
  /** Totales del periodo */
  total_bruto: number;
  comision_admin: number;
  neto_total_pagar: number;
  items: LiquidacionItem[];
}

/** Liquidación serializada para cliente */
export interface Liquidacion {
  id: string;
  periodo: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: LiquidacionEstado;
  fecha_generada: string;
  fecha_pagada?: string;
  total_bruto: number;
  comision_admin: number;
  neto_total_pagar: number;
  items: LiquidacionItem[];
}

/** Un pedido/compra del comprador (colección "pedidos"). */
export interface Pedido {
  id: string;
  usuario_id: string;
  items: { sticker_id: string; nombre: string; precio: number; cantidad: number }[];
  total: number;
  estado: PedidoEstado;
  fecha: string;
  /** Información de pago (MP o transferencia). */
  pago?: PagoInfo;
}

/** Documento tal como viene de MongoDB */
export interface DBSticker {
  _id: ObjectId;
  nombre: string;
  precio: number;
  ilustrador: string;
  categoria: string;
  /** Primera foto (compatibilidad) — siempre es fotos[0] o "". */
  foto: string;
  /** Hasta 4 fotos del sticker. */
  fotos?: string[];
  material: string;
  resistente_al_agua: boolean;
  acabado: string;
}

/** Sticker serializado para React (sin ObjectId) */
export interface Sticker {
  id: string;
  nombre: string;
  precio: number;
  ilustrador: string;
  categoria: string;
  foto: string;
  fotos?: string[];
  material: string;
  acabado?: string;
  resistente_al_agua?: boolean;
}
