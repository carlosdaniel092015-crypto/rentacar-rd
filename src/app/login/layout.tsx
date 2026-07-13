import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  manifest: "/admin/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Alma 3D Admin",
  },
  other: { "mobile-web-app-capable": "yes" },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
