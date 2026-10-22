"use client";

import { useEffect } from "react";
import { vagasDoDia } from "@/app/(publico)/b/[slug]/marcar/acoes";
import { somarDias } from "@/lib/formatacao/datas";
import type { VagaPublica } from "@/lib/repositorios/marcacao-publica";

/** Dias em que «Repetir o último serviço» procura vaga (D-125). */
const DIAS_PROCURA = 30;

/**
 * «Repetir o último serviço» (E.4): à entrada, procura o primeiro horário livre do mesmo serviço
 * com o mesmo barbeiro, até 30 dias ou a janela de marcação, e reserva-o.
 */
export function useRepetir(o: {
  ativo: boolean;
  slug: string;
  servicoId?: string;
  profissionalId?: string;
  hoje: string;
  janelaDias: number;
  aoEncontrar: (v: VagaPublica) => void;
}) {
  useEffect(() => {
    if (!o.ativo || !o.servicoId || !o.profissionalId) return;
    let ativo = true;
    void (async () => {
      for (let i = 0; i <= Math.min(o.janelaDias, DIAS_PROCURA) && ativo; i++) {
        const vagas = await vagasDoDia(
          o.slug,
          o.servicoId!,
          somarDias(o.hoje, i),
          o.profissionalId!,
        );
        if (vagas[0]) return ativo && o.aoEncontrar(vagas[0]);
      }
    })();
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só à entrada
  }, []);
}
