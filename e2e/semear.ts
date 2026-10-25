import { readFileSync } from "node:fs";
import {
  BARBEARIA_A,
  BARBEARIA_B,
  BARBEARIA_SUSPENSA,
  contas,
  PALAVRA_PASSE,
  PROJETOS,
  servico,
  telefones,
  temSupabase,
} from "./auxiliares/dados";

// Preparação global do Playwright: duas barbearias e os cinco papéis no Supabase local.
// Corre numa base acabada de repor (scripts/e2e-local.sh faz o `supabase db reset`).

type Bd = ReturnType<typeof servico>;

async function criarConta(bd: Bd, email: string): Promise<string> {
  const { data, error } = await bd.auth.admin.createUser({
    email,
    password: PALAVRA_PASSE,
    email_confirm: true,
  });
  if (error) throw new Error(`Conta ${email}: ${error.message}`);
  return data.user.id;
}

async function inserir(bd: Bd, tabela: string, linhas: object | object[]) {
  const { data, error } = await bd.from(tabela).insert(linhas).select("id");
  if (error) throw new Error(`${tabela}: ${error.message}`);
  return data as { id: string }[];
}

async function perfil(
  bd: Bd,
  userId: string,
  papel: string,
  inquilinoId: string | null,
  email: string,
) {
  return (
    await inserir(bd, "perfis", {
      user_id: userId,
      papel,
      inquilino_id: inquilinoId,
      email,
      nome: email,
    })
  )[0]!.id;
}

export default async function semear() {
  if (!temSupabase) return;
  const bd = servico();

  await inserir(bd, "inquilinos", [
    {
      ...BARBEARIA_A,
      plano: "pro",
      profissionais_contratados: 6,
      estado: "ativo",
      cidade: "Viseu",
    },
    {
      ...BARBEARIA_B,
      plano: "basic",
      profissionais_contratados: 1,
      estado: "ativo",
      cidade: "Porto",
    },
    {
      ...BARBEARIA_SUSPENSA,
      plano: "basic",
      profissionais_contratados: 1,
      estado: "suspenso",
      cidade: "Braga",
    },
  ]);
  for (const b of [BARBEARIA_A, BARBEARIA_B]) {
    const { error } = await bd.rpc("aplicar_pacote", { p_inquilino: b.id });
    if (error) throw new Error(`aplicar_pacote: ${error.message}`);
  }

  // A aberta o dia todo, todos os dias: os ensaios da agenda correm a qualquer hora.
  const { error: erroHorario } = await bd
    .from("inquilinos")
    .update({
      hora_abertura: "00:00",
      hora_fecho: "23:59",
      dias_descanso: [],
      fecha_feriados: false,
    })
    .eq("id", BARBEARIA_A.id);
  if (erroHorario) throw new Error(`horário: ${erroHorario.message}`);

  // Serviços da A (painel da barbearia, Fase 4).
  await inserir(bd, "servicos", [
    { inquilino_id: BARBEARIA_A.id, nome: "Corte", duracao_min: 30, preco: 15, ordem: 1 },
    { inquilino_id: BARBEARIA_A.id, nome: "Barba", duracao_min: 20, preco: 10, ordem: 2 },
  ]);

  for (const projeto of PROJETOS) {
    const c = contas(projeto);
    const nomeBarbeiro = projeto === "computador" ? "Carlos" : "Tiago";
    await perfil(bd, await criarConta(bd, c.admin), "super_admin", null, c.admin);
    await perfil(bd, await criarConta(bd, c.adminAdesao), "super_admin", null, c.adminAdesao);
    await perfil(bd, await criarConta(bd, c.adminModulos), "super_admin", null, c.adminModulos);
    await perfil(bd, await criarConta(bd, c.adminDesign), "super_admin", null, c.adminDesign);
    const comercial = await criarConta(bd, c.adminComercial);
    await perfil(bd, comercial, "super_admin", null, c.adminComercial);
    await perfil(bd, await criarConta(bd, c.adminFinancas), "super_admin", null, c.adminFinancas);
    // Comercial (N.8): o modelo de contrato base já aprovado, para os dois projetos gerarem
    // contratos sem corrida na aprovação; a importação pelo ecrã ensaia-se com a das condições.
    if (projeto === PROJETOS[0])
      await inserir(bd, "modelos_documento", {
        tipo: "contrato",
        versao: 1,
        titulo: "Contrato de Prestação de Serviços InstaBarber",
        corpo: readFileSync("docs/comercial/modelo-contrato.md", "utf8").replace(
          /\[([^\]\n]+)\](?!\()/g,
          "$1",
        ),
        estado: "aprovado",
        aprovado_por: comercial,
        aprovado_em: new Date().toISOString(),
      });
    await perfil(
      bd,
      await criarConta(bd, c.donoSuspenso),
      "proprietario",
      BARBEARIA_SUSPENSA.id,
      c.donoSuspenso,
    );
    await perfil(bd, await criarConta(bd, c.dono), "proprietario", BARBEARIA_A.id, c.dono);

    const barbeiro = await criarConta(bd, c.barbeiro);
    const perfilBarbeiro = await perfil(bd, barbeiro, "profissional", BARBEARIA_A.id, c.barbeiro);
    await inserir(bd, "profissionais", {
      inquilino_id: BARBEARIA_A.id,
      perfil_id: perfilBarbeiro,
      nome: `${nomeBarbeiro} Silva`,
      nome_apresentado: nomeBarbeiro,
      email: c.barbeiro,
    });

    // Uma conta em duas barbearias: gestor da B e barbeiro da A.
    const duplo = await criarConta(bd, c.duplo);
    await perfil(bd, duplo, "proprietario", BARBEARIA_B.id, c.duplo);
    const perfilDuplo = await perfil(bd, duplo, "profissional", BARBEARIA_A.id, c.duplo);
    await inserir(bd, "profissionais", {
      inquilino_id: BARBEARIA_A.id,
      perfil_id: perfilDuplo,
      nome: `Duplo ${projeto}`,
      nome_apresentado: "Duplo",
      email: c.duplo,
    });

    // Clientes da A: um atendido ao balcão sem conta, outro com conta técnica.
    const t = telefones(projeto);
    await inserir(bd, "clientes", {
      inquilino_id: BARBEARIA_A.id,
      nome: "Rita Balcão",
      telefone: `+351${t.semConta}`,
      origem: "balcao",
    });
    const contaCliente = await criarConta(
      bd,
      `351${t.comConta}.${BARBEARIA_A.id}@clientes.instabarber.pt`,
    );
    await inserir(bd, "clientes", {
      inquilino_id: BARBEARIA_A.id,
      nome: "João Conta",
      telefone: `+351${t.comConta}`,
      origem: "online",
      auth_user_id: contaCliente,
    });
  }
}
