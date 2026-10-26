import { redirect } from "next/navigation";
import { sair } from "@/app/(auth)/entrar/acoes";
import { PagamentoMensalidade } from "@/components/barbearia/plano/pagamento-mensalidade";
import { ResumoPlano } from "@/components/barbearia/resumo-plano";
import { BotaoSair } from "@/components/nucleo/botao-sair";
import { textos } from "@/lib/i18n/pt-PT";
import { dadosPagamento } from "@/lib/painel/pagamento";
import { listarFaturas, listarRecebimentos } from "@/lib/repositorios/admin/pagamentos";
import { obterConfiguracao } from "@/lib/repositorios/painel/barbearia";
import { listarMeusPerfis } from "@/lib/repositorios/perfis";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.paineis.suspensa;
export const metadata = { title: `${t.titulo} · ${textos.marca.nome}` };

/**
 * Acesso suspenso (M.4): o RLS já não mostra os dados da barbearia; o gestor vê só o plano, a
 * mensalidade e as faturas, e envia o comprovativo do pagamento para regularizar (D-168). Nada foi
 * apagado.
 */
export default async function AcessoSuspenso() {
  const bd = await criarClienteServidor();
  const {
    data: { user },
  } = await bd.auth.getUser();
  if (!user) redirect("/entrar");
  const suspensa = (await listarMeusPerfis(bd, user.id)).find(
    (p) => p.papel === "proprietario" && p.inquilino?.estado === "suspenso",
  )?.inquilino;
  if (!suspensa) redirect("/app");
  const [b, faturas, recebimentos] = await Promise.all([
    obterConfiguracao(bd, suspensa.id),
    listarFaturas(bd, suspensa.id),
    listarRecebimentos(bd, { inquilinoId: suspensa.id }),
  ]);
  const pagamento = await dadosPagamento(bd, b);
  return (
    <main className="mx-auto grid max-w-3xl gap-5 px-4 py-8">
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-1">
          <p className="text-sm text-muted-foreground">{suspensa.nome}</p>
          <h1 className="text-[22px] font-extrabold" data-testid="acesso-suspenso">
            {t.titulo}
          </h1>
        </div>
        <BotaoSair acao={sair} className="" />
      </div>
      <p className="rounded-lg border border-destaque/40 bg-accent px-3 py-2 text-sm">{t.texto}</p>
      <PagamentoMensalidade inquilinoId={suspensa.id} dados={pagamento} podeEnviar />
      <ResumoPlano
        b={b}
        faturas={faturas}
        recebimentos={recebimentos}
        emAnalise={pagamento.faturasEmAnalise}
      />
    </main>
  );
}
