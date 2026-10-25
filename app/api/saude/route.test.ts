import { describe, expect, it, vi } from "vitest";

// A resposta da base de dados é controlada por cada teste (sim, não, ou erro).
let resposta: () => Promise<boolean> = async () => true;
vi.mock("@/lib/repositorios/saude", () => ({ baseDeDadosResponde: () => resposta() }));
vi.mock("@/lib/supabase/servidor", () => ({ criarClienteServidor: async () => ({}) }));

const { GET } = await import("./route");

describe("GET /api/saude", () => {
  it("200 quando a base de dados responde, sem cache", async () => {
    resposta = async () => true;
    const r = await GET();
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ ok: true });
    expect(r.headers.get("cache-control")).toBe("no-store");
  });

  it("503 quando a base de dados falha ou lança, sem detalhes", async () => {
    resposta = async () => false;
    expect((await GET()).status).toBe(503);
    resposta = () => Promise.reject(new Error("ligação recusada"));
    const r = await GET();
    expect(r.status).toBe(503);
    expect(await r.json()).toEqual({ ok: false });
  });
});
