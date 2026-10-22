import { CartaoAcesso } from "@/components/nucleo/cartao-acesso";
import { FormularioEntrada } from "@/components/nucleo/formulario-entrada";
import { textos } from "@/lib/i18n/pt-PT";
import { lerEndereco } from "@/lib/inquilino/endereco";

export const metadata = { title: `${textos.acesso.equipa.titulo} · ${textos.marca.nome}` };

export default async function PaginaEntrar({
  searchParams,
}: {
  searchParams: Promise<{ seguinte?: string; erro?: string }>;
}) {
  const { seguinte, erro } = await searchParams;
  const prefixo = (await lerEndereco()).slug ? "/app" : "";
  return (
    <CartaoAcesso titulo={textos.acesso.equipa.titulo} descricao={textos.acesso.equipa.subtitulo}>
      <FormularioEntrada
        seguinte={seguinte}
        erroInicial={erro}
        recuperarHref={`${prefixo}/entrar/recuperar`}
      />
    </CartaoAcesso>
  );
}
