import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { textos } from "@/lib/i18n/pt-PT";
import "./globals.css";

// Inter (I.2), servida pelo próprio site: o next/font descarrega-a no build.
const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: textos.marca.nome,
  icons: {
    icon: [{ url: "/marca/favicon-32.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/marca/ib-180.png" }],
  },
};

export const viewport: Viewport = { themeColor: "#12100E" };

export default function LayoutRaiz({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-PT">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
