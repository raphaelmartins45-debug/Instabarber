import Link from "next/link";
import { FormularioProduto } from "@/components/barbearia/loja/formulario-produto";
import { ListaPedidos } from "@/components/barbearia/loja/lista-pedidos";
import { PainelGestor } from "@/components/barbearia/painel-gestor";
import { Indicador } from "@/components/nucleo/indicador";
import { exigirGestor } from "@/lib/equipa/contexto";
import { exigirFuncionalidade } from "@/lib/funcionalidades/servidor";
import { textos } from "@/lib/i18n/pt-PT";
import { primeiroNome } from "@/lib/regras/mensagens";
import { ligacaoWhatsApp } from "@/lib/regras/whatsapp";
import { estadoStock } from "@/lib/regras/loja";
import { listarPedidos, listarProdutos } from "@/lib/repositorios/painel/loja";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { cn } from "@/lib/utils";
import { vertical } from "@/lib/vertical/barbearia";

const t = textos.loja;
export const metadata = { title: `${t.titulo} · ${vertical.camadas.gestao}` };

/** Loja (F.4.4): Produtos e Pedidos, com os indicadores no topo. Pagamento ao balcão. */
export default async function Loja({ searchParams }: { searchParams: Promise<{ sep?: string }> }) {
  const contexto = await exigirGestor();
  const inq = contexto.barbearia.id;
  await exigirFuncionalidade(inq, "loja_produtos");
  const sep = (await searchParams).sep === "pedidos" ? "pedidos" : "produtos";
  const bd = await criarClienteServidor();
  const [produtos, pedidos] = await Promise.all([listarProdutos(bd, inq), listarPedidos(bd, inq)]);
  const separador = (id: "produtos" | "pedidos") => (
    <Link
      href={`/app/loja?sep=${id}`}
      aria-current={sep === id ? "page" : undefined}
      className={cn(
        "flex h-10 items-center rounded-full border px-4 text-sm",
        sep === id ? "border-foreground bg-foreground text-background" : "bg-card hover:bg-muted",
      )}
    >
      {t.separadores[id]}
    </Link>
  );
  return (
    <PainelGestor atual="loja">
      <h1 className="text-[22px] font-extrabold">{t.titulo}</h1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Indicador
          rotulo={t.indicadores.ativos}
          valor={String(produtos.filter((p) => p.ativo).length)}
        />
        <Indicador
          rotulo={t.indicadores.novos}
          valor={String(pedidos.filter((p) => p.estado === "novo").length)}
        />
        <Indicador
          rotulo={t.indicadores.prontos}
          valor={String(pedidos.filter((p) => p.estado === "pronto").length)}
        />
        <Indicador
          rotulo={t.indicadores.abaixo}
          valor={String(
            produtos.filter((p) => p.ativo && estadoStock(p.stock, p.stockMinimo) !== "em_stock")
              .length,
          )}
        />
      </div>
      <p className="text-sm text-muted-foreground">{t.nota}</p>
      <nav className="flex gap-2" aria-label={t.titulo}>
        {separador("produtos")}
        {separador("pedidos")}
      </nav>
      {sep === "produtos" ? (
        <div className="grid gap-3">
          {produtos.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.produto.vazio}</p>
          ) : null}
          {produtos.map((p) => (
            <FormularioProduto key={p.id} produto={p} />
          ))}
          <FormularioProduto produto={null} />
        </div>
      ) : (
        <ListaPedidos
          pedidos={pedidos.map((p) => {
            const conteudo = t.pedidos.aviso(
              primeiroNome(p.cliente),
              p.numero,
              contexto.barbearia.nome,
            );
            return {
              ...p,
              aviso: p.telefone
                ? { ligacao: ligacaoWhatsApp(p.telefone, conteudo), conteudo }
                : null,
            };
          })}
        />
      )}
    </PainelGestor>
  );
}
