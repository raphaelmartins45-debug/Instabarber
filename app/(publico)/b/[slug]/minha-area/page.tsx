import { notFound, redirect } from "next/navigation";
import { CabecalhoPainel } from "@/components/nucleo/cabecalho-painel";
import { sairCliente } from "../entrar/acoes";
import { textos } from "@/lib/i18n/pt-PT";
import { lerEndereco } from "@/lib/inquilino/endereco";
import { obterBarbeariaDoEndereco } from "@/lib/publico/barbearia";
import { obterMinhaFicha } from "@/lib/repositorios/clientes-conta";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { vertical } from "@/lib/vertical/barbearia";

export const metadata = { title: vertical.camadas.cliente };

/**
 * Minha área (E.4). O cliente vê só a sua ficha nesta barbearia (RLS meus_clientes).
 * Selos, histórico, próxima marcação, clube e encomendas chegam nas Fases 5 e 6.
 */
export default async function MinhaArea({ params }: { params: Promise<{ slug: string }> }) {
  const barbearia = await obterBarbeariaDoEndereco((await params).slug);
  if (!barbearia?.id) notFound();
  const { base } = await lerEndereco();
  const bd = await criarClienteServidor();
  const {
    data: { user },
  } = await bd.auth.getUser();
  const ficha = user ? await obterMinhaFicha(bd, barbearia.id, user.id) : null;
  // Sem ficha nesta barbearia (sessão de equipa ou de outra barbearia): entrar como cliente.
  if (!ficha) redirect(`${base}/entrar`);
  return (
    <>
      <CabecalhoPainel
        camada={`${vertical.camadas.cliente} · ${barbearia.nome}`}
        vista={textos.paineis.minhaArea.ola(ficha.nome)}
        acaoSair={sairCliente}
      />
      <main className="mx-auto grid max-w-2xl gap-2 px-4 py-6">
        <p className="text-sm text-muted-foreground">{textos.paineis.minhaArea.texto}</p>
      </main>
    </>
  );
}
