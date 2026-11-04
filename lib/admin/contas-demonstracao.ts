import "server-only";
import { criarClienteServico } from "@/lib/supabase/servico";

// As contas da demonstração (D-207): um gestor e um barbeiro fictícios, só da barbearia de
// demonstração. A chave de serviço cria as contas (uso previsto no CLAUDE.md §3) e gera a entrada
// de uso único com que o comercial abre os painéis (uso autorizado pelo dono a 04/11/2026,
// opção B). Nenhuma palavra-passe é usada nem guardada.

export const CONTAS_DEMONSTRACAO = {
  gestor: "demo.gestor@instabarber.pt",
  barbeiro: "demo.barbeiro@instabarber.pt",
} as const;

export type PapelDemonstracao = keyof typeof CONTAS_DEMONSTRACAO;

/** Garante que as duas contas existem e devolve os ids. */
export async function contasDemonstracao(): Promise<Record<PapelDemonstracao, string> | null> {
  const servico = criarClienteServico();
  const ids: Partial<Record<PapelDemonstracao, string>> = {};
  for (const papel of Object.keys(CONTAS_DEMONSTRACAO) as PapelDemonstracao[]) {
    const email = CONTAS_DEMONSTRACAO[papel];
    const novo = await servico.auth.admin.createUser({ email, email_confirm: true });
    if (novo.data.user) {
      ids[papel] = novo.data.user.id;
      continue;
    }
    // Já existe: procura-a na lista (são poucas contas na plataforma).
    const { data } = await servico.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existente = data?.users.find((u) => u.email === email);
    if (!existente) return null;
    ids[papel] = existente.id;
  }
  return ids as Record<PapelDemonstracao, string>;
}

/** Uma entrada de uso único (token) para a conta de demonstração deste papel. */
export async function entradaDemonstracao(papel: PapelDemonstracao): Promise<string | null> {
  const { data, error } = await criarClienteServico().auth.admin.generateLink({
    type: "magiclink",
    email: CONTAS_DEMONSTRACAO[papel],
  });
  return error ? null : (data.properties?.hashed_token ?? null);
}
