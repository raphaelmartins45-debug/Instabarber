import { describe, expect, it } from "vitest";
import { alvosDoComunicado, estadoComunicado } from "./comunicados";

const base = { destino: "todas", plano: null, inquilinoId: null, fim: null };
const agora = new Date("2026-10-25T12:00:00Z");
const barbearias = [
  { id: "a", plano: "pro", estado: "ativo" },
  { id: "b", plano: "basic", estado: "ativo" },
  { id: "c", plano: "pro", estado: "suspenso" },
];

describe("estadoComunicado", () => {
  it("agendado, em vigor e terminado pelo prazo", () => {
    expect(estadoComunicado({ ...base, inicio: "2026-10-26T00:00:00Z" }, agora)).toBe("agendado");
    expect(estadoComunicado({ ...base, inicio: "2026-10-24T00:00:00Z" }, agora)).toBe("ativo");
    expect(
      estadoComunicado(
        { ...base, inicio: "2026-10-20T00:00:00Z", fim: "2026-10-25T12:00:00Z" },
        agora,
      ),
    ).toBe("terminado");
  });
});

describe("alvosDoComunicado", () => {
  const inicio = "2026-10-24T00:00:00Z";
  it("todas as ativas, as de um plano ou uma só", () => {
    expect(alvosDoComunicado({ ...base, inicio }, barbearias).map((b) => b.id)).toEqual(["a", "b"]);
    expect(
      alvosDoComunicado({ ...base, inicio, destino: "plano", plano: "pro" }, barbearias).map(
        (b) => b.id,
      ),
    ).toEqual(["a"]);
    expect(
      alvosDoComunicado({ ...base, inicio, destino: "barbearia", inquilinoId: "b" }, barbearias),
    ).toHaveLength(1);
  });
  it("uma suspensa não conta", () => {
    expect(
      alvosDoComunicado({ ...base, inicio, destino: "barbearia", inquilinoId: "c" }, barbearias),
    ).toHaveLength(0);
  });
});
