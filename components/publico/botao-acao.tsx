import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Botão de ação das páginas do cliente (I.2): título em negrito e uma linha secundária em cinzento
 * claro. Ligações externas (wa.me, tel:) abrem sem o encaminhamento do Next.
 */
export function BotaoAcao({
  href,
  titulo,
  linha,
  variante,
  cor,
  corTexto,
  testId,
}: {
  href: string;
  titulo: ReactNode;
  linha?: ReactNode;
  variante: "principal" | "verde" | "discreto";
  /** Cor da marca no botão principal. */
  cor?: string;
  corTexto?: string;
  testId?: string;
}) {
  const classe = cn(
    "grid min-h-14 w-full content-center rounded-xl px-5 py-3 text-left shadow-sm transition-opacity hover:opacity-90",
    variante === "verde" && "bg-[#1F9D55] text-white",
    variante === "discreto" && "border border-current/20 bg-white/10 backdrop-blur",
  );
  const estilo = variante === "principal" ? { backgroundColor: cor, color: corTexto } : undefined;
  const conteudo = (
    <>
      <span className="text-[15px] font-bold">{titulo}</span>
      {linha ? <span className="text-xs opacity-75">{linha}</span> : null}
    </>
  );
  return href.startsWith("/") ? (
    <Link href={href} className={classe} style={estilo} data-testid={testId}>
      {conteudo}
    </Link>
  ) : (
    <a
      href={href}
      className={classe}
      style={estilo}
      data-testid={testId}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
    >
      {conteudo}
    </a>
  );
}
