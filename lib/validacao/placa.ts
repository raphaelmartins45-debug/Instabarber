import { z } from "zod";

// A placa do balcão (D-185): o modelo e os três textos que o gestor pode mudar. O mesmo esquema
// valida o formulário e a rota que gera o PDF.

export const MODELOS_PLACA = ["selos", "escuro", "cor"] as const;
export type ModeloPlaca = (typeof MODELOS_PLACA)[number];

export const esquemaPlaca = z.object({
  modelo: z.enum(MODELOS_PLACA),
  titulo: z.string().trim().min(1).max(60),
  frase: z.string().trim().max(140),
  vantagem: z.string().trim().max(60),
});

export type EscolhaPlaca = z.infer<typeof esquemaPlaca>;
