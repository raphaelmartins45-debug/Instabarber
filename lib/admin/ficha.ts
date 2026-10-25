import type { SeparadorComFormulario } from "@/lib/validacao/ficha-barbearia";

// Separadores da ficha da barbearia (E.1), pela ordem do documento, e os campos de cada
// separador de formulário. Os rótulos estão em textos.admin.ficha.campos.

export const SEPARADORES = [
  "identidade",
  "marca",
  "contactos",
  "horario",
  "servicos",
  "equipa",
  "funcionalidades",
  "pagamentos",
  "importacao",
  "apoio",
  "auditoria",
] as const;
export type Separador = (typeof SEPARADORES)[number];

export type TipoCampo =
  | "texto"
  | "longo"
  | "numero"
  | "hora"
  | "data"
  | "cor"
  | "url"
  | "email"
  | "tel"
  | "booleano"
  | "dias"
  | "selecao";
export type CampoFicha = {
  nome: string;
  tipo: TipoCampo;
  /** Rótulo próprio; sem ele, vale o de textos.admin.ficha.campos. */
  rotulo?: string;
  opcoes?: { valor: string; rotulo: string }[];
  ajuda?: string;
};

export function camposDe(
  separador: SeparadorComFormulario,
  rotulos: {
    planos: Record<string, string>;
    periodicidades: Record<string, string>;
    pagamentos: Record<string, string>;
    slugAjuda: string;
    dominioAjuda: string;
  },
): CampoFicha[] {
  const op = (r: Record<string, string>) =>
    Object.entries(r).map(([valor, rotulo]) => ({ valor, rotulo }));
  switch (separador) {
    case "identidade":
      return [
        { nome: "nome", tipo: "texto" },
        { nome: "slug", tipo: "texto", ajuda: rotulos.slugAjuda },
        { nome: "nif", tipo: "texto" },
        { nome: "responsavel", tipo: "texto" },
        { nome: "ano_abertura", tipo: "numero" },
        { nome: "descricao", tipo: "longo" },
        { nome: "historia", tipo: "longo" },
        { nome: "plano", tipo: "selecao", opcoes: op(rotulos.planos) },
        { nome: "periodicidade", tipo: "selecao", opcoes: op(rotulos.periodicidades) },
        { nome: "profissionais_contratados", tipo: "numero" },
        { nome: "dominio_proprio", tipo: "texto", ajuda: rotulos.dominioAjuda },
      ];
    case "marca":
      return [
        { nome: "capa_cor", tipo: "cor" },
        { nome: "mostrar_mapa", tipo: "booleano" },
        { nome: "mostrar_historia", tipo: "booleano" },
      ];
    case "contactos":
      return [
        { nome: "telefone", tipo: "tel" },
        { nome: "whatsapp", tipo: "tel" },
        { nome: "email", tipo: "email" },
        { nome: "cidade", tipo: "texto" },
        { nome: "morada", tipo: "texto" },
        { nome: "codigo_postal", tipo: "texto" },
        { nome: "instagram", tipo: "texto" },
        { nome: "facebook", tipo: "texto" },
        { nome: "tiktok", tipo: "texto" },
        { nome: "google_maps_url", tipo: "url" },
        { nome: "google_avaliacao_url", tipo: "url" },
        { nome: "livro_reclamacoes_url", tipo: "url" },
      ];
    case "horario":
      return [
        { nome: "hora_abertura", tipo: "hora" },
        { nome: "hora_fecho", tipo: "hora" },
        { nome: "intervalo_almoco_inicio", tipo: "hora" },
        { nome: "intervalo_almoco_fim", tipo: "hora" },
        { nome: "dias_descanso", tipo: "dias" },
        { nome: "fecha_feriados", tipo: "booleano" },
        {
          nome: "granularidade_min",
          tipo: "selecao",
          opcoes: ["5", "10", "15", "20", "30", "60"].map((v) => ({ valor: v, rotulo: v })),
        },
        { nome: "intervalo_marcacoes_min", tipo: "numero" },
        { nome: "antecedencia_minima_min", tipo: "numero" },
        { nome: "antecedencia_cancelamento_min", tipo: "numero" },
        { nome: "janela_marcacao_dias", tipo: "numero" },
        { nome: "aberto", tipo: "booleano" },
      ];
    case "pagamentos":
      return [
        { nome: "estado_pagamento", tipo: "selecao", opcoes: op(rotulos.pagamentos) },
        { nome: "proximo_vencimento", tipo: "data" },
      ];
  }
}

/** Valores do formulário a partir da linha da barbearia: nulos passam a texto vazio, horas a HH:MM. */
export function valoresDe(
  linha: Record<string, unknown>,
  campos: CampoFicha[],
): Record<string, unknown> {
  return Object.fromEntries(
    campos.map(({ nome, tipo }) => {
      const v = linha[nome];
      if (tipo === "booleano") return [nome, !!v];
      if (tipo === "dias") return [nome, (v as number[] | null) ?? []];
      if (v === null || v === undefined) return [nome, ""];
      if (tipo === "hora") return [nome, String(v).slice(0, 5)];
      return [nome, String(v)];
    }),
  );
}
