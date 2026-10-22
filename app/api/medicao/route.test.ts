import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const pedido = (corpo: string) =>
  new Request("http://localhost/api/medicao", { method: "POST", body: corpo });

afterEach(() => vi.restoreAllMocks());

describe("POST /api/medicao", () => {
  it("regista só o nome do evento", async () => {
    const registo = vi.spyOn(console, "info").mockImplementation(() => {});
    const r = await POST(pedido(JSON.stringify({ evento: "visita", email: "x@y.pt" })));
    expect(r.status).toBe(204);
    expect(registo).toHaveBeenCalledWith('{"medicao":"visita"}');
  });

  it("recusa eventos desconhecidos e corpos inválidos", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    expect((await POST(pedido(JSON.stringify({ evento: "outro" })))).status).toBe(400);
    expect((await POST(pedido("nao json"))).status).toBe(400);
    expect((await POST(pedido("x".repeat(500)))).status).toBe(413);
  });
});
