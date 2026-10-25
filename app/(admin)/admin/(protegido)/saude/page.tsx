import { CartoesArranque } from "@/components/admin/gestao/cartoes-arranque";
import { TabelaSaude } from "@/components/admin/gestao/tabela-saude";
import { Secao } from "@/components/nucleo/secao";
import { arranque, saude } from "@/lib/admin/saude";
import { diasEntreDatas, hojeIso } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import { dadosDeSaude } from "@/lib/repositorios/admin/saude";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.gestao;
export const metadata = { title: `${t.saude.titulo} · ${textos.marca.nome}` };

const ORDEM = { risco: 0, atencao: 1, bom: 2 } as const;

/** Saúde das barbearias (sugestão A) e arranque das novas (sugestão B), D-159. */
export default async function SaudeDasBarbearias() {
  const hoje = hojeIso();
  const dados = await dadosDeSaude(await criarClienteServidor());
  const linhas = dados
    .map((d) => ({ ...d, ...saude(d, hoje), arr: arranque(d) }))
    .sort((a, b) => ORDEM[a.nivel] - ORDEM[b.nivel] || a.nome.localeCompare(b.nome));
  const emArranque = linhas.filter(
    (l) => l.arr.percentagem < 100 || (l.aprovadaEm && diasEntreDatas(l.aprovadaEm, hoje) < 60),
  );
  return (
    <section className="grid gap-6">
      <h1 className="text-[22px] font-extrabold tracking-tight">{t.saude.titulo}</h1>
      <p className="text-sm text-muted-foreground">{t.saude.ajuda}</p>
      <p className="font-semibold" data-testid="saude-contagem">
        {t.saude.contagem(
          linhas.filter((l) => l.nivel === "risco").length,
          linhas.filter((l) => l.nivel === "atencao").length,
        )}
      </p>
      <TabelaSaude
        linhas={linhas.map((l) => ({
          id: l.id,
          nome: l.nome,
          nivel: l.nivel,
          motivos: l.motivos,
          marcacoes30: l.marcacoes30,
          marcacoesAnteriores30: l.marcacoesAnteriores30,
          arranque: l.arr.percentagem,
        }))}
      />
      <Secao id="arranque" titulo={t.arranque.titulo}>
        <div className="grid gap-3">
          <p className="text-sm text-muted-foreground">{t.arranque.ajuda}</p>
          <CartoesArranque
            cartoes={emArranque.map((l) => ({
              id: l.id,
              nome: l.nome,
              percentagem: l.arr.percentagem,
              feito: l.arr.feito,
            }))}
          />
        </div>
      </Secao>
    </section>
  );
}
