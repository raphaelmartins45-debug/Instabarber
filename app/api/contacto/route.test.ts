import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const enviar = vi.fn();
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: enviar };
  },
}));

const gravar = vi.fn();
vi.mock("@/lib/repositorios/comercial/site", () => ({ gravarLeadDoSite: gravar }));
vi.mock("@/lib/inquilino/endereco", () => ({ ipDoPedido: async () => "203.0.113.7" }));

const { POST } = await import("./route");

function pedido(corpo: unknown) {
  return new Request("http://localhost/api/contacto", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof corpo === "string" ? corpo : JSON.stringify(corpo),
  });
}

const fase1 = {
  fase: 1,
  nome: "Miguel Sousa",
  telemovel: "912 345 678",
  email: "miguel@barbearia.pt",
  website: "",
};

beforeEach(() => {
  gravar.mockReset();
  gravar.mockResolvedValue("gravado");
  enviar.mockReset();
  enviar.mockResolvedValue({ data: { id: "x" }, error: null });
  vi.stubEnv("RESEND_API_KEY", "re_teste");
  vi.stubEnv("EMAIL_COMERCIAL", "comercial@instabarber.pt");
  vi.stubEnv("EMAIL_REMETENTE", "nao-responder@instabarber.pt");
  vi.stubEnv("TELEFONE_COMERCIAL_TXT", "+351 900 000 000");
});

describe("POST /api/contacto · fase 1", () => {
  it("avisa o comercial, responde ao visitante e devolve a ref", async () => {
    const r = await POST(pedido(fase1));
    const json = await r.json();
    expect(r.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.ref).toMatch(/^IB-[A-HJ-NP-Z2-9]{8}$/);

    expect(enviar).toHaveBeenCalledTimes(2);
    const aviso = enviar.mock.calls[0]![0];
    expect(aviso.to).toBe("comercial@instabarber.pt");
    expect(aviso.from).toBe("InstaBarber <nao-responder@instabarber.pt>");
    expect(aviso.replyTo).toBe("miguel@barbearia.pt");
    expect(aviso.subject).toContain(json.ref);
    expect(aviso.text).toContain("Miguel Sousa");
    expect(aviso.text).toContain("+351912345678");
    expect(aviso.text).toContain("miguel@barbearia.pt");

    const resposta = enviar.mock.calls[1]![0];
    expect(resposta.to).toBe("miguel@barbearia.pt");
    expect(resposta.from).toBe("InstaBarber <apoio@instabarber.pt>");
    expect(resposta.text).toContain(json.ref);
    expect(resposta.text).toContain("Olá Miguel,");
    expect(resposta.replyTo).toBe("comercial@instabarber.pt");
    expect(resposta.text).toContain(
      "Com os melhores cumprimentos,\n\nComercial InstaBarber\n+351 900 000 000",
    );
    expect(resposta.html).toContain("<strong>Comercial InstaBarber</strong>");
    expect(resposta.html).toContain("https://instabarber.pt/marca/logo-horizontal-dourado.png");
    expect(resposta.html).toContain("comercial@instabarber.pt");
    expect(resposta.html).toContain("https://www.instagram.com/instabarberpt/");
  });

  it("responde erro se o Resend recusar o aviso (chave errada)", async () => {
    enviar.mockResolvedValue({
      data: null,
      error: { name: "validation_error", message: "API key is invalid" },
    });
    const r = await POST(pedido(fase1));
    expect(r.status).toBe(502);
    expect((await r.json()).ok).toBe(false);
    expect(enviar).toHaveBeenCalledTimes(1);
  });

  it("responde erro se o Resend lançar uma exceção", async () => {
    enviar.mockRejectedValue(new Error("rede"));
    const r = await POST(pedido(fase1));
    expect(r.status).toBe(502);
  });

  it("responde erro se faltar a chave do Resend", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const r = await POST(pedido(fase1));
    expect(r.status).toBe(502);
    expect(enviar).not.toHaveBeenCalled();
  });

  it("responde erro (sem lançar) se faltar o endereço do comercial", async () => {
    vi.stubEnv("EMAIL_COMERCIAL", "");
    const r = await POST(pedido(fase1));
    expect(r.status).toBe(502);
    expect(enviar).not.toHaveBeenCalled();
  });

  it("dá ok mesmo que a resposta ao visitante falhe", async () => {
    enviar
      .mockResolvedValueOnce({ data: { id: "x" }, error: null })
      .mockResolvedValueOnce({ data: null, error: { name: "x" } });
    const r = await POST(pedido(fase1));
    expect(r.status).toBe(200);
  });

  it("descarta o pedido com o campo-isco preenchido, sem enviar", async () => {
    const r = await POST(pedido({ ...fase1, website: "http://spam" }));
    expect(r.status).toBe(200);
    expect((await r.json()).ok).toBe(true);
    expect(enviar).not.toHaveBeenCalled();
  });

  it.each([
    ["nome sem apelido", { nome: "Miguel" }],
    ["telemóvel estrangeiro", { telemovel: "+34 612 345 678" }],
    ["telemóvel curto", { telemovel: "91234567" }],
    ["e-mail inválido", { email: "miguel@" }],
    ["nome demasiado longo", { nome: "Miguel " + "a".repeat(200) }],
    ["quebra de linha no nome", { nome: "Miguel\nBcc: x@y.pt" }],
  ])("recusa %s", async (_, alteracao) => {
    const r = await POST(pedido({ ...fase1, ...alteracao }));
    expect(r.status).toBe(400);
    expect(enviar).not.toHaveBeenCalled();
  });

  it("recusa JSON inválido e pedidos demasiado grandes", async () => {
    expect((await POST(pedido("{nao e json"))).status).toBe(400);
    expect((await POST(pedido({ ...fase1, lixo: "x".repeat(9000) }))).status).toBe(413);
    expect((await POST(pedido({ fase: 3 }))).status).toBe(400);
  });
});

describe("POST /api/contacto · fase 2", () => {
  const fase2 = {
    fase: 2,
    ref: "IB-ABCD2345",
    nome: "Miguel Sousa",
    telemovel: "912 345 678",
    email: "miguel@barbearia.pt",
    distrito: "Viseu",
    cidade: "Viseu",
    barbearia: "Barbearia Central",
    barbeiros: "2",
    dificuldade: "Faltas e desmarcações",
    calculadora: "Estás a perder 300 € por mês",
    website: "",
  };

  it("envia ao comercial os dados do passo 2 com a ref", async () => {
    const r = await POST(pedido(fase2));
    expect(r.status).toBe(200);
    expect(enviar).toHaveBeenCalledTimes(1);
    const aviso = enviar.mock.calls[0]![0];
    expect(aviso.to).toBe("comercial@instabarber.pt");
    expect(aviso.subject).toContain("IB-ABCD2345");
    for (const v of [
      "Viseu",
      "Barbearia Central",
      "Faltas e desmarcações",
      "Estás a perder 300 € por mês",
    ]) {
      expect(aviso.text).toContain(v);
    }
  });

  it("aceita o passo 2 só com a ref (todos os outros campos são opcionais)", async () => {
    const r = await POST(pedido({ fase: 2, ref: "IB-ABCD2345" }));
    expect(r.status).toBe(200);
    expect(enviar.mock.calls[0]![0].replyTo).toBeUndefined();
  });

  it("recusa ref inválida e resumo da calculadora com mais de 300 caracteres", async () => {
    expect((await POST(pedido({ ...fase2, ref: "abc" }))).status).toBe(400);
    expect((await POST(pedido({ ...fase2, calculadora: "x".repeat(301) }))).status).toBe(400);
    expect(enviar).not.toHaveBeenCalled();
  });

  it("responde erro se o Resend falhar", async () => {
    enviar.mockResolvedValue({ data: null, error: { name: "x" } });
    expect((await POST(pedido(fase2))).status).toBe(502);
  });
});

describe("POST /api/contacto · CRM (D-150)", () => {
  it("grava o pedido no CRM e o aviso leva a ligação para os leads", async () => {
    const r = await POST(pedido(fase1));
    expect(r.status).toBe(200);
    expect(gravar).toHaveBeenCalledWith("203.0.113.7", expect.objectContaining({ fase: 1 }));
    expect(enviar.mock.calls[0]![0].text).toContain("/admin/comercial/leads");
  });

  it("com o limite por IP esgotado, recusa sem enviar nada", async () => {
    gravar.mockResolvedValue("limite_ip");
    const r = await POST(pedido(fase1));
    expect(r.status).toBe(429);
    expect(enviar).not.toHaveBeenCalled();
  });

  it("se a base falhar, o comercial recebe o e-mail na mesma", async () => {
    gravar.mockResolvedValue("falhou");
    const r = await POST(pedido(fase1));
    expect(r.status).toBe(200);
    expect(enviar).toHaveBeenCalledTimes(2);
  });

  it("o campo-isco não chega ao CRM", async () => {
    await POST(pedido({ ...fase1, website: "spam" }));
    expect(gravar).not.toHaveBeenCalled();
  });
});
