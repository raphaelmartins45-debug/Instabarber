import { describe, expect, it } from "vitest";
import { emailTimbrado, escapeHtml } from "./timbrado";

const base = {
  saudacao: "Olá Miguel,",
  paragrafos: ["Primeiro parágrafo."],
  paragrafosFinais: ["Último parágrafo."],
  despedida: "Com os melhores cumprimentos,",
  assinatura: ["Comercial InstaBarber", "+351 900 000 000"],
  logoUrl: "https://instabarber.pt/marca/logo-horizontal-dourado.png",
  rodape: {
    email: "comercial@instabarber.pt",
    instagramTexto: "@instabarberpt",
    instagramUrl: "https://www.instagram.com/instabarberpt/",
  },
};

describe("emailTimbrado", () => {
  it("tem cabeçalho com a logo, assinatura a negrito e rodapé com e-mail e Instagram", () => {
    const html = emailTimbrado(base);
    expect(html).toContain('src="https://instabarber.pt/marca/logo-horizontal-dourado.png"');
    expect(html).toContain("<strong>Comercial InstaBarber</strong><br><strong>+351 900 000 000</strong>");
    expect(html).toContain("mailto:comercial@instabarber.pt");
    expect(html).toContain("https://www.instagram.com/instabarberpt/");
    expect(html.indexOf("Com os melhores cumprimentos,")).toBeLessThan(html.indexOf("Comercial InstaBarber"));
  });

  it("escapa o texto vindo do visitante", () => {
    const html = emailTimbrado({ ...base, saudacao: "Olá <script>alert(1)</script>," });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(escapeHtml(`a&b"c'd`)).toBe("a&amp;b&quot;c&#39;d");
  });

  it("mostra a caixa de destaque só quando existe", () => {
    expect(emailTimbrado(base)).not.toContain("border-left");
    expect(emailTimbrado({ ...base, destaque: { titulo: "Referência do pedido: IB-ABCD2345" } })).toContain(
      "Referência do pedido: IB-ABCD2345",
    );
  });
});
