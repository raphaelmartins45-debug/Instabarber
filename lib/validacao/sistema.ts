import { z } from "zod";
import { valorEuros as valorEurosSistema } from "./agenda";
import { separadorHorario } from "./ficha-barbearia";

// Secções da Gestão do sistema (E.2), só o gestor. O horário é o mesmo esquema da ficha do
// Admin; as mensagens são códigos (textos.admin.ficha.erros).

const vazioParaNulo = (v: string) => (v.trim() === "" ? null : v.trim());
const urlOpc = z
  .union([z.string().trim().url("url").max(300), z.literal("")])
  .transform(vazioParaNulo);
const inteiro = (min: number, max: number) =>
  z.union([z.number(), z.string()]).transform((v, ctx) => {
    const n = Number(v);
    if (!Number.isInteger(n) || n < min || n > max)
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "numero" });
    return n;
  });

export const seccaoEstado = z.object({ aberto: z.boolean() });

export const seccaoMarca = z.object({
  capa_cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "cor"),
  historia: z.string().max(600, "longo").transform(vazioParaNulo),
  mostrar_mapa: z.boolean(),
  mostrar_historia: z.boolean(),
});

export const seccaoHorario = separadorHorario;

export const seccaoFidelizacao = z
  .object({
    selos_necessarios: inteiro(1, 50),
    premio_ativo: z.boolean(),
    premio_servico_id: z.union([z.string().uuid(), z.literal("")]).transform((v) => v || null),
  })
  .refine((v) => !v.premio_ativo || v.premio_servico_id, {
    message: "obrigatorio",
    path: ["premio_servico_id"],
  });

export const seccaoAniversario = z
  .object({
    desconto_aniversario_ativo: z.boolean(),
    desconto_aniversario_percent: z.union([z.number(), z.string()]).transform((v, ctx) => {
      if (v === "" || v === null) return null;
      const n = Number(String(v).replace(",", "."));
      if (!Number.isFinite(n) || n < 0 || n > 100)
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "numero" });
      return n;
    }),
  })
  .refine((v) => !v.desconto_aniversario_ativo || v.desconto_aniversario_percent !== null, {
    message: "obrigatorio",
    path: ["desconto_aniversario_percent"],
  });

export const seccaoFaltas = z.object({ limite_faltas: inteiro(0, 10) });

export const seccaoLigacoes = z.object({
  google_avaliacao_url: urlOpc,
  livro_reclamacoes_url: urlOpc,
});

export const ESQUEMAS_SISTEMA = {
  estado: seccaoEstado,
  sistema_marca: seccaoMarca,
  sistema_horario: seccaoHorario,
  fidelizacao: seccaoFidelizacao,
  aniversario: seccaoAniversario,
  faltas: seccaoFaltas,
  ligacoes: seccaoLigacoes,
} as const;

export type SeccaoComFormulario = keyof typeof ESQUEMAS_SISTEMA;

/** Número escrito num campo (aceita vírgula decimal), entre limites. */
const numeroTexto = (min: number, max: number, inteiroSo = false) =>
  z.union([z.number(), z.string()]).transform((v, ctx) => {
    const n = Number(String(v).replace(",", "."));
    if (!Number.isFinite(n) || n < min || n > max || (inteiroSo && !Number.isInteger(n)))
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "numero" });
    return n;
  });

const hora = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "hora");
const dataHoraLocal = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "data");

export const esquemaAusencia = z
  .object({
    profissionalId: z.union([z.string().uuid(), z.literal("")]).transform((v) => v || null),
    tipo: z.enum(["ferias", "folga", "formacao", "doenca", "outro"]),
    inicio: dataHoraLocal,
    fim: dataHoraLocal,
    motivo: z.string().max(200).transform(vazioParaNulo),
  })
  .refine((v) => v.fim > v.inicio, { message: "periodo", path: ["fim"] });

export const esquemaFeriado = z.object({
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "data"),
  nome: z.string().trim().min(1, "nome").max(80, "nome"),
});

export const esquemaPeriodo = z
  .object({
    diaSemana: numeroTexto(0, 6, true),
    horaInicio: hora,
    horaFim: hora,
    percentagem: numeroTexto(0.01, 100),
  })
  .refine((v) => v.horaInicio < v.horaFim, { message: "periodo", path: ["horaFim"] });

const textoOpc = (max: number) => z.string().max(max, "longo").transform(vazioParaNulo);

/** Serviço (E.2, F.3.2): preço final ao cliente; inglês e francês opcionais, nunca traduzidos. */
export const esquemaServico = z.object({
  nome: z.string().trim().min(1, "nome").max(80, "nome"),
  nomeEn: textoOpc(80),
  nomeFr: textoOpc(80),
  descricao: textoOpc(300),
  descricaoEn: textoOpc(300),
  descricaoFr: textoOpc(300),
  duracaoMin: numeroTexto(5, 480, true),
  precoCent: valorEurosSistema,
  ativo: z.boolean(),
});

/** Ficha do barbeiro na Gestão do sistema (E.2): comissões, modelo de caixa e renda. */
export const esquemaFichaBarbeiro = z
  .object({
    comissao: numeroTexto(0, 100),
    modelo: z.enum(["A", "B", "C"]),
    renda: z.string().transform((v, ctx) => {
      if (!v.trim()) return null;
      const n = Number(v.trim().replace(",", "."));
      if (!Number.isFinite(n) || n < 0)
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "valor" });
      return Math.round(n * 100);
    }),
    rendaDia: z
      .string()
      .transform((v) => (v.trim() ? Number(v) : null))
      .refine((v) => v === null || (Number.isInteger(v) && v >= 1 && v <= 28), "numero"),
    porServico: z.record(z.string().uuid(), z.string()).transform((r, ctx) =>
      Object.entries(r).flatMap(([servicoId, v]) => {
        if (!v.trim()) return [];
        const n = Number(v.replace(",", "."));
        if (!Number.isFinite(n) || n < 0 || n > 100)
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "numero" });
        return [{ servicoId, percentagem: n }];
      }),
    ),
  })
  .refine((v) => v.modelo !== "C" || v.renda !== null, { message: "renda", path: ["renda"] });

export const esquemaHorarioBarbeiro = z
  .array(z.object({ diaSemana: numeroTexto(0, 6, true), inicio: hora, fim: hora }))
  .max(21)
  .refine((ls) => ls.every((l) => l.inicio < l.fim), "horario");

/** Plano do clube (F.4.2): preço mensal final, validade, transitar crédito e serviços incluídos. */
export const esquemaPlano = z.object({
  nome: z.string().trim().min(1, "nome").max(60, "nome"),
  precoCent: valorEurosSistema,
  validadeDias: numeroTexto(7, 92, true),
  transitaCredito: z.boolean(),
  renovacaoAuto: z.boolean(),
  ativo: z.boolean(),
  servicos: z.record(z.string().uuid(), z.string()).transform((r, ctx) =>
    Object.entries(r).flatMap(([servicoId, v]) => {
      if (!v.trim() || v.trim() === "0") return [];
      const n = Number(v);
      if (!Number.isInteger(n) || n < 1 || n > 60)
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "numero" });
      return [{ servicoId, quantidade: n }];
    }),
  ),
});
