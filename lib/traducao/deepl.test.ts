import { describe, expect, it, vi } from "vitest";
import { enderecoDeepl, lerRespostaDeepl, pedidoDeepl, traduzirDeepl } from "./deepl";

describe("DeepL", () => {
  it("usa o endereço gratuito com as chaves «:fx»", () => {
    expect(enderecoDeepl("abc:fx")).toBe("https://api-free.deepl.com/v2/translate");
    expect(enderecoDeepl("abc")).toBe("https://api.deepl.com/v2/translate");
  });

  it("monta o pedido de português para inglês britânico, com a chave no cabeçalho", () => {
    const { init } = pedidoDeepl("k:fx", ["Corte"], "en");
    expect(init.headers).toMatchObject({ Authorization: "DeepL-Auth-Key k:fx" });
    expect(JSON.parse(init.body as string)).toEqual({
      text: ["Corte"],
      source_lang: "PT",
      target_lang: "EN-GB",
    });
  });

  it("lê a resposta pela ordem e recusa respostas incompletas", () => {
    expect(lerRespostaDeepl({ translations: [{ text: "Haircut" }] }, 1)).toEqual(["Haircut"]);
    expect(lerRespostaDeepl({ translations: [] }, 1)).toBeNull();
    expect(lerRespostaDeepl(null, 1)).toBeNull();
  });

  it("não envia os textos vazios e devolve-os vazios no mesmo lugar", async () => {
    const enviar = vi.fn<typeof fetch>(async () =>
      Response.json({ translations: [{ text: "Coupe" }, { text: "Avec lavage" }] }),
    );
    expect(await traduzirDeepl("k", ["Corte", "", "Com lavagem"], "fr", enviar)).toEqual([
      "Coupe",
      "",
      "Avec lavage",
    ]);
    expect(JSON.parse(enviar.mock.calls[0]![1]!.body as string).text).toEqual([
      "Corte",
      "Com lavagem",
    ]);
    expect(await traduzirDeepl("k", ["", " "], "fr", enviar)).toEqual(["", ""]);
    expect(enviar).toHaveBeenCalledTimes(1);
  });

  it("devolve null quando o DeepL falha ou a rede cai", async () => {
    const falha = vi.fn(async () => new Response("quota", { status: 456 }));
    expect(await traduzirDeepl("k", ["Corte"], "en", falha)).toBeNull();
    const rede = vi.fn(async () => {
      throw new Error("rede");
    });
    expect(await traduzirDeepl("k", ["Corte"], "en", rede)).toBeNull();
  });
});
