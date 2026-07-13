import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    {
      name: "Alma 3D Rent Card - Panel administrativo",
      short_name: "Alma 3D Admin",
      description: "Panel administrativo de Alma 3D Rent Card.",
      // Abre en el login (no en la pantalla principal). El scope "/" permite que
      // login → panel se mantengan dentro de la app instalada (standalone); el
      // sitio público solo se abre vía "Ver sitio principal" (en pestaña externa).
      start_url: "/login",
      scope: "/",
      display: "standalone",
      orientation: "portrait",
      background_color: "#1a2440",
      theme_color: "#1a2440",
      categories: ["business"],
      lang: "es",
      icons: [
        {
          src: "/apple-touch-icon.png",
          sizes: "180x180",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/icon.svg",
          sizes: "any",
          type: "image/svg+xml",
          purpose: "maskable",
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/manifest+json",
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
}
