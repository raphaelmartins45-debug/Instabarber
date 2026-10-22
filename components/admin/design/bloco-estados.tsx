import { CalendarDays } from "lucide-react";
import { Aviso } from "@/components/nucleo/aviso";
import { ChamadaUpgrade } from "@/components/nucleo/chamada-upgrade";
import { Esqueleto } from "@/components/nucleo/esqueleto";
import { EstadoVazio } from "@/components/nucleo/estado-vazio";
import { Etiqueta, type TomEtiqueta } from "@/components/nucleo/etiqueta";
import { Secao } from "@/components/nucleo/secao";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.admin.design;

// Os rótulos são os do esquema (D-134): ciclos do clube, acertos, marcações e mensalidades.
const ETIQUETAS: { tom: TomEtiqueta; texto: string }[] = [
  { tom: "sucesso", texto: textos.financeiro.contas.pago },
  { tom: "alerta", texto: textos.financeiro.contas.porPagar },
  { tom: "perda", texto: textos.admin.estadosPagamento.em_atraso },
  { tom: "info", texto: textos.financeiro.acertos.estados.a_receber! },
  { tom: "destaque", texto: textos.admin.planos.pro },
  { tom: "neutro", texto: textos.agenda.estados.cancelada! },
];

/** Etiquetas, avisos, vazio, carregamento e upgrade do catálogo. */
export function BlocoEstados() {
  return (
    <>
      <Secao id="design-etiquetas" titulo={t.etiquetas}>
        <div className="flex flex-wrap gap-2">
          {ETIQUETAS.map((e) => (
            <Etiqueta key={e.texto} tom={e.tom}>
              {e.texto}
            </Etiqueta>
          ))}
        </div>
      </Secao>
      <Secao id="design-avisos" titulo={t.avisos}>
        <div className="grid gap-2 md:grid-cols-2">
          <Aviso tipo="sucesso">{t.avisoSucesso}</Aviso>
          <Aviso tipo="erro">{t.avisoErro}</Aviso>
        </div>
      </Secao>
      <div className="grid gap-6 md:grid-cols-2">
        <Secao id="design-vazio" titulo={t.vazio}>
          <EstadoVazio
            icone={CalendarDays}
            titulo={t.vazioTitulo}
            texto={t.vazioTexto}
            acao={<Button size="sm">{t.vazioAcao}</Button>}
          />
        </Secao>
        <Secao id="design-esqueleto" titulo={t.esqueleto}>
          <div className="cartao grid gap-3 rounded-2xl p-5">
            <Esqueleto className="h-3 w-24" />
            <Esqueleto className="h-8 w-40" />
            <Esqueleto className="h-24 w-full" />
          </div>
        </Secao>
      </div>
      <Secao id="design-upgrade" titulo={t.upgrade}>
        <ChamadaUpgrade />
      </Secao>
    </>
  );
}
