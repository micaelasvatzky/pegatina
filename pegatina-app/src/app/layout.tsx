import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pegatina - Arte local en stickers",
  description:
    "Marketplace de stickers de artistas independientes argentinos. Arte local original, directo de la ilustradora a tu puerta.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-crema text-ink font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
