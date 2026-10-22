import { mensagemFilaVaga } from "@/lib/regras/mensagens";
import { ligacaoWhatsApp } from "@/lib/regras/whatsapp";
import { vagasDoDia } from "@/lib/repositorios/painel/agenda";
import { listarFilaEspera, type EntradaEspera } from "@/lib/repositorios/painel/filas";
import type { ClienteBD } from "@/lib/supabase/tipos";

// A fila de espera ao lado das vagas (F.4.1): para cada entrada, o primeiro horário livre do
// serviço nesse dia e o aviso por wa.me já escrito. Um só gerador para o botão e para o registo.

export type EntradaComVaga = EntradaEspera & {
  vaga: string | null;
  aviso: { ligacao: string; conteudo: string } | null;
};

export async function filaEsperaDoDia(
  bd: ClienteBD,
  inquilinoId: string,
  barbearia: string,
  dia: string,
  agora: Date = new Date(),
): Promise<EntradaComVaga[]> {
  const entradas = await listarFilaEspera(bd, inquilinoId, dia, agora);
  const servicos = [...new Set(entradas.map((e) => e.servicoId))];
  const primeiras = new Map(
    await Promise.all(
      servicos.map(async (id) => {
        const vagas = await vagasDoDia(bd, inquilinoId, id, dia, null);
        return [id, vagas.find((v) => new Date(v.inicio) > agora)?.inicio ?? null] as const;
      }),
    ),
  );
  return entradas.map((e) => {
    const vaga = primeiras.get(e.servicoId) ?? null;
    const conteudo =
      vaga && e.telefone
        ? mensagemFilaVaga({ cliente: e.cliente, servico: e.servico, inicio: vaga, barbearia })
        : null;
    return {
      ...e,
      vaga,
      aviso:
        conteudo && e.telefone
          ? { ligacao: ligacaoWhatsApp(e.telefone, conteudo), conteudo }
          : null,
    };
  });
}
