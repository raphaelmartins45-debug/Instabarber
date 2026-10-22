import { CartaoAcesso } from "@/components/nucleo/cartao-acesso";
import { FormularioRecuperar } from "@/components/nucleo/formulario-recuperar";
import { textos } from "@/lib/i18n/pt-PT";
import { lerEndereco } from "@/lib/inquilino/endereco";

export const metadata = { title: `${textos.acesso.recuperar.titulo} · ${textos.marca.nome}` };

export default async function PaginaRecuperar() {
  const prefixo = (await lerEndereco()).slug ? "/app" : "";
  return (
    <CartaoAcesso titulo={textos.acesso.recuperar.titulo} descricao={textos.acesso.recuperar.texto}>
      <FormularioRecuperar voltarHref={`${prefixo}/entrar`} />
    </CartaoAcesso>
  );
}
