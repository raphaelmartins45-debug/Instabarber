"use client";

import { Aviso } from "@/components/nucleo/aviso";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import { gerarResumoContratacao, type DadosResumo } from "@/lib/pdf/resumo-contratacao";

const t = textos.adesao.enviado;

/** Confirmação do envio, com o resumo da contratação em PDF para o dono guardar (D.11). */
export function PedidoEnviado({ resumo }: { resumo: DadosResumo }) {
  return (
    <div className="grid gap-4" data-testid="pedido-enviado">
      <Aviso tipo="sucesso">{t.titulo}</Aviso>
      <p className="text-sm">{t.texto}</p>
      <Button
        type="button"
        size="lg"
        className="h-11"
        onClick={() => gerarResumoContratacao(resumo).save(textos.adesao.pdf.ficheiro)}
      >
        {t.resumo}
      </Button>
    </div>
  );
}
