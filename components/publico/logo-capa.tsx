"use client";

import { useEffect, useRef } from "react";
import { fundoDaImagem } from "@/lib/navegador/fundo-imagem";
import { coresDaCapa } from "@/lib/publico/cores-capa";
import { cn } from "@/lib/utils";

/**
 * O logótipo na capa (D-198), solto, sem moldura: o contentor tem a cor do fundo dele, por isso
 * encaixa na página. Para os logótipos carregados antes de a cor ser guardada, lê-a aqui uma vez
 * e pinta o contentor mais próximo marcado com `data-fundo-logo` (até o gestor o voltar a carregar).
 */
export function LogoCapa({
  nome,
  logo,
  fundoGuardado,
  cor,
  className,
}: {
  nome: string;
  logo: string;
  fundoGuardado: boolean;
  /** A cor da barbearia, para recalcular o botão sobre o fundo lido. */
  cor: string;
  className?: string;
}) {
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (fundoGuardado) return;
    void fundoDaImagem(logo).then((f) => {
      const caixa = ref.current?.closest<HTMLElement>("[data-fundo-logo]");
      if (!f || !caixa) return;
      // As mesmas regras do servidor (coresDaCapa), agora com o fundo lido.
      const k = coresDaCapa(cor, f);
      caixa.style.backgroundColor = k.fundo;
      caixa.style.color = k.tinta;
      caixa.style.setProperty("--capa-destaque", k.destaque);
      caixa.style.setProperty("--capa-tinta-destaque", k.tintaDestaque);
    });
  }, [logo, fundoGuardado, cor]);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- imagem pública do Storage, sem otimizador
    <img
      ref={ref}
      src={logo}
      alt={nome}
      className={cn("max-h-full max-w-full object-contain", className)}
      fetchPriority="high"
    />
  );
}
