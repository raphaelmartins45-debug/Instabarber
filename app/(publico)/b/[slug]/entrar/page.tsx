import { notFound } from "next/navigation";
import { FormularioCodigo } from "@/components/cliente/formulario-codigo";
import { FormularioEntradaCliente } from "@/components/cliente/formulario-entrada-cliente";
import { CartaoAcesso } from "@/components/nucleo/cartao-acesso";
import { textos } from "@/lib/i18n/pt-PT";
import { lerEndereco } from "@/lib/inquilino/endereco";
import { obterBarbeariaDoEndereco } from "@/lib/publico/barbearia";

const t = textos.acesso.cliente;

export const metadata = { title: t.titulo };

/** Acesso à área de cliente (E.4, B9): entrar, ou pedir o código para criar ou recuperar o acesso. */
export default async function EntrarCliente({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const barbearia = await obterBarbeariaDoEndereco(slug);
  if (!barbearia) notFound();
  const { base } = await lerEndereco();
  return (
    <CartaoAcesso titulo={t.titulo} marca={barbearia.nome ?? undefined}>
      <div className="grid gap-8">
        <FormularioEntradaCliente slug={slug} />
        <section className="grid gap-3 border-t pt-6" aria-labelledby="sem-acesso">
          <h2 id="sem-acesso" className="font-semibold">
            {t.semAcesso}
          </h2>
          <FormularioCodigo slug={slug} minhaArea={`${base}/minha-area`} />
        </section>
      </div>
    </CartaoAcesso>
  );
}
