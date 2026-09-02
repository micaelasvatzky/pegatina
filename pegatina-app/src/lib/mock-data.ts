import type { Order, Sticker } from "@/lib/types";

/**
 * Datos de ejemplo para el MVP.
 * En el futuro esto se reemplaza por la API / MongoDB.
 */
export const stickers: Sticker[] = [
  {
    id: "1",
    nombre: "Matecito Argentino",
    precio: 1200,
    ilustrador: "@mateconmili",
    categoria: "Bebidas",
    foto: "",
    material: "Vinilo",
  },
  {
    id: "2",
    nombre: "Empanada Criolla",
    precio: 1000,
    ilustrador: "@dibujitosdefacu",
    categoria: "Comida",
    foto: "",
    material: "Vinilo",
  },
  {
    id: "3",
    nombre: "Capibara Argentino",
    precio: 1400,
    ilustrador: "@cosasdemora",
    categoria: "Animales",
    foto: "",
    material: "Vinilo",
  },
  {
    id: "4",
    nombre: "Bondi de Buenos Aires",
    precio: 1500,
    ilustrador: "@arteconsofi",
    categoria: "Buenos Aires",
    foto: "",
    material: "Vinilo",
  },
  {
    id: "5",
    nombre: "Bandera Argentina",
    precio: 900,
    ilustrador: "@garabatosdeagus",
    categoria: "Argentina",
    foto: "",
    material: "Vinilo",
  },
  {
    id: "6",
    nombre: "Pochoclos del Cine",
    precio: 1100,
    ilustrador: "@dibujitosdenati",
    categoria: "Cultura",
    foto: "",
    material: "Vinilo",
  },
];

export const orders: Order[] = [
  {
    orderNo: "2133",
    items: "Matecito Argentino x2",
    status: "in_progress",
    trackingId: "2176413876",
    deliveryDate: "28-08-2026",
    expected: true,
    price: 2400,
    imagen: null,
  },
  {
    orderNo: "2134",
    items: "Empanada Criolla x1",
    status: "shipped",
    trackingId: "2176413877",
    deliveryDate: "25-08-2026",
    expected: false,
    price: 1000,
    imagen: null,
  },
];
