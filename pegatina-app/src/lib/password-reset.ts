import { createHash, randomBytes } from "node:crypto";

export const RESET_DURATION_MS = 30 * 60 * 1000;
export const RESET_COOLDOWN_MS = 60 * 1000;

export function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createResetToken() {
  const token = randomBytes(32).toString("hex");
  return { token, hash: hashResetToken(token) };
}

export function validResetToken(token: unknown): token is string {
  return typeof token === "string" && /^[a-f0-9]{64}$/.test(token);
}
