import { textos } from "@/lib/i18n/pt-PT";
import { listarServicos } from "@/lib/repositorios/painel/servicos";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { FormularioServico } from "./formulario-servico";

/** Serviços (E.2): nome, descrição, duração e preço final; inglês e francês com `multilinguagem`. */
export async function SeccaoServicos({
  inquilinoId,
  multilinguagem,
}: {
  inquilinoId: string;
  multilinguagem: boolean;
}) {
  const servicos = await listarServicos(await criarClienteServidor(), inquilinoId, false);
  return (
    <div className="grid gap-3">
      {servicos.length === 0 ? (
        <p className="text-sm text-muted-foreground">{textos.sistema.servicos.vazio}</p>
      ) : null}
      {servicos.map((s) => (
        <FormularioServico key={s.id} servico={s} multilinguagem={multilinguagem} />
      ))}
      <FormularioServico servico={null} multilinguagem={multilinguagem} />
    </div>
  );
}
