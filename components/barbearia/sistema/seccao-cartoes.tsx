import { hojeIso } from "@/lib/formatacao/datas";
import { obterConfiguracao } from "@/lib/repositorios/painel/barbearia";
import { listarCartoes } from "@/lib/repositorios/painel/cartoes";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { CartoesOferta } from "./cartoes-oferta";

/** Cartões oferta (F.4.9): vender, ver o saldo, descarregar o PDF e anular. */
export async function SeccaoCartoes({
  inquilinoId,
  barbearia,
}: {
  inquilinoId: string;
  barbearia: string;
}) {
  const bd = await criarClienteServidor();
  const [cartoes, b] = await Promise.all([
    listarCartoes(bd, inquilinoId),
    obterConfiguracao(bd, inquilinoId),
  ]);
  return (
    <CartoesOferta cartoes={cartoes} barbearia={barbearia} corCapa={b.capa_cor} hoje={hojeIso()} />
  );
}
