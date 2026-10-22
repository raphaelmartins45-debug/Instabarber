"use client";

import { useState, useTransition } from "react";
import { cancelarMarcacao } from "@/app/(publico)/b/[slug]/minha-area/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { ConfirmarAcao } from "@/components/nucleo/confirmar-acao";
import { Button } from "@/components/ui/button";
import { dataLongaNaLingua, horaCurta } from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textosPublicos, type Lingua } from "@/lib/i18n/publico";

/** Próxima marcação, com «Cancelar» até à antecedência definida pela barbearia (E.4). */
export function ProximaMarcacao({
  lingua,
  id,
  inicio,
  servico,
  barbeiro,
  valorCent,
  cancelamentoMin,
}: {
  lingua: Lingua;
  id: string;
  inicio: string;
  servico: string;
  barbeiro: string;
  valorCent: number;
  cancelamentoMin: number;
}) {
  const t = textosPublicos(lingua);
  const [estado, setEstado] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aCancelar, iniciar] = useTransition();
  const podeCancelar = new Date(inicio).getTime() - Date.now() > cancelamentoMin * 60_000;
  return (
    <div className="grid gap-2" data-testid="proxima-marcacao">
      <p className="font-semibold first-letter:uppercase">
        {t.marcacao.resumo(servico, barbeiro, dataLongaNaLingua(inicio, lingua), horaCurta(inicio))}
      </p>
      <p className="text-sm text-muted-foreground">
        {t.marcacao.valor}: {formatarDinheiro(valorCent)}
      </p>
      {estado ? (
        <Aviso tipo={estado.tipo}>{estado.texto}</Aviso>
      ) : podeCancelar ? (
        <ConfirmarAcao
          titulo={t.area.cancelarTitulo}
          descricao={t.area.cancelarTexto}
          confirmar={t.area.cancelar}
          aoConfirmar={() =>
            iniciar(async () => {
              const r = await cancelarMarcacao(id);
              setEstado(
                r.ok
                  ? { tipo: "sucesso", texto: t.area.cancelada }
                  : { tipo: "erro", texto: t.area.foraPrazo(t.duracao(cancelamentoMin)) },
              );
            })
          }
        >
          <Button variant="outline" className="h-11 justify-self-start" disabled={aCancelar}>
            {t.area.cancelar}
          </Button>
        </ConfirmarAcao>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t.area.foraPrazo(t.duracao(cancelamentoMin))}
        </p>
      )}
    </div>
  );
}
