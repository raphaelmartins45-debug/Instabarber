import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { SCRIPT_APARENCIA } from "@/lib/design/aparencia";
import { textos } from "@/lib/i18n/pt-PT";
import "./globals.css";

// Inter (I.2), servida pelo próprio site: o next/font descarrega-a no build.
const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: textos.marca.nome,
  icons: {
    icon: [{ url: "/marca/favicon2-32.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/marca/ib2-180.png" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#09090B" },
    { media: "(prefers-color-scheme: light)", color: "#FAFAF9" },
  ],
};

export default function LayoutRaiz({ children }: { children: ReactNode }) {
  return (
    // A aparência (modo e destaque, D-134) entra antes da primeira pintura: o script muda os
    // atributos do <html> antes de o React hidratar, por isso o aviso de diferença é esperado.
    <html lang="pt-PT" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_APARENCIA }} />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
