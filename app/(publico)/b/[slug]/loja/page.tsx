import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Carrinho } from "@/components/publico/loja/carrinho";
import { MolduraCliente } from "@/components/publico/moldura-cliente";
import { formatarTelefone } from "@/lib/formatacao/telefone";
import { lerEndereco } from "@/lib/inquilino/endereco";
import { obterBarbeariaDoEndereco } from "@/lib/publico/barbearia";
import { textosDaPagina } from "@/lib/publico/lingua";
import { corDoTexto } from "@/lib/regras/contraste";
import { listarProdutosPublicos } from "@/lib/repositorios/barbearias-publicas";
import { obterMinhaFicha } from "@/lib/repositorios/clientes-conta";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Encomenda da loja (F.4.4): com ou sem conta, paga ao balcão no levantamento. */
export default async function Loja({ params }: { params: Promise<{ slug: string }> }) {
  const b = await obterBarbeariaDoEndereco((await params).slug);
  if (!b?.id || !b.slug || !b.nome) notFound();
  const bd = await criarClienteServidor();
  const [{ lingua, t }, { base }, produtos, sessao] = await Promise.all([
    textosDaPagina(!!b.multilinguagem_ativa),
    lerEndereco(),
    listarProdutosPublicos(bd, b.id),
    bd.auth.getUser(),
  ]);
  // A vista só devolve produtos com a loja ligada: sem produtos, a página não existe.
  if (produtos.length === 0) notFound();
  const ficha = sessao.data.user ? await obterMinhaFicha(bd, b.id, sessao.data.user.id) : null;
  const cor = b.capa_cor ?? "#12100E";
  return (
    <div lang={lingua}>
      <MolduraCliente
        titulo={`${t.loja.titulo} · ${b.nome}`}
        voltar={base || "/"}
        rotuloVoltar={t.marcacao.voltar}
        cor={cor}
        corTexto={corDoTexto(cor)}
      >
        <Carrinho
          lingua={lingua}
          slug={b.slug}
          produtos={produtos}
          voltar={base || "/"}
          cliente={
            ficha
              ? {
                  nome: ficha.nome,
                  telefone: ficha.telefone
                    ? formatarTelefone(ficha.telefone).replace(/\s/g, "")
                    : "",
                }
              : null
          }
        />
      </MolduraCliente>
    </div>
  );
}
