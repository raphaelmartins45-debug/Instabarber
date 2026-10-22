import { textos } from "@/lib/i18n/pt-PT";
import { ligacaoWhatsApp } from "@/lib/regras/whatsapp";
import type { PedidoAcesso as Pedido } from "@/lib/repositorios/codigos-acesso";
import { PedidoAcesso } from "./pedido-acesso";

const t = textos.paineis.pedidosAcesso;

/** «Pedidos de acesso» do Início (E.2, B9): códigos que os clientes pediram, por enviar. */
export function PedidosAcesso({ pedidos, barbearia }: { pedidos: Pedido[]; barbearia: string }) {
  const comTelefone = pedidos.filter((p) => p.cliente?.telefone);
  return (
    <section className="grid gap-3" aria-labelledby="pedidos-acesso">
      <h2 id="pedidos-acesso" className="text-[15px] font-bold">
        {t.titulo}
      </h2>
      {comTelefone.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.vazio}</p>
      ) : (
        <ul className="grid gap-2">
          {comTelefone.map((p) => (
            <PedidoAcesso
              key={p.id}
              id={p.id}
              nome={p.cliente!.nome}
              telefone={p.cliente!.telefone!}
              expiraEm={p.expira_em}
              enviadoInicial={!!p.enviado_em}
              ligacao={ligacaoWhatsApp(p.cliente!.telefone!, t.mensagem(barbearia, p.codigo))}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
