export function passwordEmailConfig() {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const appUrl = process.env.APP_URL;
  if (!key || !from || !appUrl) return null;
  try {
    const origin = new URL(appUrl);
    if (origin.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && origin.hostname === "localhost")) return null;
    return { key, from, origin: origin.origin };
  } catch {
    return null;
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const config = passwordEmailConfig();
  if (!config) throw new Error("Email no configurado");
  const url = new URL("/restablecer-contrasena", config.origin);
  url.searchParams.set("token", token);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(10000),
    body: JSON.stringify({
      from: config.from,
      to: [email],
      subject: "Cambiá tu contraseña de Pegatina",
      text: `Recibimos un pedido para cambiar tu contraseña de Pegatina.\n\nAbrí este enlace: ${url.toString()}\n\nDura 30 minutos y se puede usar una sola vez. Si no lo pediste, ignorá este email: tu contraseña no cambia.`,
    }),
  });
  if (!response.ok) throw new Error(`Email rechazado: ${response.status}`);
}
