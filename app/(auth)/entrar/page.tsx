import { CartaoAcesso } from "@/components/nucleo/cartao-acesso";
import { FormularioEntrada } from "@/components/nucleo/formulario-entrada";
import { textos } from "@/lib/i18n/pt-PT";
import { lerEndereco } from "@/lib/inquilino/endereco";
import { marcaAcesso } from "@/lib/publico/marca-acesso";

export const metadata = { title: `${textos.acesso.equipa.titulo} · ${textos.marca.nome}` };

export default async function PaginaEntrar({
  searchParams,
}: {
  searchParams: Promise<{ seguinte?: string; erro?: string }>;
}) {
  const { seguinte, erro } = await searchParams;
  const { slug } = await lerEndereco();
  const prefixo = slug ? "/app" : "";
  // No endereço de uma barbearia, a equipa entra com a marca dela.
  return (
    <CartaoAcesso
      titulo={textos.acesso.equipa.titulo}
      descricao={textos.acesso.equipa.subtitulo}
      barbearia={await marcaAcesso(slug)}
    >
      <FormularioEntrada
        seguinte={seguinte}
        erroInicial={erro}
        recuperarHref={`${prefixo}/entrar/recuperar`}
      />
    </CartaoAcesso>
  );
}
