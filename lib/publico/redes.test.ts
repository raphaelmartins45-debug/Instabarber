import { describe, expect, it } from "vitest";
import { redesSociais } from "./redes";

describe("redesSociais (E.6)", () => {
  it("monta o endereço a partir do nome e respeita o endereço completo", () => {
    expect(
      redesSociais({ instagram: "@barbearia", facebook: "https://fb.com/x", tiktok: "barbearia" }),
    ).toEqual([
      { rotulo: "Instagram", url: "https://instagram.com/barbearia" },
      { rotulo: "Facebook", url: "https://fb.com/x" },
      { rotulo: "TikTok", url: "https://tiktok.com/@barbearia" },
    ]);
  });
  it("sem redes, lista vazia", () => {
    expect(redesSociais({ instagram: null, facebook: null, tiktok: null })).toEqual([]);
  });
});
