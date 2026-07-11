import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Alma 3D Rent Card — Alquiler de Vehículos",
    short_name: "Alma 3D",
    description:
      "La mejor flota de vehículos en República Dominicana. Precios transparentes, sin cargos ocultos.",
    start_url: "/login",
    display: "standalone",
    orientation: "portrait",
    background_color: "#1a2440",
    theme_color: "#1a2440",
    categories: ["travel", "business"],
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
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
    ],
    screenshots: [],
  };
}
