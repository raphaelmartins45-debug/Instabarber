import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import type { TextosPublicos } from "@/lib/i18n/publico";
import { Escolha } from "./escolha";
import type { BarbeiroMarcacao, ServicoMarcacao } from "./tipos";

/** Passo 1 (E.4): o serviço, com a duração e o preço final. */
export function PassoServico({
  t,
  servicos,
  aoEscolher,
}: {
  t: TextosPublicos;
  servicos: ServicoMarcacao[];
  aoEscolher: (s: ServicoMarcacao) => void;
}) {
  return (
    <>
      <h2 className="text-lg font-extrabold">{t.marcacao.servico}</h2>
      {servicos.map((s) => (
        <Escolha
          key={s.id}
          titulo={s.nome}
          linha={`${t.blocos.minutos(s.duracao)}${s.descricao ? ` · ${s.descricao}` : ""}`}
          lado={formatarDinheiro(s.precoCent)}
          testId="escolher-servico"
          aoEscolher={() => aoEscolher(s)}
        />
      ))}
    </>
  );
}

/** Passo 2 (E.4): o barbeiro, com fotografia, ou «Sem preferência». */
export function PassoBarbeiro({
  t,
  equipa,
  aoEscolher,
}: {
  t: TextosPublicos;
  equipa: BarbeiroMarcacao[];
  aoEscolher: (id: string | null) => void;
}) {
  return (
    <>
      <h2 className="text-lg font-extrabold">{t.marcacao.barbeiro}</h2>
      <Escolha
        titulo={t.marcacao.semPreferencia}
        linha={t.marcacao.semPreferenciaAjuda}
        testId="sem-preferencia"
        aoEscolher={() => aoEscolher(null)}
      />
      {equipa.map((b) => (
        <Escolha
          key={b.id}
          titulo={b.nome}
          imagem={b.fotoUrl}
          testId="escolher-barbeiro"
          aoEscolher={() => aoEscolher(b.id)}
        />
      ))}
    </>
  );
}
