import Link from "next/link";
import { Etiqueta, type TomEtiqueta } from "@/components/nucleo/etiqueta";
import { type Coluna, TabelaCartoes } from "@/components/nucleo/tabela-cartoes";
import type { Motivo, Nivel } from "@/lib/admin/saude";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.gestao.saude;
const TOM: Record<Nivel, TomEtiqueta> = { risco: "perda", atencao: "alerta", bom: "sucesso" };

export type LinhaTabelaSaude = {
  id: string;
  nome: string;
  nivel: Nivel;
  motivos: Motivo[];
  marcacoes30: number;
  marcacoesAnteriores30: number;
  arranque: number;
};

/** Saúde de cada barbearia (sugestão A): primeiro as em risco, depois as que pedem atenção. */
export function TabelaSaude({ linhas }: { linhas: LinhaTabelaSaude[] }) {
  const colunas: Coluna<LinhaTabelaSaude>[] = [
    {
      id: "barbearia",
      rotulo: t.colunas.barbearia,
      valor: (l) => (
        <Link href={`/admin/barbearias/${l.id}`} className="font-semibold text-ligacao underline">
          {l.nome}
        </Link>
      ),
    },
    {
      id: "nivel",
      rotulo: t.colunas.nivel,
      valor: (l) => <Etiqueta tom={TOM[l.nivel]}>{t.niveis[l.nivel]}</Etiqueta>,
    },
    {
      id: "motivos",
      rotulo: t.colunas.motivos,
      valor: (l) =>
        l.motivos.length ? (
          <ul className="grid gap-0.5 text-sm">
            {l.motivos.map((m) => (
              <li key={m}>{t.motivos[m]}</li>
            ))}
          </ul>
        ) : (
          <span className="text-sm text-muted-foreground">{t.semMotivos}</span>
        ),
    },
    {
      id: "marcacoes",
      rotulo: t.colunas.marcacoes,
      valor: (l) => t.marcacoes(l.marcacoes30, l.marcacoesAnteriores30),
    },
    { id: "arranque", rotulo: t.colunas.arranque, valor: (l) => `${l.arranque} %` },
  ];
  return (
    <TabelaCartoes
      colunas={colunas}
      linhas={linhas}
      chave={(l) => l.id}
      vazio={t.vazio}
      testId="saude"
    />
  );
}
