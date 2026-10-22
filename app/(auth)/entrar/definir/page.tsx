import Link from "next/link";
import { redirect } from "next/navigation";
import { Aviso } from "@/components/nucleo/aviso";
import { CartaoAcesso } from "@/components/nucleo/cartao-acesso";
import { FormularioDefinir } from "@/components/nucleo/formulario-definir";
import { textos } from "@/lib/i18n/pt-PT";
import { lerEndereco } from "@/lib/inquilino/endereco";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export const metadata = { title: `${textos.acesso.definir.titulo} · ${textos.marca.nome}` };

export default async function PaginaDefinir({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  const t = textos.acesso.definir;
  const prefixo = (await lerEndereco()).slug ? "/app" : "";
  if (erro) {
    return (
      <CartaoAcesso titulo={t.titulo}>
        <div className="grid gap-4">
          <Aviso tipo="erro">{t.ligacaoInvalida}</Aviso>
          <Link href={`${prefixo}/entrar/recuperar`} className="text-sm text-ligacao underline">
            {textos.acesso.recuperar.titulo}
          </Link>
        </div>
      </CartaoAcesso>
    );
  }

  const bd = await criarClienteServidor();
  const {
    data: { user },
  } = await bd.auth.getUser();
  if (!user) redirect(`${prefixo}/entrar`);

  return (
    <CartaoAcesso titulo={t.titulo} descricao={t.texto}>
      <FormularioDefinir />
    </CartaoAcesso>
  );
}
