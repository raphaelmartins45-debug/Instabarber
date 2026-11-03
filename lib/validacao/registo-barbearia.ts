import { z } from "zod";
import { IMPLEMENTACOES } from "@/lib/comercial/condicoes";
import { centimosDeTexto } from "@/lib/formatacao/dinheiro";
import { telefoneE164 } from "@/lib/formatacao/telefone";
import { INCLUIDOS } from "@/lib/regras/mensalidade";

// Registo de uma barbearia pelo painel (D-189): a Performa LAB preenche o essencial; o resto o
// dono completa no painel. O mesmo esquema valida o formulário e a ação. Mensagens = códigos.

const texto = (max: number) => z.string().trim().max(max, "longo");
const opcional = (max: number) => texto(max).optional().default("");
const telemovel = z
  .string()
  .max(30)
  .optional()
  .default("")
  .transform((v, ctx) => {
    if (!v.trim()) return "";
    const e164 = telefoneE164(v);
    if (!e164) ctx.addIssue({ code: "custom", message: "telemovel" });
    return e164 ?? "";
  });
const dinheiro = z
  .string()
  .trim()
  .optional()
  .default("")
  .refine((v) => centimosDeTexto(v || "0") !== null, "valor")
  .transform((v) => centimosDeTexto(v || "0")!);

export const esquemaRegistoBarbearia = z
  .object({
    nome: texto(120).min(2, "obrigatorio"),
    responsavel: texto(120).min(2, "obrigatorio"),
    nif: z
      .union([
        z.literal(""),
        z
          .string()
          .trim()
          .regex(/^\d{9}$/, "nif"),
      ])
      .default(""),
    email_acesso: z.string().trim().toLowerCase().email("email").max(160),
    telefone: telemovel,
    cidade: opcional(80),
    morada: opcional(240),
    plano: z.enum(["basic", "pro"]),
    periodicidade: z.enum(["mensal", "semestral", "anual"]),
    profissionais: z.coerce.number().int("profissionais").min(1, "profissionais").max(200),
    implementacao: z.enum(IMPLEMENTACOES),
    valor_implementacao: dinheiro,
    campanha_id: z.union([z.literal(""), z.guid()]).default(""),
    cortesia: z.boolean().default(false),
    cortesia_ate: z
      .union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "data")])
      .default(""),
  })
  .refine((v) => (v.plano === "basic" ? v.profissionais === 1 : v.profissionais >= INCLUIDOS.pro), {
    message: "profissionais",
    path: ["profissionais"],
  })
  .refine((v) => v.implementacao !== "nenhuma" || v.valor_implementacao === 0, {
    message: "valor",
    path: ["valor_implementacao"],
  })
  .refine((v) => v.cortesia || v.cortesia_ate === "", { message: "data", path: ["cortesia_ate"] });
export type DadosRegistoBarbearia = z.input<typeof esquemaRegistoBarbearia>;
export type RegistoBarbearia = z.output<typeof esquemaRegistoBarbearia>;
