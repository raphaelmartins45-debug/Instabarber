import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { textos } from "@/lib/i18n/pt-PT";
import "./globals.css";

export const metadata: Metadata = {
  title: textos.marca.nome,
  icons: {
    icon: [{ url: "/marca/favicon2-32.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/marca/ib2-180.png" }],
  },
};

export const viewport: Viewport = { themeColor: "#12100E" };

export default function LayoutRaiz({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-PT">
      <body>{children}</body>
    </html>
  );
}
