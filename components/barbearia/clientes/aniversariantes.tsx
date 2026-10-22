import { BotaoMensagem } from "@/components/barbearia/botao-mensagem";
import { BotaoUpgrade } from "@/components/nucleo/chamada-upgrade";
import { nomeDoMes } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import type { LinhaRadar } from "@/lib/painel/radar";
import { mensagemAniversario } from "@/lib/regras/mensagens";
import { ligacaoWhatsApp } from "@/lib/regras/whatsapp";

const t = textos.clientes.aniversarios;

/**
 * Campanha de aniversário (F.3.1): a lista do mês nos dois planos; abrir a felicitação é do Pro.
 * A mensagem nunca fala do desconto: quando ativo, aparece aqui só como nota interna.
 */
export function Aniversariantes({
  linhas,
  mes,
  mensagens,
  desconto,
  assinatura,
}: {
  linhas: LinhaRadar[];
  /** «AAAA-MM». */
  mes: string;
  mensagens: boolean;
  /** Percentagem do desconto de aniversário, se ativo. */
  desconto: string | null;
  assinatura: string;
}) {
  const doMes = linhas
    .filter(
      (l) =>
        l.cliente.data_nascimento?.slice(5, 7) === mes.slice(5, 7) && !l.cliente.anonimizado_em,
    )
    .sort((a, b) =>
      a.cliente.data_nascimento!.slice(8).localeCompare(b.cliente.data_nascimento!.slice(8)),
    );
  return (
    <section className="grid gap-3" aria-labelledby="aniversarios">
      <h2 id="aniversarios" className="text-[15px] font-bold">
        {t.titulo(nomeDoMes(mes))}
      </h2>
      {desconto ? <p className="text-sm text-muted-foreground">{t.desconto(desconto)}</p> : null}
      {doMes.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.vazio}</p>
      ) : (
        <ul className="grid gap-2">
          {doMes.map((l) => {
            const conteudo = mensagemAniversario(l.cliente.nome, assinatura);
            return (
              <li
                key={l.cliente.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2 text-sm"
              >
                <span>
                  <span className="font-semibold">{l.cliente.nome}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · {l.cliente.data_nascimento!.slice(8, 10)}
                  </span>
                </span>
                {!mensagens ? (
                  <BotaoUpgrade rotulo={t.mensagem} />
                ) : l.contactavel && l.cliente.telefone ? (
                  <BotaoMensagem
                    ligacao={ligacaoWhatsApp(l.cliente.telefone, conteudo)}
                    clienteId={l.cliente.id}
                    tipo="aniversario"
                    conteudo={conteudo}
                    rotulo={t.mensagem}
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
