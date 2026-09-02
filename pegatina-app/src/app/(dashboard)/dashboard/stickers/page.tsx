import Link from "next/link";
import { stickers } from "@/lib/mock-data";

/**
 * Mis Stickers — grid de stickers publicados del ilustrador.
 */
export default function MisStickersPage() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-medium text-ink">Mis stickers</h1>
        <Link
          href="/dashboard/stickers/nuevo"
          className="rounded-full bg-primario px-6 py-3 font-semibold text-white transition-colors hover:bg-ink"
        >
          Subir sticker
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {stickers.map((sticker) => (
          <div
            key={sticker.id}
            className="flex flex-col items-start gap-6 bg-white p-4 shadow-sm"
          >
            <div className="flex h-[275px] w-full items-center justify-center rounded-xl bg-primario/10">
              <span className="text-5xl">🎨</span>
            </div>
            <span className="text-xl text-ink">{sticker.nombre}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
