import { z } from "zod";
import { centimosDeTexto } from "@/lib/formatacao/dinheiro";
import { telefoneE164 } from "@/lib/formatacao/telefone";
import { INCLUIDOS } from "@/lib/regras/mensalidade";

// Formulário de adesão em quatro passos (D.8). O mesmo esquema valida o formulário (passo a
// passo) e a rota api/adesoes. Nunca há campo de palavra-passe (D.10). Mensagens = códigos.

const SEM_CONTROLO = /^[^\u0000-\u001f\u007f]*$/;
const texto = (max: number) => z.string().trim().max(max, "longo").regex(SEM_CONTROLO, "invalido");
const opcional = (max: number) => texto(max).optional().default("");
const hora = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "hora");
const horaOpcional = z
  .union([hora, z.literal("")])
  .optional()
  .default("");
const telemovel = z
  .string()
  .max(30)
  .transform((v, ctx) => {
    const e164 = telefoneE164(v);
    if (!e164) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "telemovel" });
    return e164 ?? "";
  });
const telemovelOpcional = z
  .string()
  .max(30)
  .optional()
  .default("")
  .transform((v, ctx) => {
    if (!v.trim()) return "";
    const e164 = telefoneE164(v);
    if (!e164) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "telemovel" });
    return e164 ?? "";
  });
const url = z
  .union([z.string().trim().url("url").max(300), z.literal("")])
  .optional()
  .default("");
/** Caminho de um ficheiro carregado pelo URL assinado da rota (bucket privado comercial). */
export const FORMATO_CAMINHO =
  /^adesoes\/[0-9a-f-]{36}\/(logo|capa|galeria-[1-6])\.(png|svg|webp|jpg)$/;
const caminho = z.string().regex(FORMATO_CAMINHO, "imagem");

export const passoIdentidade = z.object({
  nome: texto(80).min(2, "obrigatorio"),
  responsavel: texto(80).min(2, "obrigatorio"),
  nif: z
    .string()
    .trim()
    .regex(/^\d{9}$/, "nif"),
  ano_abertura: z
    .string()
    .trim()
    .regex(/^((19|20)\d{2})?$/, "ano")
    .optional()
    .default("")
    .transform((v) => (v ? Number(v) : null)),
  descricao: opcional(600),
  logo_path: caminho,
  capa_path: z
    .union([caminho, z.literal("")])
    .optional()
    .default(""),
  galeria_paths: z.array(caminho).max(5, "galeria").default([]),
});

export const passoContactos = z
  .object({
    telefone: telemovel,
    whatsapp: telemovelOpcional,
    email: texto(160).email("email"),
    cidade: texto(80).min(2, "obrigatorio"),
    morada: texto(160).min(3, "obrigatorio"),
    instagram: opcional(80),
    facebook: opcional(120),
    tiktok: opcional(80),
    google_maps_url: url,
    hora_abertura: hora,
    hora_fecho: hora,
    dias_descanso: z.array(z.number().int().min(0).max(6)).max(6).default([]),
    intervalo_almoco_inicio: horaOpcional,
    intervalo_almoco_fim: horaOpcional,
  })
  .refine((v) => v.hora_abertura < v.hora_fecho, { message: "horario", path: ["hora_fecho"] })
  .refine((v) => !v.intervalo_almoco_inicio === !v.intervalo_almoco_fim, {
    message: "almoco",
    path: ["intervalo_almoco_fim"],
  })
  .refine((v) => !v.intervalo_almoco_inicio || v.intervalo_almoco_inicio < v.intervalo_almoco_fim, {
    message: "almoco",
    path: ["intervalo_almoco_fim"],
  });

const servico = z.object({
  nome: texto(80).min(2, "obrigatorio"),
  duracao_min: z
    .string()
    .trim()
    .regex(/^\d{1,3}$/, "duracao")
    .transform(Number)
    .refine((n) => n >= 5 && n <= 480, "duracao"),
  preco: z.string().transform((v, ctx) => {
    const c = centimosDeTexto(v);
    if (c === null) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "preco" });
    return c ?? 0;
  }),
});
const membro = z.object({
  nome: texto(80).min(2, "obrigatorio"),
  email: texto(160).email("email"),
});

export const passoServicos = z.object({
  servicos: z.array(servico).min(1, "servicos").max(60),
  equipa: z.array(membro).max(30).default([]),
  modelo_caixa: z.enum(["A", "B", "C"]),
});

export const passoContratacao = z
  .object({
    plano: z.enum(["basic", "pro"]),
    periodicidade: z.enum(["mensal", "anual"]),
    profissionais: z.number().int(),
    preferencia_pagamento: z.enum(["mbway", "transferencia", "dinheiro"]),
    email_acesso: texto(160).toLowerCase().email("email"),
    observacoes: opcional(600),
    aceitou_termos: z.literal(true, { errorMap: () => ({ message: "termos" }) }),
  })
  .refine((v) => (v.plano === "basic" ? v.profissionais === 1 : v.profissionais >= INCLUIDOS.pro), {
    message: "profissionais",
    path: ["profissionais"],
  });

/** O pedido completo, como chega à rota (o isco `website` tem de vir vazio). */
export const esquemaPedidoAdesao = z.object({
  identidade: passoIdentidade,
  contactos: passoContactos,
  servicos: passoServicos,
  contratacao: passoContratacao,
  website: z.string().max(200).optional().default(""),
});

export type PedidoAdesao = z.output<typeof esquemaPedidoAdesao>;
export type DadosPedidoAdesao = z.input<typeof esquemaPedidoAdesao>;

/** Pedido de URL assinado para carregar uma imagem (D.8.1). */
export const esquemaCarregamento = z.object({
  tipo: z.enum(["logo", "capa", "galeria"]),
  posicao: z.number().int().min(1).max(6).default(1),
  formato: z.enum(["image/png", "image/svg+xml", "image/webp", "image/jpeg"]),
  tamanho: z.number().int().positive(),
  pasta: z.string().uuid(),
});
