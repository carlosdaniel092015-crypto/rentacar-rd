import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    {
      name: "Alma 3D Rent Card - Panel administrativo",
      short_name: "Alma 3D Admin",
      description: "Panel administrativo de Alma 3D Rent Card.",
      id: "/admin",
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
