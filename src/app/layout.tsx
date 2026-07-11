import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import Script from "next/script";
import RegisterSW from "./register-sw";
import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const GSC_VERIFICATION = process.env.NEXT_PUBLIC_GSC_VERIFICATION;

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const viewport: Viewport = {
  themeColor: "#1a2440",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  // Bloquea el pinch-zoom para que se sienta como app nativa (y evita que quede
  // "alejada/diminuta" si el usuario hizo zoom-out sin querer).
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "Alma 3D Rent Card — Alquiler de Vehículos en República Dominicana",
    template: "%s | Alma 3D Rent Card",
  },
  description:
    "La mejor flota de vehículos en República Dominicana. Económicos, SUVs, pickups y más. Precios transparentes, sin cargos ocultos.",
  keywords: ["rent a car", "alquiler de carros", "República Dominicana", "Santo Domingo"],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Alma 3D Rent Card",
  },
  openGraph: {
    type: "website",
    locale: "es_DO",
    siteName: "Alma 3D Rent Card",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <head>
        {GSC_VERIFICATION && (
          <meta name="google-site-verification" content={GSC_VERIFICATION} />
        )}
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}</Script>
          </>
        )}
        <RegisterSW />
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
