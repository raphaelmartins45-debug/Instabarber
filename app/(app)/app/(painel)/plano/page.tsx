import { PainelGestor } from "@/components/barbearia/painel-gestor";
import { PagamentoMensalidade } from "@/components/barbearia/plano/pagamento-mensalidade";
import { ResumoPlano } from "@/components/barbearia/resumo-plano";
import { Secao } from "@/components/nucleo/secao";
import { exigirGestor } from "@/lib/equipa/contexto";
import { lerGrelha } from "@/lib/funcionalidades/servidor";
import { textos } from "@/lib/i18n/pt-PT";
import { listarFaturas, listarRecebimentos } from "@/lib/repositorios/admin/pagamentos";
import { dadosPagamento } from "@/lib/painel/pagamento";
import { listarFuncionalidades } from "@/lib/repositorios/funcionalidades";
import { obterConfiguracao } from "@/lib/repositorios/painel/barbearia";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { vertical } from "@/lib/vertical/barbearia";

const t = textos.plano;
export const metadata = { title: `${t.titulo} · ${vertical.camadas.gestao}` };

/**
 * O meu plano (E.2): sempre visível. Sem botões de ativação: para mudar o plano, fala-se com a
 * InstaBarber (apoio@). Paga-se a mensalidade enviando o comprovativo (D-168).
 */
export default async function MeuPlano() {
  const contexto = await exigirGestor();
  const inq = contexto.barbearia.id;
  const bd = await criarClienteServidor();
  const [b, grelha, catalogo, faturas, recebimentos] = await Promise.all([
    obterConfiguracao(bd, inq),
    lerGrelha(inq),
    listarFuncionalidades(bd),
    listarFaturas(bd, inq),
    listarRecebimentos(bd, { inquilinoId: inq }),
  ]);
  const pagamento = await dadosPagamento(bd, b);
  const incluidas = catalogo.filter((f) => grelha.ativas.has(f.chave));
  const fora = catalogo.filter((f) => !grelha.ativas.has(f.chave));
  return (
    <PainelGestor atual="plano">
      <h1 className="text-[22px] font-extrabold">{t.titulo}</h1>
      <ResumoPlano
        b={b}
        faturas={faturas}
        recebimentos={recebimentos}
        emAnalise={pagamento.faturasEmAnalise}
      />
      {/* Na vista de apoio não se envia nada (E.1): mostra-se só o período e o histórico. */}
      <PagamentoMensalidade inquilinoId={inq} dados={pagamento} podeEnviar={!contexto.apoio} />
      <div className="grid gap-4 md:grid-cols-2">
        <Secao id="incluido" titulo={t.incluido}>
          <ul className="grid gap-1 text-sm">
            {incluidas.map((f) => (
              <li key={f.chave}>✓ {f.nome}</li>
            ))}
          </ul>
        </Secao>
        <Secao id="nao-incluido" titulo={t.naoIncluido}>
          <ul className="grid gap-1 text-sm text-muted-foreground">
            {fora.map((f) => (
              <li key={f.chave}>{f.nome}</li>
            ))}
          </ul>
        </Secao>
      </div>
    </PainelGestor>
  );
}
