import { BotaoMensagem } from "@/components/barbearia/botao-mensagem";
import { BotaoUpgrade } from "@/components/nucleo/chamada-upgrade";
import { textos } from "@/lib/i18n/pt-PT";
import { mensagemParaCliente } from "@/lib/painel/mensagens";
import type { LinhaRadar } from "@/lib/painel/radar";

const t = textos.clientes;

/** A coluna «Mensagem» do radar: o botão wa.me, a chamada de upgrade ou porque não há mensagem. */
export function CelulaMensagem({
  l,
  mensagens,
  pagina,
  assinatura,
}: {
  l: LinhaRadar;
  mensagens: boolean;
  pagina: string;
  assinatura: string;
}) {
  if (!mensagens) return <BotaoUpgrade rotulo={t.mensagem} />;
  const m = mensagemParaCliente(l, pagina, assinatura);
  if (m)
    return (
      <BotaoMensagem
        ligacao={m.ligacao}
        clienteId={l.cliente.id}
        tipo={m.tipo}
        conteudo={m.conteudo}
        rotulo={t.mensagem}
      />
    );
  return (
    <span className="text-xs text-muted-foreground">
      {l.cliente.nao_contactar
        ? t.naoContactar
        : !l.contactavel
          ? t.semConsentimento
          : textos.comum.vazio}
    </span>
  );
}
