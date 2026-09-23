import {
  MercadoPagoConfig,
  Order,
  OAuth,
  Payment,
  WebhookSignatureValidator,
} from "mercadopago";

/**
 * Integración con Mercado Pago (Checkout Pro vía API de Orders).
 *
 * Modelo de negocio: marketplace con split automático.
 *   - Cada ilustrador conecta su cuenta MP (OAuth) → guardamos su access token.
 *   - Al pagar, la order se crea CON EL TOKEN DEL VENDEDOR y `marketplace_fee`:
 *     el 10% va a la cuenta de Pegatina y el 90% al artista, automático.
 *   - Si el artista todavía no conectó su cuenta, se crea con el token de
 *     Pegatina y el split se calcula y guarda en la DB (PagoInfo), quedando
 *     la plata en la cuenta de Pegatina hasta que el artista conecte la suya.
 *
 * Las credenciales viven en .env.local (ver .env.example). Los throws son
 * perezosos: solo explotan cuando alguien realmente usa MP.
 */

/** Comisión que cobra Pegatina por venta (10%). */
export const COMISION_PEGATINA = 0.1;

/** Moneda de las órdenes (Argentina). */
export const MP_MONEDA = "ARS";

/** Estados del pago de un pedido (independientes del estado de envío). */
export type PagoEstado =
  | "pendiente"
  | "aprobado"
  | "rechazado"
  | "cancelado";

/** Información de pago que se guarda dentro del documento del pedido. */
export interface PagoInfo {
  proveedor: "mercadopago" | "transferencia";
  estado: PagoEstado;
  /** ID de la order en MP (API de Orders). */
  order_id?: string;
  /** ID del payment en MP (llega por webhook o consulta de la order). */
  payment_id?: string;
  /** Total cobrado. */
  total?: number;
  /** Comisión de Pegatina (10%). */
  comision?: number;
  /** Neto para el artista (total - comisión). */
  neto_artista?: number;
  /** Fecha en que se aprobó el pago (ISO). */
  fecha_pago?: string;
}

/** ¿Está configurada la integración con MP? (hay access token en env). */
export function mpConfigurado(): boolean {
  return Boolean(process.env.MP_ACCESS_TOKEN);
}

/** ¿Está configurado el OAuth de vendedores? (Client ID/Secret de Producción). */
export function mpOAuthConfigurado(): boolean {
  return Boolean(process.env.MP_CLIENT_ID && process.env.MP_CLIENT_SECRET);
}

/** Config del SDK con el token de la app de Pegatina (el marketplace). */
function getMarketplaceConfig(): MercadoPagoConfig {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      "Falta MP_ACCESS_TOKEN. Definila en .env.local (ver .env.example)."
    );
  }
  return new MercadoPagoConfig({
    accessToken: token,
    options: { timeout: 10000 },
  });
}

/** Config del SDK con el token de UN vendedor (ilustrador conectado). */
function getSellerConfig(accessToken: string): MercadoPagoConfig {
  if (!accessToken) {
    throw new Error(
      "El vendedor no tiene access token de Mercado Pago conectado."
    );
  }
  return new MercadoPagoConfig({
    accessToken,
    options: { timeout: 10000 },
  });
}

/** URL pública de la app (para redirects de OAuth y back_urls del checkout). */
export function getAppUrl(): string {
  return (
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  );
}

/** Credenciales de la APLICACIÓN (Client ID/Secret) para OAuth de vendedores. */
function getOAuthCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.MP_CLIENT_ID ?? "";
  const clientSecret = process.env.MP_CLIENT_SECRET ?? "";
  if (!clientId || !clientSecret) {
    throw new Error(
      "Faltan MP_CLIENT_ID / MP_CLIENT_SECRET. Se obtienen en Tus integraciones → Producción → Credenciales de producción."
    );
  }
  return { clientId, clientSecret };
}

/** URL donde MP redirige al vendedor después de autorizar (OAuth callback). */
export function getRedirectUri(): string {
  return `${getAppUrl()}/api/mercadopago/oauth/callback`;
}

/**
 * Arma la URL de autorización para que EL ILUSTRADOR conecte su cuenta MP.
 * Al aprobar, MP vuelve a `redirect_uri` con `code` + `state`.
 */
export async function urlAutorizacionVendedor(state: string): Promise<string> {
  const { clientId } = getOAuthCredentials();
  const oauth = new OAuth(getMarketplaceConfig());
  const res = await oauth.getAuthorizationURL({
    options: {
      client_id: clientId,
      state,
      redirect_uri: getRedirectUri(),
    },
  });
  return res;
}

/** Intercambia el `code` de OAuth por el access/refresh token del vendedor. */
export async function canjearCodigoOAuth(code: string): Promise<{
  access_token?: string;
  refresh_token?: string;
  user_id?: number;
  public_key?: string;
}> {
  const { clientId, clientSecret } = getOAuthCredentials();
  const oauth = new OAuth(getMarketplaceConfig());
  const res = await oauth.create({
    body: {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: getRedirectUri(),
    },
  });
  return res;
}

/** Renueva el access token de un vendedor con su refresh token. */
export async function refrescarTokenVendedor(
  refreshToken: string
): Promise<{ access_token?: string; refresh_token?: string }> {
  const { clientId, clientSecret } = getOAuthCredentials();
  const oauth = new OAuth(getMarketplaceConfig());
  const res = await oauth.refresh({
    body: {
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    },
  });
  return res;
}

/**
 * Calcula el split de una venta: 10% para Pegatina, 90% para el artista.
 */
export function calcularSplit(total: number): {
  comision: number;
  neto_artista: number;
} {
  const comision = Math.round(total * COMISION_PEGATINA * 100) / 100;
  return { comision, neto_artista: total - comision };
}

/** Item de la order tal como lo espera la API de Orders de MP. */
export interface ItemOrderMP {
  title: string;
  quantity: number;
  unit_price: number;
}

/**
 * Crea una order de Checkout Pro (API de Orders — flujo recomendado).
 *
 * - `sellerToken`: token del ilustrador (si conectó su cuenta). Con él se
 *   aplica `marketplace_fee` y el split es REAL entre cuentas de MP.
 * - Sin `sellerToken`: se crea con el token de Pegatina (split solo en DB).
 */
export async function crearOrderCheckout(opts: {
  items: ItemOrderMP[];
  total: number;
  externalReference: string;
  payerEmail?: string;
  sellerToken?: string;
  /** Adónde redirige MP después del pago (sino usa /pedidos/{externalReference}). */
  backUrls?: { success?: string; pending?: string; failure?: string };
}): Promise<{ id: string; checkout_url: string; status?: string }> {
  const config = opts.sellerToken
    ? getSellerConfig(opts.sellerToken)
    : getMarketplaceConfig();

  const split = calcularSplit(opts.total);

  const order = new Order(config);
  const res = await order.create({
    body: {
      type: "online",
      processing_mode: "manual",
      capture_mode: "automatic",
      total_amount: opts.total.toFixed(2),
      external_reference: opts.externalReference,
      description: "Compra en Pegatina — stickers",
      items: opts.items.map((i) => ({
        title: i.title,
        quantity: i.quantity,
        unit_price: i.unit_price.toFixed(2),
      })),
      // La comisión de MP se descuenta del vendedor; el split es automático.
      ...(opts.sellerToken
        ? { marketplace_fee: split.comision.toFixed(2) }
        : {}),
      ...(opts.payerEmail
        ? { payer: { email: opts.payerEmail } }
        : {}),
      config: {
        online: {
          // external_reference ES el id del pedido en nuestra DB → el
          // seguimiento /pedidos/[id] ya existe en la app.
          success_url:
            opts.backUrls?.success ??
            `${getAppUrl()}/pedidos/${opts.externalReference}?comprado=1`,
          pending_url:
            opts.backUrls?.pending ??
            `${getAppUrl()}/pedidos/${opts.externalReference}?pendiente=1`,
          failure_url:
            opts.backUrls?.failure ??
            `${getAppUrl()}/pedidos/${opts.externalReference}?fallo=1`,
          auto_return: "approved",
        },
      },
    },
  });

  if (!res.id || !res.checkout_url) {
    throw new Error(
      "Mercado Pago no devolvió checkout_url al crear la order. " +
        (res.status ? `(HTTP ${res.status})` : "")
    );
  }
  return { id: res.id, checkout_url: res.checkout_url, status: res.status };
}

/** Consulta una order por ID (para recuperar estado si se perdió el webhook). */
export async function obtenerOrder(orderId: string, sellerToken?: string) {
  const config = sellerToken
    ? getSellerConfig(sellerToken)
    : getMarketplaceConfig();
  const order = new Order(config);
  return order.get({ id: orderId });
}

/** Consulta un payment por ID (usado por el webhook para verificar). */
export async function obtenerPayment(paymentId: string) {
  const payment = new Payment(getMarketplaceConfig());
  return payment.get({ id: paymentId });
}

/**
 * Valida que el webhook venga de Mercado Pago (firma HMAC x-signature).
 * El `secret` se configura en el panel: Webhooks → Configurar notificaciones.
 */
export function validarFirmaWebhook(opts: {
  xSignature: string;
  xRequestId: string;
  dataId: string;
}): boolean {
  const secret = process.env.MP_NOTIFICATION_SECRET;
  if (!secret) {
    // Sin secret configurado no podemos validar — mejor fallar que confiar ciego.
    throw new Error(
      "Falta MP_NOTIFICATION_SECRET. Se obtiene en el panel MP → Webhooks → Configurar notificaciones."
    );
  }
  try {
    WebhookSignatureValidator.validate({
      xSignature: opts.xSignature,
      xRequestId: opts.xRequestId,
      dataId: opts.dataId,
      secret,
    });
    return true;
  } catch {
    return false;
  }
}