"use client";

import { useEffect } from "react";
import { PaginaIndisponivel } from "@/components/nucleo/pagina-indisponivel";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.paineis.indisponivel;

/** Página de erro (D-197): tentar outra vez ou seguir por outro caminho, com o apoio à mão. */
export default function Erro({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("pagina_com_erro", error.digest ?? error.message);
  }, [error]);
  return <PaginaIndisponivel titulo={t.tituloErro} texto={t.textoErro} aoTentar={reset} />;
}
