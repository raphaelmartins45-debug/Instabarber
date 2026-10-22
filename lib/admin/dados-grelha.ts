import "server-only";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import {
  calcularPrecoCent,
  lerRegimeIva,
  type Periodicidade,
  type Plano,
} from "@/lib/regras/mensalidade";
import type { Barbearia } from "@/lib/repositorios/admin/barbearias";
import { lerGrelhaBarbearia } from "@/lib/repositorios/admin/grelha";
import { listarFuncionalidades, listarPacotes } from "@/lib/repositorios/funcionalidades";
import type { ClienteBD } from "@/lib/supabase/tipos";

/** O que a grelha de funcionalidades precisa para uma barbearia (catálogo, pacote, ativas, preço). */
export async function dadosDaGrelha(bd: ClienteBD, b: Barbearia) {
  const [catalogo, pacotes, linhas] = await Promise.all([
    listarFuncionalidades(bd),
    listarPacotes(bd),
    lerGrelhaBarbearia(bd, b.id),
  ]);
  const preco = calcularPrecoCent(
    b.plano as Plano,
    b.profissionais_contratados,
    b.periodicidade as Periodicidade,
    !!b.dominio_proprio,
    lerRegimeIva(process.env.PRESTADORA_REGIME_IVA),
  );
  return {
    inquilinoId: b.id,
    catalogo: catalogo.map(({ chave, nome, descricao, grupo }) => ({
      chave,
      nome,
      descricao,
      grupo,
    })),
    pacote: pacotes[b.plano as Plano],
    ativasIniciais: linhas.filter((l) => l.ativa).map((l) => l.chave),
    mensalidade: formatarDinheiro(preco.comIva),
  };
}
