import { createClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, it } from "vitest";
import type { ClienteBD } from "@/lib/supabase/tipos";
import type { Database } from "@/types/database";
import { listarServicosPublicos, obterBarbeariaPublica } from "./barbearias-publicas";
import { listarFeriados } from "./feriados";
import { listarChavesAtivas, listarFuncionalidades } from "./funcionalidades";

// Corre contra o Supabase local com os dados de teste (docs/esquema/testes/05), como anónimo:
//   supabase db reset && npm run test:sql
//   SUPABASE_TESTE_URL=http://127.0.0.1:54321 SUPABASE_TESTE_ANON_KEY=… npm test
// Sem estas variáveis, não corre (o `npm test` normal não precisa de base de dados).
const url = process.env.SUPABASE_TESTE_URL;
const chave = process.env.SUPABASE_TESTE_ANON_KEY;
const A = "aaaaaaaa-0000-0000-0000-000000000000";

describe.runIf(url && chave)("repositórios no Supabase local (anónimo)", () => {
  let bd: ClienteBD;
  beforeAll(() => {
    bd = createClient<Database>(url!, chave!, { auth: { persistSession: false } });
  });

  it("lê a barbearia ativa pelo slug, sem NIF", async () => {
    const barbearia = await obterBarbeariaPublica(bd, "barbearia-a");
    expect(barbearia?.id).toBe(A);
    expect(barbearia).not.toHaveProperty("nif");
    expect(await obterBarbeariaPublica(bd, "nao-existe")).toBeNull();
  });

  it("lista só os serviços dessa barbearia, com preço em cêntimos", async () => {
    const servicos = await listarServicosPublicos(bd, A);
    expect(servicos.map((s) => [s.nome, s.preco_centimos])).toEqual([
      ["Barba", 1000],
      ["Corte", 1500],
    ]);
  });

  it("dá ao anónimo só os feriados nacionais", async () => {
    const feriados = await listarFeriados(bd, A, "2026-01-01", "2026-12-31");
    expect(feriados.length).toBeGreaterThan(0);
    expect(feriados.every((f) => f.inquilino_id === null)).toBe(true);
    expect(feriados[0]?.data).toBe("2026-01-01");
  });

  it("recusa um id que não é uuid antes de chegar à base", async () => {
    await expect(
      listarFeriados(bd, "x,inquilino_id.not.is.null", "2026-01-01", "2026-12-31"),
    ).rejects.toThrow();
  });

  it("não mostra a grelha ao anónimo", async () => {
    expect(await listarFuncionalidades(bd)).toEqual([]);
    expect(await listarChavesAtivas(bd, A)).toEqual([]);
  });
});
