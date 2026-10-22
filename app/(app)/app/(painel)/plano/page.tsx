import { ListasPagamentos } from "@/components/admin/listas-pagamentos";
import { PainelGestor } from "@/components/barbearia/painel-gestor";
import { Indicador } from "@/components/nucleo/indicador";
import { Secao } from "@/components/nucleo/secao";
import { exigirGestor } from "@/lib/equipa/contexto";
import { dataCurta } from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { lerGrelha } from "@/lib/funcionalidades/servidor";
import { textos } from "@/lib/i18n/pt-PT";
import { calcularPrecoCent, lerRegimeIva } from "@/lib/regras/mensalidade";
import { listarFaturas, listarRecebimentos } from "@/lib/repositorios/admin/pagamentos";
import { listarFuncionalidades } from "@/lib/repositorios/funcionalidades";
import { obterConfiguracao } from "@/lib/repositorios/painel/barbearia";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { vertical } from "@/lib/vertical/barbearia";

const t = textos.plano;
export const metadata = { title: `${t.titulo} · ${vertical.camadas.gestao}` };

/**
 * O meu plano (E.2): sempre visível, só de leitura. Sem botões de ativação: para mudar o plano,
 * fala-se com a InstaBarber (apoio@).
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
  const plano = b.plano as "basic" | "pro";
  const periodicidade = b.periodicidade as "mensal" | "anual";
  const preco = calcularPrecoCent(
    plano,
    b.profissionais_contratados,
    periodicidade,
    !!b.dominio_proprio,
    lerRegimeIva(process.env.PRESTADORA_REGIME_IVA),
  );
  const incluidas = catalogo.filter((f) => grelha.ativas.has(f.chave));
  const fora = catalogo.filter((f) => !grelha.ativas.has(f.chave));
  return (
    <PainelGestor atual="plano">
      <h1 className="text-[22px] font-extrabold">{t.titulo}</h1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" data-testid="meu-plano">
        <Indicador
          rotulo={t.plano}
          valor={t.planos[plano] ?? plano}
          detalhe={t.periodicidades[periodicidade]}
        />
        <Indicador rotulo={t.profissionais} valor={String(b.profissionais_contratados)} />
        <Indicador
          rotulo={t.mensalidade}
          valor={formatarDinheiro(preco.comIva)}
          detalhe={t.semIva(formatarDinheiro(preco.semIva))}
        />
        <Indicador
          rotulo={t.vencimento}
          valor={
            b.proximo_vencimento
              ? dataCurta(`${b.proximo_vencimento}T12:00:00Z`)
              : textos.comum.vazio
          }
        />
      </div>
      {b.dominio_proprio ? <p className="text-sm">{t.dominio(b.dominio_proprio)}</p> : null}
      <p className="text-sm">
        {t.mudar}{" "}
        <a
          href={`mailto:${textos.marca.apoio}`}
          className="font-semibold text-ligacao underline-offset-4 hover:underline"
        >
          {t.escrever}
        </a>
      </p>
      <ListasPagamentos faturas={faturas} recebimentos={recebimentos} />
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
