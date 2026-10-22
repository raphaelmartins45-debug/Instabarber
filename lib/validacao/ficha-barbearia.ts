import { z } from "zod";
import { telefoneE164 } from "@/lib/formatacao/telefone";
import { slugValido } from "@/lib/inquilino/host";
import { INCLUIDOS } from "@/lib/regras/mensalidade";

// Separadores da ficha da barbearia no Admin (E.1). Cada separador grava de forma independente;
// o mesmo esquema valida o formulário e a Server Action. Mensagens = códigos (textos.admin.ficha.erros).

const SEM_CONTROLO = /^[^\u0000-\u001f\u007f]*$/;
const vazioParaNulo = (v: string) => (v.trim() === "" ? null : v.trim());
const textoOpc = (max: number) =>
  z.string().max(max, "longo").regex(SEM_CONTROLO, "longo").transform(vazioParaNulo);
const obrig = (max: number) =>
  z.string().trim().min(1, "obrigatorio").max(max, "longo").regex(SEM_CONTROLO, "longo");
const hora = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:\d\d)?$/, "hora");
const horaOpc = z.union([hora, z.literal("")]).transform(vazioParaNulo);
const urlOpc = z
  .union([z.string().trim().url("url").max(300), z.literal("")])
  .transform(vazioParaNulo);
const telOpc = z.string().transform((v, ctx) => {
  if (!v.trim()) return null;
  const e = telefoneE164(v);
  if (!e) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "telefone" });
  return e;
});
const inteiro = (min: number, max: number) =>
  z.union([z.number(), z.string()]).transform((v, ctx) => {
    const n = Number(v);
    if (!Number.isInteger(n) || n < min || n > max)
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "numero" });
    return n;
  });

export const separadorIdentidade = z
  .object({
    nome: obrig(80),
    slug: z.string().trim().toLowerCase().refine(slugValido, "slug"),
    nif: z.union([z.string().regex(/^\d{9}$/, "nif"), z.literal("")]).transform(vazioParaNulo),
    responsavel: textoOpc(80),
    ano_abertura: z
      .union([z.string().regex(/^\d{4}$/, "numero"), z.literal("")])
      .transform((v) => (v ? Number(v) : null)),
    descricao: textoOpc(600),
    historia: textoOpc(600),
    plano: z.enum(["basic", "pro"]),
    periodicidade: z.enum(["mensal", "anual"]),
    profissionais_contratados: inteiro(1, 200),
    dominio_proprio: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^(([a-z0-9-]+\.)+[a-z]{2,})?$/, "dominio")
      .transform(vazioParaNulo),
  })
  .refine(
    (v) =>
      v.plano === "basic"
        ? v.profissionais_contratados === 1
        : v.profissionais_contratados >= INCLUIDOS.pro,
    { message: "profissionais", path: ["profissionais_contratados"] },
  );

export const separadorMarca = z.object({
  capa_cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "cor"),
  mostrar_mapa: z.boolean(),
  mostrar_historia: z.boolean(),
});

export const separadorContactos = z.object({
  telefone: telOpc,
  whatsapp: telOpc,
  email: z.union([z.string().trim().email("email"), z.literal("")]).transform(vazioParaNulo),
  cidade: textoOpc(80),
  morada: textoOpc(160),
  codigo_postal: z
    .union([z.string().regex(/^\d{4}-\d{3}$/, "codigoPostal"), z.literal("")])
    .transform(vazioParaNulo),
  instagram: textoOpc(80),
  facebook: textoOpc(120),
  tiktok: textoOpc(80),
  google_maps_url: urlOpc,
  google_avaliacao_url: urlOpc,
  livro_reclamacoes_url: urlOpc,
});

export const separadorHorario = z
  .object({
    hora_abertura: hora,
    hora_fecho: hora,
    intervalo_almoco_inicio: horaOpc,
    intervalo_almoco_fim: horaOpc,
    dias_descanso: z.array(z.number().int().min(0).max(6)).max(6),
    fecha_feriados: z.boolean(),
    granularidade_min: z
      .union([z.number(), z.string()])
      .transform(Number)
      .pipe(
        z.union([
          z.literal(5),
          z.literal(10),
          z.literal(15),
          z.literal(20),
          z.literal(30),
          z.literal(60),
        ]),
      ),
    intervalo_marcacoes_min: inteiro(0, 60),
    antecedencia_minima_min: inteiro(0, 2880),
    antecedencia_cancelamento_min: inteiro(0, 2880),
    janela_marcacao_dias: inteiro(1, 365),
    aberto: z.boolean(),
  })
  .refine((v) => v.hora_abertura < v.hora_fecho, { message: "horario", path: ["hora_fecho"] })
  .refine((v) => !v.intervalo_almoco_inicio === !v.intervalo_almoco_fim, {
    message: "hora",
    path: ["intervalo_almoco_fim"],
  });

export const separadorPagamento = z.object({
  estado_pagamento: z.enum(["em_dia", "em_atraso"]),
  proximo_vencimento: z
    .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "numero"), z.literal("")])
    .transform(vazioParaNulo),
});

export const ESQUEMAS_SEPARADOR = {
  identidade: separadorIdentidade,
  marca: separadorMarca,
  contactos: separadorContactos,
  horario: separadorHorario,
  pagamentos: separadorPagamento,
} as const;

export type SeparadorComFormulario = keyof typeof ESQUEMAS_SEPARADOR;
