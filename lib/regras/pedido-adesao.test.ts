import { describe, expect, it } from "vitest";
import { esquemaPedidoAdesao, type DadosPedidoAdesao } from "@/lib/validacao/adesao";
import { paraSubmissao, precoDoPedido } from "./pedido-adesao";

const pedidoExemplo: DadosPedidoAdesao = {
  identidade: {
    nome: "Barbearia Central",
    responsavel: "Miguel Sousa",
    nif: "509999999",
    ano_abertura: "2019",
    descricao: "",
    logo_path: "adesoes/0b9d7c1e-1111-4222-8333-444455556666/logo.png",
    capa_path: "",
    galeria_paths: [],
  },
  contactos: {
    telefone: "912 345 678",
    whatsapp: "",
    email: "geral@central.pt",
    cidade: "Viseu",
    morada: "Rua Direita, 10",
    instagram: "",
    facebook: "",
    tiktok: "",
    google_maps_url: "",
    hora_abertura: "09:00",
    hora_fecho: "19:30",
    dias_descanso: [0, 1],
    intervalo_almoco_inicio: "",
    intervalo_almoco_fim: "",
  },
  servicos: {
    servicos: [{ nome: "Corte", duracao_min: "30", preco: "15,00" }],
    equipa: [],
    modelo_caixa: "A",
  },
  contratacao: {
    plano: "pro",
    periodicidade: "mensal",
    profissionais: 5,
    preferencia_pagamento: "mbway",
    email_acesso: "Miguel@Central.pt",
    observacoes: "",
    aceitou_termos: true,
  },
};

describe("paraSubmissao", () => {
  it("normaliza telefone, e-mail e preços e calcula a mensalidade pela fórmula única", () => {
    const p = paraSubmissao(esquemaPedidoAdesao.parse(pedidoExemplo));
    expect(p).toMatchObject({
      telefone: "+351912345678",
      email_acesso: "miguel@central.pt",
      ano_abertura: 2019,
      servicos: [{ nome: "Corte", duracao_min: 30, preco: "15.00" }],
      mensalidade_calculada: "59.00",
      capa_path: null,
      aceitou_termos: true,
    });
    expect(p).not.toHaveProperty("palavra_passe");
  });

  it("o preço do pedido sai da mesma fórmula (D.5)", () => {
    const pedido = esquemaPedidoAdesao.parse(pedidoExemplo);
    expect(precoDoPedido(pedido, "normal")).toEqual({ semIva: 5900, comIva: 7257, ivaTaxa: 23 });
  });

  it("recusa Pro com menos de 3 profissionais e pedidos sem aceitar os documentos", () => {
    const menos = {
      ...pedidoExemplo,
      contratacao: { ...pedidoExemplo.contratacao, profissionais: 2 },
    };
    expect(esquemaPedidoAdesao.safeParse(menos).success).toBe(false);
    const semTermos = {
      ...pedidoExemplo,
      contratacao: { ...pedidoExemplo.contratacao, aceitou_termos: false },
    };
    expect(esquemaPedidoAdesao.safeParse(semTermos).success).toBe(false);
  });
});
