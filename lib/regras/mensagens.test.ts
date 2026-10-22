import { describe, expect, it } from "vitest";
import { mensagemAniversario, mensagemCliente, mensagemLembrete, tipoSugerido } from "./mensagens";

describe("mensagens wa.me", () => {
  const marcacao = {
    cliente: "João Silva",
    servico: "Corte",
    inicio: "2026-10-22T14:00:00Z",
    barbeiro: "Rui",
    barbearia: "Barbearia A",
  };
  it("lembrete no próprio dia diz quantos minutos faltam (hora de Lisboa)", () => {
    const m = mensagemLembrete(marcacao, new Date("2026-10-22T13:15:00Z"));
    expect(m).toContain("Olá João!");
    expect(m).toContain("Corte, 22/10/2026 às 15:00, com Rui");
    expect(m).toContain("Faltam 45 minutos.");
  });
  it("lembrete noutro dia não diz minutos", () => {
    expect(mensagemLembrete(marcacao, new Date("2026-10-21T10:00:00Z"))).not.toContain("Faltam");
  });
  it("mensagem conforme o estado, com dias, serviço, data e página", () => {
    const base = {
      cliente: "Ana Costa",
      diasSemVir: 70,
      ultimoServico: "Corte",
      ultimaVisita: "2026-08-13T10:00:00Z",
      pagina: "https://barbearia-a.instabarber.pt",
      assinatura: "Rui",
    };
    expect(mensagemCliente({ ...base, estado: "perdido" })).toContain("Há 70 dias");
    expect(mensagemCliente({ ...base, estado: "em_risco" })).toContain("Já passaram 70 dias");
    expect(mensagemCliente({ ...base, estado: "ativo" })).toContain("13/08/2026");
    expect(tipoSugerido("sem_historico")).toBeNull();
  });
  it("o aniversário nunca fala do desconto", () => {
    expect(mensagemAniversario("Ana Costa", "Rui")).not.toMatch(/desconto|%/);
  });
});
