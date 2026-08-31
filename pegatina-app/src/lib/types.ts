export type Role = "comprador" | "ilustrador";

export interface Sticker {
  id: string;
  titulo: string;
  precio: number;
  imagen: string | null;
  artista: {
    id: string;
    nombre: string;
    usuario: string;
  };
  categoria: string;
  stock: number;
  descripcion?: string;
  rating?: number;
  reviews?: number;
}

export interface Order {
  orderNo: string;
  items: string;
  status: "in_progress" | "pending" | "shipped" | "delivered";
  trackingId: string;
  deliveryDate: string;
  expected: boolean;
  price: number;
  imagen: string | null;
}

export type OrderStatus =
  | "pendiente"
  | "en_progreso"
  | "enviado"
  | "entregado";
