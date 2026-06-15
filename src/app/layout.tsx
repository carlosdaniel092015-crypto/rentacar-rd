import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "RentaCar RD — Alquiler de Vehículos en República Dominicana",
    template: "%s | RentaCar RD",
  },
  description:
    "La mejor flota de vehículos en República Dominicana. Económicos, SUVs, pickups y más. Precios transparentes, sin cargos ocultos.",
  keywords: ["rent a car", "alquiler de carros", "República Dominicana", "Santo Domingo"],
  openGraph: {
    type: "website",
    locale: "es_DO",
    siteName: "RentaCar RD",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen flex flex-col antialiased">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
