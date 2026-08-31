import type { Order, Sticker } from "@/lib/types";

/**
 * Datos de ejemplo para el MVP.
 * En el futuro esto se reemplaza por la API / MongoDB.
 */
export const stickers: Sticker[] = [
  {
    id: "1",
    titulo: "Sticker",
    precio: 200,
    imagen: null,
    artista: { id: "a1", nombre: "loremipsum", usuario: "@loremipsum" },
    categoria: "Animales",
    stock: 10,
    descripcion:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.",
    rating: 4.6,
    reviews: 32,
  },
  {
    id: "2",
    titulo: "Sticker",
    precio: 200,
    imagen: null,
    artista: { id: "a1", nombre: "loremipsum", usuario: "@loremipsum" },
    categoria: "Animales",
    stock: 5,
  },
  {
    id: "3",
    titulo: "Sticker",
    precio: 200,
    imagen: null,
    artista: { id: "a1", nombre: "loremipsum", usuario: "@loremipsum" },
    categoria: "Comida",
    stock: 3,
  },
  {
    id: "4",
    titulo: "Sticker",
    precio: 200,
    imagen: null,
    artista: { id: "a1", nombre: "loremipsum", usuario: "@loremipsum" },
    categoria: "Comida",
    stock: 12,
  },
  {
    id: "5",
    titulo: "Sticker",
    precio: 200,
    imagen: null,
    artista: { id: "a1", nombre: "loremipsum", usuario: "@loremipsum" },
    categoria: "Floral",
    stock: 8,
  },
  {
    id: "6",
    titulo: "Sticker",
    precio: 200,
    imagen: null,
    artista: { id: "a1", nombre: "loremipsum", usuario: "@loremipsum" },
    categoria: "Floral",
    stock: 15,
  },
];

export const orders: Order[] = [
  {
    orderNo: "2133",
    items: "Sticker",
    status: "in_progress",
    trackingId: "2176413876",
    deliveryDate: "23-07-2021",
    expected: true,
    price: 168.2,
    imagen: null,
  },
  {
    orderNo: "2133",
    items: "Sticker",
    status: "in_progress",
    trackingId: "2176413876",
    deliveryDate: "23-07-2021",
    expected: true,
    price: 168.2,
    imagen: null,
  },
  {
    orderNo: "2133",
    items: "Sticker",
    status: "in_progress",
    trackingId: "2176413876",
    deliveryDate: "23-07-2021",
    expected: true,
    price: 168.2,
    imagen: null,
  },
  {
    orderNo: "2133",
    items: "Sticker",
    status: "in_progress",
    trackingId: "2176413876",
    deliveryDate: "23-07-2021",
    expected: true,
    price: 168.2,
    imagen: null,
  },
  {
    orderNo: "2133",
    items: "Sticker",
    status: "in_progress",
    trackingId: "2176413876",
    deliveryDate: "23-07-2021",
    expected: true,
    price: 168.2,
    imagen: null,
  },
];
