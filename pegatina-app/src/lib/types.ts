import { ObjectId } from "mongodb";
import type { PedidoEstado } from "./pedidos";

export type Role = "comprador" | "ilustrador";

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

/** Un pedido/compra del comprador (colección "pedidos"). */
export interface Pedido {
  id: string;
  usuario_id: string;
  items: { sticker_id: string; nombre: string; precio: number; cantidad: number }[];
  total: number;
  estado: PedidoEstado;
  fecha: string;
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
