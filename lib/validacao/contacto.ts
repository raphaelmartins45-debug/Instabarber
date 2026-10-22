import { z } from "zod";
import { telefoneE164 } from "@/lib/formatacao/telefone";

// Pedido de contacto da landing, em duas fases (D-50). A landing valida o mesmo antes de enviar.

export const FORMATO_REF = /^IB-[A-HJ-NP-Z2-9]{8}$/;

// Sem caracteres de controlo (quebras de linha incluídas): os valores entram em assuntos de e-mail.
const SEM_CONTROLO = /^[^\u0000-\u001f\u007f]*$/;
const texto = (maximo: number) =>
  z.string().trim().max(maximo).regex(SEM_CONTROLO, "caracteres_invalidos");
const opcional = (maximo: number) => texto(maximo).optional().default("");

// Campo-isco: invisível para pessoas. Se vier preenchido, o pedido é descartado em silêncio.
const isco = z.string().max(200).optional().default("");

const nome = texto(120).refine(
  (v) => v.split(/\s+/).filter(Boolean).length >= 2,
  "nome_incompleto",
);
const telemovel = z
  .string()
  .max(30)
  .transform((v, ctx) => {
    const e164 = telefoneE164(v);
    if (!e164) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "telemovel_invalido" });
    return e164 ?? "";
  });
const email = texto(160).email("email_invalido");

const camposPasso2 = {
  distrito: opcional(40),
  cidade: opcional(80),
  barbearia: opcional(120),
  barbeiros: opcional(20),
  dificuldade: opcional(120),
  calculadora: opcional(300),
};

export const esquemaContactoFase1 = z.object({
  fase: z.literal(1),
  nome,
  telemovel,
  email,
  website: isco,
});

export const esquemaContactoFase2 = z.object({
  fase: z.literal(2),
  ref: z.string().regex(FORMATO_REF, "ref_invalida"),
  nome: opcional(120),
  telemovel: opcional(30),
  email: opcional(160),
  website: isco,
  ...camposPasso2,
});

export const esquemaContacto = z.discriminatedUnion("fase", [
  esquemaContactoFase1,
  esquemaContactoFase2,
]);

export type PedidoContacto = z.infer<typeof esquemaContacto>;
export type PedidoContactoFase1 = z.infer<typeof esquemaContactoFase1>;
export type PedidoContactoFase2 = z.infer<typeof esquemaContactoFase2>;

const ALFABETO_REF = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Referência do pedido (IB- e 8 caracteres sem 0/O nem 1/I), devolvida na fase 1 e usada na fase 2. */
export function gerarRef(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return `IB-${Array.from(bytes, (b) => ALFABETO_REF[b % ALFABETO_REF.length]).join("")}`;
}
