"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Role, Usuario } from "@/lib/types";

interface AuthContextValue {
  /** true mientras chequeamos la sesión contra la API (para evitar parpadeos). */
  loading: boolean;
  /** Usuario logueado, o null si no hay sesión activa. */
  usuario: Usuario | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<
    { error?: string } & { usuario?: Usuario | null }
  >;
  /** Entra directo con la cuenta demo de ilustrador (solo con DEMO_MODE=true). */
  demoLogin: () => Promise<{ error?: string } & { usuario?: Usuario | null }>;
  signup: (data: {
    nombre: string;
    email: string;
    password: string;
    rol: Role;
    /** Handle @usuario — requerido para ilustradores. */
    usuario?: string;
    direccion?: string;
  }) => Promise<{ error?: string } & { usuario?: Usuario | null }>;
  logout: () => Promise<void>;
  /** Re-chequea la sesión contra /api/auth/me (para refrescar datos del perfil). */
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function iniciarSesion(path: string, body?: { email: string; password: string }) {
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(20000),
    });
    if (!res.headers.get("content-type")?.includes("application/json")) {
      return { error: "El servidor no pudo responder. Intentá de nuevo en unos segundos." };
    }
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error ?? "No pudimos iniciar sesión." };
    }
    if (!data.usuario) {
      return { error: "No pudimos confirmar tu sesión. Intentá de nuevo." };
    }
    return { usuario: data.usuario as Usuario };
  } catch (error) {
    const timeout = error instanceof DOMException &&
      (error.name === "TimeoutError" || error.name === "AbortError");
    return {
      error: timeout
        ? "El servidor tardó demasiado en responder. Intentá de nuevo."
        : "No pudimos conectar con el servidor. Revisá tu conexión e intentá de nuevo.",
    };
  }
}

/**
 * Auth REAL de Pegatina.
 * La sesión vive en una cookie httpOnly (JWT). Acá solo:
 *  - chequeamos quién está logueado (GET /api/auth/me)
 *  - login / signup / logout llamando a las API routes
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  // Chequear sesión al montar (cliente)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (active) setUsuario(data.usuario ?? null);
      } catch {
        if (active) setUsuario(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await iniciarSesion("/api/auth/login", { email, password });
    if (result.usuario) setUsuario(result.usuario);
    return result;
  }, []);

  const demoLogin = useCallback(async () => {
    const result = await iniciarSesion("/api/auth/demo");
    if (result.usuario) setUsuario(result.usuario);
    return result;
  }, []);

  const signup = useCallback(
    async (data: {
      nombre: string;
      email: string;
      password: string;
      rol: Role;
      usuario?: string;
      direccion?: string;
    }) => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        return { error: result.error ?? "No pudimos crear la cuenta." };
      }
      setUsuario(result.usuario);
      return { usuario: result.usuario };
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* si falla la red, igual limpiamos el estado local */
    }
    setUsuario(null);
  }, []);

  const refreshMe = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUsuario(data.usuario ?? null);
    } catch {
      setUsuario(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        loading,
        usuario,
        isLoggedIn: usuario !== null,
        login,
        demoLogin,
        signup,
        logout,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
