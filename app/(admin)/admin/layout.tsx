import type { Metadata } from "next";
import type { ReactNode } from "react";

// Entradas, painéis e área de administração nunca se indexam (J.1, Interface).
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function SemIndexar({ children }: { children: ReactNode }) {
  return children;
}
