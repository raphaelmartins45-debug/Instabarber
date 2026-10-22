import { describe, expect, it } from "vitest";
import {
  mensagemAniversario,
  mensagemAvaliacao,
  mensagemCliente,
  mensagemFilaVaga,
  mensagemLembrete,
  podePedirAvaliacao,
  tipoSugerido,
} from "./mensagens";

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

describe("mensagemFilaVaga (F.4.1)", () => {
  it("diz o serviço, o horário que abriu e o prazo de 30 minutos", () => {
    const m = mensagemFilaVaga({
      cliente: "Ana Sousa",
      servico: "Corte",
      inicio: "2026-10-23T14:30:00Z",
      barbearia: "Barbearia A",
    });
    expect(m).toContain("Olá Ana!");
    expect(m).toContain("Corte, 23/10/2026 às 15:30");
    expect(m).toContain("30 minutos");
  });
});

describe("mensagemAvaliacao (F.4.13)", () => {
  it("leva a ligação de avaliação e a assinatura", () => {
    const m = mensagemAvaliacao("Rui Lopes", "https://g.page/r/x", "Barbearia A");
    expect(m).toContain("Olá Rui!");
    expect(m).toContain("https://g.page/r/x");
    expect(m).toContain("Barbearia A");
  });
});

describe("podePedirAvaliacao (F.4.13)", () => {
  const agora = new Date("2026-10-22T12:00:00Z");
  it("sem pedido anterior, pode", () => expect(podePedirAvaliacao(null, agora)).toBe(true));
  it("há menos de 90 dias, não pode", () =>
    expect(podePedirAvaliacao("2026-08-01T12:00:00Z", agora)).toBe(false));
  it("há 90 dias ou mais, pode", () =>
    expect(podePedirAvaliacao("2026-07-24T12:00:00Z", agora)).toBe(true));
});
