import Link from "next/link";
import { BotaoMensagem } from "@/components/barbearia/botao-mensagem";
import { BotaoUpgrade, ChamadaUpgrade } from "@/components/nucleo/chamada-upgrade";
import { textos } from "@/lib/i18n/pt-PT";
import { mensagemParaCliente } from "@/lib/painel/mensagens";
import type { LinhaRadar } from "@/lib/painel/radar";

const t = textos.inicio;
const MAXIMO = 5;

/**
 * Clientes a contactar (E.2): em risco e perdidos, os que estão há mais tempo sem vir primeiro.
 * Botão de mensagem no Pro; no Basic, a chamada de upgrade.
 */
export function ClientesContactar({
  linhas,
  mensagens,
  pagina,
  assinatura,
  base,
}: {
  linhas: LinhaRadar[];
  /** `envio_mensagens` ativo; senão, «Upgrade». */
  mensagens: boolean;
  pagina: string;
  assinatura: string;
  /** Endereço da ficha do cliente (`${base}/${id}`). */
  base: string;
}) {
  const lista = linhas
    .filter((l) => ["em_risco", "perdido"].includes(l.classificacao.estado) && l.contactavel)
    .sort((a, b) => (b.classificacao.diasSemVir ?? 0) - (a.classificacao.diasSemVir ?? 0))
    .slice(0, MAXIMO);
  if (lista.length === 0)
    return <p className="text-sm text-muted-foreground">{t.contactarVazio}</p>;
  return (
    <div className="grid gap-3">
      <ul className="grid gap-2">
        {lista.map((l) => {
          const m = mensagens ? mensagemParaCliente(l, pagina, assinatura) : null;
          return (
            <li
              key={l.cliente.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2 text-sm"
            >
              <Link href={`${base}/${l.cliente.id}`} className="underline-offset-4 hover:underline">
                <span className="font-semibold">{l.cliente.nome}</span>
                <span className="text-muted-foreground">
                  {" "}
                  · {textos.clientes.estados[l.classificacao.estado]} ·{" "}
                  {textos.clientes.diasSemVir(l.classificacao.diasSemVir ?? 0)}
                </span>
              </Link>
              {m ? (
                <BotaoMensagem
                  ligacao={m.ligacao}
                  clienteId={l.cliente.id}
                  tipo={m.tipo}
                  conteudo={m.conteudo}
                  rotulo={t.mensagem}
                />
              ) : !mensagens ? (
                <BotaoUpgrade rotulo={t.mensagem} />
              ) : null}
            </li>
          );
        })}
      </ul>
      {!mensagens ? <ChamadaUpgrade /> : null}
    </div>
  );
}
