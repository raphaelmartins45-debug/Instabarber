import { AcoesLembrete } from "@/components/admin/financas/acoes-lembrete";
import { Etiqueta } from "@/components/nucleo/etiqueta";
import {
  type FiltroVencimentos,
  filtrarVencimentos,
  textoLembrete,
} from "@/lib/financas/mensagens";
import { dataCurta, dataHora } from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { lerRegimeIva } from "@/lib/regras/mensalidade";
import { precoDaBarbearia } from "@/lib/regras/receita";
import { listarVencimentos } from "@/lib/repositorios/vencimentos";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { cn } from "@/lib/utils";

const t = textos.financas.vencimentos;
export const metadata = {
  title: `${textos.financas.separadores.vencimentos} · ${textos.financas.titulo}`,
};
const FILTROS: FiltroVencimentos[] = ["7", "15", "atraso", "todos"];

/** Vencimentos (O.9): quem vence, com o texto pronto por WhatsApp e por e-mail. */
export default async function Vencimentos({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>;
}) {
  const { filtro: pedido } = await searchParams;
  const filtro = FILTROS.includes(pedido as FiltroVencimentos)
    ? (pedido as FiltroVencimentos)
    : "7";
  const regime = lerRegimeIva(process.env.PRESTADORA_REGIME_IVA);
  const linhas = filtrarVencimentos(await listarVencimentos(await criarClienteServidor()), filtro);
  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">{t.ajuda}</p>
      <nav className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <a
            key={f}
            href={`?filtro=${f}`}
            aria-current={f === filtro ? "page" : undefined}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm",
              f === filtro ? "border-primary bg-accent font-semibold" : "text-muted-foreground",
            )}
          >
            {t.filtros[f]}
          </a>
        ))}
      </nav>
      {!linhas.length ? <p className="text-sm text-muted-foreground">{t.vazio}</p> : null}
      <ul className="grid gap-3">
        {linhas.map((l) => {
          const valor = formatarDinheiro(
            precoDaBarbearia(
              {
                plano: l.plano,
                periodicidade: l.periodicidade,
                profissionais_contratados: l.profissionais,
                dominio_proprio: l.dominioProprio,
                estado: l.estado,
              },
              regime,
            ).comIva,
          );
          const plano = textos.admin.planos[l.plano as "basic" | "pro"] ?? l.plano;
          const data = dataCurta(`${l.vencimento}T12:00:00Z`);
          return (
            <li
              key={l.inquilinoId}
              className="cartao grid gap-3 rounded-2xl p-4"
              data-testid="vencimento"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="grid">
                  <p className="font-semibold">{l.nome}</p>
                  <p className="text-sm text-muted-foreground">
                    {plano} · {t.valor(valor)} · {data}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Etiqueta tom={l.dias < 0 ? "perda" : l.dias <= 7 ? "alerta" : "neutro"}>
                    {t.dias(l.dias)}
                  </Etiqueta>
                  <Etiqueta tom={l.estadoPagamento === "em_atraso" ? "perda" : "sucesso"}>
                    {textos.admin.estadosPagamento[l.estadoPagamento as "em_dia" | "em_atraso"]}
                  </Etiqueta>
                  {l.lembrete ? (
                    <Etiqueta tom="info">{t.estados[l.lembrete.estado]}</Etiqueta>
                  ) : null}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {l.ultimoLembreteEm ? t.ultimo(dataHora(l.ultimoLembreteEm)) : t.nenhum}
              </p>
              <AcoesLembrete
                inquilinoId={l.inquilinoId}
                textoProposto={textoLembrete({
                  responsavel: l.responsavel,
                  barbearia: l.nome,
                  plano,
                  valorComIva: valor,
                  vencimento: data,
                  dias: l.dias,
                })}
                whatsapp={l.whatsapp}
                email={l.email}
                lembrete={l.lembrete}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
