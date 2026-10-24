import { Etiqueta, type TomEtiqueta } from "@/components/nucleo/etiqueta";
import { type Coluna, TabelaCartoes } from "@/components/nucleo/tabela-cartoes";
import { dataCurta } from "@/lib/formatacao/datas";
import { formatarDinheiro, textoDeCentimos } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import type { Conta } from "@/lib/repositorios/financas";
import { apagarUmaConta, pagar } from "@/app/(admin)/admin/(protegido)/financas/acoes";
import { BotaoAcao } from "./botao-acao";
import { FormularioConta } from "./formulario-conta";

const t = textos.financas;
const data = (d: string | null) => (d ? dataCurta(`${d}T12:00:00Z`) : textos.comum.vazio);
const TOM: Record<Conta["estado"], TomEtiqueta> = {
  pendente: "info",
  atrasada: "perda",
  paga: "sucesso",
};

/** Contas a pagar (O.4) com o estado calculado ao ler: pendente, atrasada ou paga. */
export function ListaContas({ contas }: { contas: Conta[] }) {
  const colunas: Coluna<Conta>[] = [
    {
      id: "fornecedor",
      rotulo: t.contas.colunas.fornecedor,
      valor: (c) => (
        <span className="grid">
          <span className="font-semibold">{c.fornecedor}</span>
          {c.descricao && c.descricao !== c.fornecedor ? (
            <span className="text-xs text-muted-foreground">{c.descricao}</span>
          ) : null}
        </span>
      ),
    },
    { id: "sem", rotulo: t.contas.colunas.semIva, valor: (c) => formatarDinheiro(c.semIvaCent) },
    { id: "com", rotulo: t.contas.colunas.comIva, valor: (c) => formatarDinheiro(c.comIvaCent) },
    { id: "vencimento", rotulo: t.contas.colunas.vencimento, valor: (c) => data(c.vencimento) },
    {
      id: "estado",
      rotulo: t.contas.colunas.estado,
      valor: (c) => <Etiqueta tom={TOM[c.estado]}>{t.estadosConta[c.estado]}</Etiqueta>,
    },
    { id: "paga", rotulo: t.contas.colunas.pagaEm, valor: (c) => data(c.pagoEm) },
    {
      id: "acoes",
      rotulo: "",
      valor: (c) => (
        <div className="flex flex-wrap items-start gap-2">
          {c.estado !== "paga" ? (
            <BotaoAcao rotulo={t.contas.pagar} acao={pagar.bind(null, c.id)} />
          ) : null}
          <details className="w-full">
            <summary className="cursor-pointer text-sm text-ligacao underline">
              {t.custos.editar}
            </summary>
            <div className="pt-3">
              <FormularioConta
                id={c.id}
                inicial={{
                  fornecedor: c.fornecedor,
                  descricao: c.descricao,
                  valor_sem_iva: textoDeCentimos(c.semIvaCent),
                  valor_com_iva: textoDeCentimos(c.comIvaCent),
                  vencimento: c.vencimento,
                  nota: c.nota,
                }}
              />
            </div>
          </details>
          <BotaoAcao
            rotulo={t.contas.apagar}
            acao={apagarUmaConta.bind(null, c.id)}
            confirmar={{ titulo: t.contas.apagarTitulo, texto: t.contas.apagarTexto }}
            variante="ghost"
          />
        </div>
      ),
    },
  ];
  return (
    <TabelaCartoes
      colunas={colunas}
      linhas={contas}
      chave={(c) => c.id}
      vazio={t.contas.vazio}
      testId="conta"
    />
  );
}
