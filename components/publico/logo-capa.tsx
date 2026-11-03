"use client";

import { useEffect, useRef } from "react";
import { fundoDaImagem } from "@/lib/navegador/fundo-imagem";
import { corDoTexto } from "@/lib/regras/contraste";
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
  className,
}: {
  nome: string;
  logo: string;
  fundoGuardado: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (fundoGuardado) return;
    void fundoDaImagem(logo).then((f) => {
      const caixa = ref.current?.closest<HTMLElement>("[data-fundo-logo]");
      if (!f || !caixa) return;
      caixa.style.setProperty("--capa-fundo", f);
      caixa.style.setProperty("--capa-tinta", corDoTexto(f));
      caixa.style.backgroundColor = f;
      caixa.style.color = corDoTexto(f);
    });
  }, [logo, fundoGuardado]);
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
