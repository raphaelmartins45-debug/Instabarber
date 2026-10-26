import { describe, expect, it, vi } from "vitest";
import {
  corpoFaturaRecibo,
  emitirFaturaRecibo,
  precoSemIva,
  type DadosFatura,
} from "./invoicexpress";

const dados: DadosFatura = {
  cliente: {
    nome: "Barbearia Alfa",
    nif: "509999999",
    email: "geral@alfa.pt",
    morada: "Rua Direita, 1",
    codigoPostal: "3500-000",
    cidade: "Viseu",
    codigo: "barbearia-alfa",
  },
  item: "Mensalidade InstaBarber",
  descricao: "Plano Pro · 01/11/2026 – 30/11/2026",
  assunto: (n) => `Fatura-recibo ${n}`,
  corpo: "Segue em anexo.",
  totalCent: 4797,
  data: "2026-10-26",
  isento: false,
};
const config = { conta: "performalab", chave: "chave-secreta", iva: "IVA23" };

const resposta = (corpo: unknown, ok = true, status = 200) =>
  ({ ok, status, json: async () => corpo }) as Response;

describe("fatura-recibo pelo InvoiceXpress (D-170)", () => {
  it("o preço sem IVA reconstrói o total com IVA", () => {
    expect(precoSemIva(4797, false)).toBe(39);
    expect(precoSemIva(2459, false)).toBe(19.99);
    expect(precoSemIva(4797, true)).toBe(47.97);
  });

  it("monta a fatura-recibo com o cliente, a linha e a taxa", () => {
    const c = corpoFaturaRecibo(dados, "IVA23").invoice_receipt;
    expect(c.date).toBe("26/10/2026");
    expect(c.client).toMatchObject({
      name: "Barbearia Alfa",
      fiscal_id: "509999999",
      city: "Viseu",
    });
    expect(c.items[0]).toMatchObject({
      unit_price: "39.00",
      quantity: "1",
      tax: { name: "IVA23" },
    });
    expect("tax_exemption" in c).toBe(false);
    const isenta = corpoFaturaRecibo({ ...dados, isento: true }, "IVA23").invoice_receipt;
    expect(isenta).toMatchObject({ tax_exemption: "M10" });
    expect(isenta.items[0]!.tax.name).toBe("Isento");
  });

  it("cria, finaliza e envia por e-mail; devolve o número", async () => {
    const pedir = vi
      .fn()
      .mockResolvedValueOnce(resposta({ invoice_receipt: { id: 77 } }))
      .mockResolvedValueOnce(
        resposta({ invoice_receipt: { inverted_sequence_number: "FR 2026/1" } }),
      )
      .mockResolvedValueOnce(resposta({}));
    const r = await emitirFaturaRecibo(config, dados, pedir);
    expect(r).toEqual({ ok: true, numero: "FR 2026/1" });
    expect(pedir.mock.calls[0]![0]).toBe(
      "https://performalab.app.invoicexpress.com/invoice_receipts.json?api_key=chave-secreta",
    );
    expect(pedir.mock.calls[1]![0]).toContain("/invoice_receipts/77/change-state.json");
    expect(pedir.mock.calls[2]![0]).toContain("/invoice_receipts/77/email-document.json");
  });

  it("uma falha ao criar devolve o passo; a rede em baixo não lança", async () => {
    const recusa = vi.fn().mockResolvedValueOnce(resposta({}, false, 422));
    expect(await emitirFaturaRecibo(config, dados, recusa)).toEqual({
      ok: false,
      erro: "criar_422",
    });
    const rede = vi.fn().mockRejectedValueOnce(new Error("sem rede"));
    expect(await emitirFaturaRecibo(config, dados, rede)).toEqual({ ok: false, erro: "rede" });
  });
});
