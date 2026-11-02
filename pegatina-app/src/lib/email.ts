import nodemailer from "nodemailer";

type EmailConfig =
  | { provider: "gmail"; user: string; password: string; origin: string }
  | { provider: "resend"; key: string; from: string; origin: string };

export function passwordEmailConfig(): EmailConfig | null {
  const appUrl = process.env.APP_URL?.trim();
  if (!appUrl) return null;
  try {
    const origin = new URL(appUrl);
    if (origin.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && origin.hostname === "localhost")) return null;
    const user = process.env.GMAIL_USER?.trim();
    const password = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
    // Gmail tiene prioridad si se configuró. No caer en otro remitente si falta una clave.
    if (user || password) {
      if (!user || !password || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user)) return null;
      return { provider: "gmail", user, password, origin: origin.origin };
    }
    const key = process.env.RESEND_API_KEY?.trim();
    const from = process.env.EMAIL_FROM?.trim();
    if (!key || !from) return null;
    return { provider: "resend", key, from, origin: origin.origin };
  } catch {
    return null;
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const config = passwordEmailConfig();
  if (!config) throw new Error("Email no configurado");
  const url = new URL("/restablecer-contrasena", config.origin);
  url.searchParams.set("token", token);
  const message = {
    to: email,
    subject: "Cambiá tu contraseña de Pegatina",
    text: `Recibimos un pedido para cambiar tu contraseña de Pegatina.\n\nAbrí este enlace: ${url.toString()}\n\nDura 30 minutos y se puede usar una sola vez. Si no lo pediste, ignorá este email: tu contraseña no cambia.`,
  };
  if (config.provider === "gmail") {
    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: config.user, pass: config.password },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
      dnsTimeout: 5000,
      disableFileAccess: true,
      disableUrlAccess: true,
    });
    await transport.sendMail({
      ...message,
      from: { name: "Pegatina", address: config.user },
    });
    return;
  }
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
      subject: message.subject,
      text: message.text,
    }),
  });
  if (!response.ok) throw new Error(`Email rechazado: ${response.status}`);
}
