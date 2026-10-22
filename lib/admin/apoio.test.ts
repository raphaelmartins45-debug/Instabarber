import { describe, expect, it } from "vitest";
import { lerApoio } from "./apoio";

const id = "e2e00000-0000-4000-8000-00000000000a";

describe("vista de apoio", () => {
  it("vale só até expirar e só com um id válido", () => {
    const agora = new Date("2026-10-22T10:00:00Z");
    expect(
      lerApoio(JSON.stringify({ inquilino: id, expira: "2026-10-22T10:30:00Z" }), agora),
    ).toEqual({ inquilino: id, expira: "2026-10-22T10:30:00Z" });
    expect(
      lerApoio(JSON.stringify({ inquilino: id, expira: "2026-10-22T09:59:00Z" }), agora),
    ).toBeNull();
    expect(
      lerApoio(JSON.stringify({ inquilino: "x", expira: "2026-10-22T10:30:00Z" }), agora),
    ).toBeNull();
    expect(lerApoio("{", agora)).toBeNull();
    expect(lerApoio(undefined, agora)).toBeNull();
  });
});
