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
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error ?? "No pudimos iniciar sesión." };
    }
    setUsuario(data.usuario);
    return { usuario: data.usuario };
  }, []);

  const demoLogin = useCallback(async () => {
    const res = await fetch("/api/auth/demo", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error ?? "No pudimos entrar con la cuenta demo." };
    }
    setUsuario(data.usuario);
    return { usuario: data.usuario };
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
