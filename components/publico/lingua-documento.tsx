"use client";

import { useEffect } from "react";

/**
 * Diz ao browser a língua em que a página está (D-178): o `<html>` nasce em português e, numa
 * página em inglês ou francês, o tradutor do telemóvel (Chrome, Safari) partia da língua errada.
 */
export function LinguaDocumento({ lingua }: { lingua: string }) {
  useEffect(() => {
    const anterior = document.documentElement.lang;
    document.documentElement.lang = lingua;
    return () => {
      document.documentElement.lang = anterior;
    };
  }, [lingua]);
  return null;
}
