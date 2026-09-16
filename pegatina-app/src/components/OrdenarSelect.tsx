"use client";

import { useRouter } from "next/navigation";

const SORT_LABEL: Record<string, string> = {
  destacados: "Más pedidos en feria",
  "precio-asc": "Menor precio",
  "precio-desc": "Mayor precio",
  nombres: "Orden alfabético",
};

/**
 * Selector de orden del catálogo (cliente, para poder navegar al cambiar).
 * Estilo pill Stitch con icono swap_vert — vive en el hero del catálogo.
 * `baseUrl` ya trae q/categoria/precio — solo se reemplaza el sort.
 */
export default function OrdenarSelect({
  value,
  baseUrl,
}: {
  value: string;
  baseUrl: string;
}) {
  const router = useRouter();

  function handleChange(sort: string) {
    const url = new URL(baseUrl, window.location.origin);
    url.searchParams.set("sort", sort);
    router.push(`${url.pathname}${url.search}`);
  }

  return (
    <label className="inline-flex items-center gap-1.5 rounded-full border-2 border-line bg-card px-4 py-2 text-sm font-bold text-ink shadow-[2px_2px_0px_var(--color-line)] transition-shadow focus-within:ring-2 focus-within:ring-cobalt">
      <span className="icon text-lg text-cobalt" aria-hidden>
        swap_vert
      </span>
      <select
        defaultValue={value}
        name="sort"
        onChange={(e) => handleChange(e.target.value)}
        className="cursor-pointer bg-transparent text-sm font-bold text-ink outline-none"
      >
        {Object.entries(SORT_LABEL).map(([k, label]) => (
          <option key={k} value={k}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}