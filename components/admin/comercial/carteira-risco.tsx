import { Etiqueta } from "@/components/nucleo/etiqueta";
import { type Coluna, TabelaCartoes } from "@/components/nucleo/tabela-cartoes";
import type { Motivo, Nivel } from "@/lib/admin/saude";
import { textos } from "@/lib/i18n/pt-PT";
import { ligacaoParaTelefone } from "@/lib/regras/whatsapp";

const t = textos.comercial.carteiraRisco;
const s = textos.gestao.saude;
const TOM = { risco: "perda", atencao: "alerta", bom: "sucesso" } as const;

export type LinhaCarteira = {
  inquilinoId: string;
  nome: string;
  responsavel: string | null;
  telefone: string | null;
  nivel: Nivel;
  motivos: Motivo[];
};

/** A carteira do comercial com o risco de cada barbearia (D-162), para cuidar do cliente. */
export function CarteiraRisco({ linhas }: { linhas: LinhaCarteira[] }) {
  const colunas: Coluna<LinhaCarteira>[] = [
    { id: "nome", rotulo: t.colunas.barbearia, valor: (l) => l.nome },
    {
      id: "estado",
      rotulo: t.colunas.estado,
      valor: (l) => <Etiqueta tom={TOM[l.nivel]}>{s.niveis[l.nivel]}</Etiqueta>,
    },
    {
      id: "sinais",
      rotulo: t.colunas.sinais,
      valor: (l) =>
        l.motivos.length ? (
          <span className="text-sm">{l.motivos.map((m) => s.motivos[m]).join(" · ")}</span>
        ) : (
          <span className="text-sm text-muted-foreground">{t.semSinais}</span>
        ),
    },
    {
      id: "contacto",
      rotulo: t.colunas.contacto,
      valor: (l) => {
        const wa = ligacaoParaTelefone(
          l.telefone,
          textos.comercial.mensagens.textos.acompanhamento(l.responsavel || l.nome),
        );
        return wa ? (
          <a href={wa} target="_blank" rel="noreferrer" className="text-ligacao underline">
            {t.contactar}
          </a>
        ) : null;
      },
    },
  ];
  return (
    <TabelaCartoes
      colunas={colunas}
      linhas={linhas}
      chave={(l) => l.inquilinoId}
      vazio={textos.comercial.desempenho.carteiraVazia}
      testId="carteira"
    />
  );
}
