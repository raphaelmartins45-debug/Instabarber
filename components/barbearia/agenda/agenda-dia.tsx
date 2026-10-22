import Link from "next/link";
import { Indicador } from "@/components/nucleo/indicador";
import { dataHora, horaCurta } from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import type { AgendaDia as Agenda } from "@/lib/painel/agenda";
import { mensagemLembrete } from "@/lib/regras/mensagens";
import { ligacaoWhatsApp } from "@/lib/regras/whatsapp";
import type { MarcacaoDia } from "@/lib/repositorios/painel/agenda";
import { LinhaMarcacao } from "./linha-marcacao";

const t = textos.agenda;

/** A agenda de um dia: indicadores e uma coluna por profissional, com ausências e vagas livres. */
export function AgendaDia({
  agenda,
  barbearia,
  lembretes,
  marcar,
}: {
  agenda: Agenda;
  barbearia: string;
  /** Funcionalidade `lembretes_marcacao` ativa. */
  lembretes: boolean;
  /** Endereço do formulário de marcação ao balcão. */
  marcar: string;
}) {
  const agora = new Date();
  const ligacao = (m: MarcacaoDia) =>
    lembretes && m.telefone && m.cliente
      ? ligacaoWhatsApp(
          m.telefone,
          mensagemLembrete({
            cliente: m.cliente,
            servico: m.servico,
            inicio: m.inicio,
            barbeiro: m.profissional ?? "",
            barbearia,
          }),
        )
      : null;

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-3 gap-3">
        <Indicador rotulo={t.indicadores.marcacoes} valor={String(agenda.marcacoes)} />
        <Indicador
          rotulo={t.indicadores.faturacao}
          valor={formatarDinheiro(agenda.faturacaoCent)}
        />
        <Indicador
          rotulo={t.indicadores.ocupacao}
          valor={agenda.ocupacao === null ? textos.comum.vazio : `${agenda.ocupacao} %`}
        />
      </div>
      {agenda.fechado ? (
        <p className="rounded-lg border border-destaque/40 bg-accent px-3 py-2 text-sm">
          {t.fechada}
        </p>
      ) : null}
      {agenda.colunas.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.semProfissionais}</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {agenda.colunas.map((c) => (
            <section
              key={c.profissionalId}
              aria-labelledby={`col-${c.profissionalId}`}
              className="grid content-start gap-3 rounded-xl border bg-card p-4"
            >
              <h3 id={`col-${c.profissionalId}`} className="text-[15px] font-bold">
                {c.nome}
              </h3>
              {c.ausencias.map((a) => (
                <p
                  key={a.id}
                  className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground"
                >
                  {t.tiposAusencia[a.tipo] ?? t.ausente}: {dataHora(a.inicio)} – {dataHora(a.fim)}
                  {a.motivo ? ` · ${a.motivo}` : ""}
                </p>
              ))}
              {c.marcacoes.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.semMarcacoes}</p>
              ) : (
                <ul className="grid gap-2">
                  {c.marcacoes.map((m) => (
                    <LinhaMarcacao key={m.id} m={m} lembrete={ligacao(m)} agora={agora} />
                  ))}
                </ul>
              )}
              {c.livres.length ? (
                <div className="grid gap-2">
                  <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                    {t.livres}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {c.livres.map((inicio) => (
                      <Link
                        key={inicio}
                        href={`${marcar}?profissional=${c.profissionalId}&inicio=${encodeURIComponent(inicio)}`}
                        className="flex h-9 items-center rounded-md border border-dashed px-2.5 text-xs tabular-nums hover:bg-muted"
                        aria-label={`${t.livre} ${horaCurta(inicio)}`}
                      >
                        {horaCurta(inicio)}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
