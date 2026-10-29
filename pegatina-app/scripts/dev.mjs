import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

// Cada ejecución tiene su propia firma: las cookies de la ejecución anterior
// dejan de ser válidas tanto en las API como en el proxy. Solo afecta a dev.
export function crearEntornoDev() {
  return { ...process.env, JWT_SECRET: randomBytes(32).toString("hex") };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const nextCli = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
  const child = spawn(process.execPath, [nextCli, "dev", ...process.argv.slice(2)], {
    stdio: "inherit",
    env: crearEntornoDev(),
  });
  process.on("SIGINT", () => child.kill("SIGINT"));
  process.on("SIGTERM", () => child.kill("SIGTERM"));
  child.on("error", (error) => {
    console.error("No se pudo iniciar el servidor:", error.message);
    process.exitCode = 1;
  });
  child.on("exit", (code) => {
    process.exitCode = code ?? 1;
  });
}
