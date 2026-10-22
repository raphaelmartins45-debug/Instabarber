import { PainelProfissional } from "@/components/barbearia/painel-profissional";
import { FolhaAcerto } from "@/components/barbearia/profissional/folha-acerto";
import { mesAtual } from "@/lib/formatacao/datas";
import { exigirFuncionalidade } from "@/lib/funcionalidades/servidor";
import { textos } from "@/lib/i18n/pt-PT";
import { acertosDoMes } from "@/lib/painel/acertos";
import { abrirAreaProfissional } from "@/lib/painel/area-profissional";
import { listarAcertos } from "@/lib/repositorios/painel/acertos";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { vertical } from "@/lib/vertical/barbearia";

const t = textos.profissional.acerto;
export const metadata = { title: `${t.titulo} · ${vertical.camadas.equipa}` };

/** «A minha folha de acerto» (E.3, F.4.11): leitura, com o sinal certo conforme o modelo. */
export default async function AcertoProfissional({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const area = await abrirAreaProfissional(id);
  const inq = area.contexto.barbearia.id;
  await exigirFuncionalidade(inq, "comissoes_acertos");
  const bd = await criarClienteServidor();
  const mes = mesAtual();
  const [{ linhas }, historico] = await Promise.all([
    acertosDoMes(bd, inq, mes, id),
    listarAcertos(bd, inq, { profissionalId: id }),
  ]);
  return (
    <PainelProfissional area={area} atual="comissoes">
      <h1 className="text-[22px] font-extrabold">{t.titulo}</h1>
      <FolhaAcerto mes={mes} linha={linhas[0] ?? null} historico={historico} />
    </PainelProfissional>
  );
}
