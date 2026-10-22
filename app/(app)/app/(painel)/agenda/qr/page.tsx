import { BotaoImprimir } from "@/components/nucleo/botao-imprimir";
import { CodigoQr } from "@/components/nucleo/codigo-qr";
import { PainelGestor } from "@/components/barbearia/painel-gestor";
import { exigirGestor } from "@/lib/equipa/contexto";
import { exigirFuncionalidade } from "@/lib/funcionalidades/servidor";
import { textos } from "@/lib/i18n/pt-PT";
import { paginaPublica } from "@/lib/inquilino/endereco";
import { vertical } from "@/lib/vertical/barbearia";

const t = textos.filas;
export const metadata = { title: `${t.qrTitulo} · ${vertical.camadas.gestao}` };

/** O código QR da fila presencial (F.4.3), para imprimir e afixar. */
export default async function CodigoDaFila() {
  const contexto = await exigirGestor();
  await exigirFuncionalidade(contexto.barbearia.id, "qr_entrada");
  const endereco = `${await paginaPublica(contexto.barbearia.slug)}/fila`;
  return (
    <PainelGestor atual="agenda">
      <div className="grid justify-items-center gap-4 text-center">
        <h1 className="text-[22px] font-extrabold">{contexto.barbearia.nome}</h1>
        <p className="text-sm text-muted-foreground print:hidden">{t.qrAjuda}</p>
        <CodigoQr texto={endereco} rotulo={t.qrTitulo} />
        <p className="font-mono text-sm break-all" data-testid="endereco-fila">
          {endereco}
        </p>
        <BotaoImprimir rotulo={t.imprimir} />
      </div>
    </PainelGestor>
  );
}
