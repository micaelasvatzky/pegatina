import type { Metadata } from "next";
import { Epilogue, Work_Sans } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
});

const workSans = Work_Sans({
  variable: "--font-worksans",
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
    <html
      lang="es"
      className={`${epilogue.variable} ${workSans.variable} h-full antialiased`}
    >
      <head>
        {/* Iconografía del sistema (los refs Stitch usan Material Symbols Outlined).
            next/font/google NO incluye icon fonts, así que se carga por link
            como en los HTML de referencia. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-crema text-ink font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}