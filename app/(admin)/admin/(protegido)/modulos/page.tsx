import { InterruptorModulo } from "@/components/admin/interruptor-modulo";
import { TabelaCartoes } from "@/components/nucleo/tabela-cartoes";
import { textos } from "@/lib/i18n/pt-PT";
import { chavesEmFalta } from "@/lib/pagamentos/configuracao";
import { listarBarbearias } from "@/lib/repositorios/admin/barbearias";
import {
  listarModulos,
  listarModulosBarbearias,
  type ChaveModulo,
} from "@/lib/repositorios/admin/modulos";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.admin.modulos;
export const metadata = { title: `${t.titulo} · ${textos.marca.nome}` };

const CHAVES: ChaveModulo[] = ["pagamentos", "faturacao"];

/** Pagamentos e faturação (G.4): interruptor geral e por barbearia, desligados por omissão. */
export default async function Modulos() {
  const bd = await criarClienteServidor();
  const [modulos, porBarbearia, barbearias] = await Promise.all([
    listarModulos(bd),
    listarModulosBarbearias(bd),
    listarBarbearias(bd),
  ]);
  const ativoEm = (inquilinoId: string, chave: ChaveModulo) =>
    porBarbearia.some((m) => m.inquilinoId === inquilinoId && m.chave === chave && m.ativo);
  return (
    <section className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="text-[22px] font-extrabold">{t.titulo}</h1>
        <p className="text-sm text-muted-foreground">{t.texto}</p>
        <p className="rounded-lg border border-destaque/40 bg-accent px-3 py-2 text-sm">
          {t.aviso}
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {CHAVES.map((chave) => {
          const m = modulos.find((x) => x.chave === chave);
          const emFalta = chavesEmFalta(chave);
          return (
            <article key={chave} className="grid gap-3 rounded-xl border bg-card p-4">
              <h2 className="text-[15px] font-bold">{t.nomes[chave]}</h2>
              <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                {t.geral}
              </span>
              <InterruptorModulo modulo={chave} ativo={!!m?.ativo} rotulo={t.nomes[chave]!} />
              {emFalta.length ? (
                <p className="text-xs text-muted-foreground">{t.emFalta(emFalta.join(", "))}</p>
              ) : null}
            </article>
          );
        })}
      </div>
      <h2 className="text-[15px] font-bold">{t.porBarbearia}</h2>
      <TabelaCartoes
        linhas={barbearias}
        chave={(b) => b.id}
        vazio={textos.comum.vazio}
        colunas={[
          { id: "nome", rotulo: t.barbearia, valor: (b) => b.nome },
          ...CHAVES.map((chave) => ({
            id: chave,
            rotulo: t.nomes[chave]!,
            valor: (b: (typeof barbearias)[number]) => (
              <InterruptorModulo
                modulo={chave}
                inquilinoId={b.id}
                ativo={ativoEm(b.id, chave)}
                rotulo={`${t.nomes[chave]} · ${b.nome}`}
              />
            ),
          })),
        ]}
      />
    </section>
  );
}
