"use client";

import { useEffect } from "react";
import { fundoDaImagem } from "@/lib/navegador/fundo-imagem";
import { corDoTexto } from "@/lib/regras/contraste";

/**
 * O logótipo na capa (D-198), solto, sem moldura: a capa tem a cor do fundo dele, por isso
 * encaixa na página. Para os logótipos carregados antes de a cor ser guardada, lê-a aqui uma vez
 * e pinta a capa (até o gestor voltar a carregar o logótipo).
 */
export function LogoCapa({
  nome,
  logo,
  fundoGuardado,
}: {
  nome: string;
  logo: string;
  fundoGuardado: boolean;
}) {
  useEffect(() => {
    if (fundoGuardado) return;
    void fundoDaImagem(logo).then((f) => {
      const capa = document.getElementById("capa");
      if (!f || !capa) return;
      capa.style.setProperty("--capa-fundo", f);
      capa.style.setProperty("--capa-tinta", corDoTexto(f));
    });
  }, [logo, fundoGuardado]);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- imagem pública do Storage, sem otimizador
    <img
      src={logo}
      alt={nome}
      className="h-32 w-auto max-w-full object-contain md:h-auto md:max-h-[46svh] md:w-full"
      fetchPriority="high"
    />
  );
}
