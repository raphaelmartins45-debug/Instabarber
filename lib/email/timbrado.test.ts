import { describe, expect, it } from "vitest";
import { emailTimbrado, escapeHtml, textoDoEmail } from "./timbrado";

const base = {
  saudacao: "Olá Miguel,",
  corpo: ["Primeiro parágrafo.", "Último parágrafo."],
  despedida: "Com os melhores cumprimentos,",
  assinatura: ["Comercial InstaBarber", "+351 900 000 000"],
  logoUrl: "https://instabarber.pt/marca/logo-horizontal-dourado.png",
  iconeEmailUrl: "https://instabarber.pt/marca/icone-email-dourado.png",
  iconeInstagramUrl: "https://instabarber.pt/marca/icone-instagram-dourado.png",
  rodape: {
    email: "comercial@instabarber.pt",
    instagramTexto: "@instabarberpt",
    instagramUrl: "https://www.instagram.com/instabarberpt/",
  },
};

describe("emailTimbrado", () => {
  it("tem cabeçalho com a logo, assinatura e rodapé com e-mail e Instagram", () => {
    const html = emailTimbrado(base);
    expect(html).toContain('src="https://instabarber.pt/marca/logo-horizontal-dourado.png"');
    expect(html).toContain("mailto:comercial@instabarber.pt");
    expect(html).toContain("https://www.instagram.com/instabarberpt/");
    expect(html).toContain("icone-email-dourado.png");
    expect(html).toContain("icone-instagram-dourado.png");
    expect(html.indexOf("Com os melhores cumprimentos,")).toBeLessThan(
      html.indexOf("Comercial InstaBarber"),
    );
  });

  it("assinatura: o nome a negrito; o resto sem negrito, em cinzento-escuro (D-184)", () => {
    const html = emailTimbrado(base);
    expect(html).toMatch(/<strong[^>]*>Comercial InstaBarber<\/strong><br><span[^>]*>\+351/);
    expect(html).not.toContain("<strong>+351 900 000 000</strong>");
  });

  it("escapa o texto vindo de fora", () => {
    const html = emailTimbrado({ ...base, saudacao: "Olá <script>alert(1)</script>," });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(escapeHtml(`a&b"c'd`)).toBe("a&amp;b&quot;c&#39;d");
  });

  it("desenha cada bloco: destaque, botão com ligação de recurso, lista numerada e pares", () => {
    const html = emailTimbrado({
      ...base,
      corpo: [
        { destaque: "Referência do pedido: IB-ABCD2345" },
        { botao: "Definir a palavra-passe", url: "https://instabarber.pt/x?a=1&b=2" },
        { lista: ["Ler", "Assinar"], numerada: true },
        { pares: [["Painel de gestão", "https://judah.instabarber.pt/gestor"]] },
      ],
    });
    expect(html).toContain("Referência do pedido: IB-ABCD2345");
    expect(html).toContain("border-left");
    expect(html.match(/href="https:\/\/instabarber\.pt\/x\?a=1&amp;b=2"/g)).toHaveLength(2);
    expect(html).toContain("<ol");
    expect(html).toContain('href="https://judah.instabarber.pt/gestor"');
    expect(emailTimbrado(base)).not.toContain("border-left");
  });
});

describe("textoDoEmail", () => {
  it("dá a mesma mensagem em texto simples, com a assinatura depois de uma linha em branco", () => {
    const texto = textoDoEmail({
      ...base,
      corpo: [
        "Parágrafo.",
        { botao: "Carregar", url: "https://x.pt/c", nota: "Vale 30 dias." },
        { lista: ["Ler", "Assinar"], numerada: true },
        { pares: [["Valor", "39,99 €"]] },
      ],
    });
    expect(texto).toBe(
      [
        "Olá Miguel,",
        "Parágrafo.",
        "Carregar: https://x.pt/c\nVale 30 dias.",
        "1. Ler\n2. Assinar",
        "Valor: 39,99 €",
        "Com os melhores cumprimentos,",
        "Comercial InstaBarber\n+351 900 000 000",
      ].join("\n\n"),
    );
  });
});
