import { Gift, MessageCircle } from "lucide-react";
import type { TextosPublicos } from "@/lib/i18n/publico";
import { ligacaoWhatsApp } from "@/lib/regras/whatsapp";
import { funcionalidadesLigadas } from "@/lib/repositorios/barbearias-publicas";
import { criarClienteServidor } from "@/lib/supabase/servidor";

/**
 * O cartão oferta no fim da página pública (F.4.9, D-206): título, uma frase e «Fale connosco»,
 * que abre o WhatsApp da barbearia com o pedido de informação preparado (regra 7). Só com a
 * funcionalidade ligada e um WhatsApp na ficha.
 */
export async function BlocoCartaoOferta({
  t,
  inquilinoId,
  nome,
  whatsapp,
}: {
  t: TextosPublicos;
  inquilinoId: string;
  nome: string;
  whatsapp: string | null;
}) {
  if (!whatsapp) return null;
  const ligadas = await funcionalidadesLigadas(await criarClienteServidor(), inquilinoId, [
    "cartoes_oferta",
  ]);
  if (!ligadas.has("cartoes_oferta")) return null;
  const b = t.blocos;
  return (
    <section
      id="cartao-oferta"
      aria-labelledby="cartao-oferta-titulo"
      className="mx-auto w-full max-w-6xl px-4 pt-10 md:px-8 md:pt-16"
    >
      <div className="cartao-modelo grid gap-5 rounded-[var(--raio)] border bg-card p-6 text-card-foreground md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:p-8">
        <span className="grid size-14 place-items-center rounded-full bg-accent text-primary">
          <Gift aria-hidden className="size-7" />
        </span>
        <div className="grid gap-1.5">
          <h2 id="cartao-oferta-titulo" className="titulo-estilo text-2xl md:text-3xl">
            {b.cartaoTitulo(nome)}
          </h2>
          <p className="max-w-prose text-muted-foreground">{b.cartaoTexto}</p>
        </div>
        <a
          href={ligacaoWhatsApp(whatsapp, b.cartaoMensagem(nome))}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--raio-botao)] bg-primary px-6 font-semibold text-primary-foreground transition-[filter] hover:brightness-110"
          data-testid="cartao-oferta-whatsapp"
        >
          <MessageCircle aria-hidden className="size-4" />
          {b.falarConnosco}
        </a>
      </div>
    </section>
  );
}
