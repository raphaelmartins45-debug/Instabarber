import { z } from "zod";

// Metas mensais de cada comercial (D-161). O mesmo esquema valida o formulário e a ação.

const contagem = z.coerce.number().int("meta").min(0, "meta").max(10000, "meta");

export const esquemaMetaComercial = z.object({
  userId: z.string().uuid("meta"),
  mes: z.string().regex(/^\d{4}-\d{2}$/, "meta"),
  leadsNovos: contagem,
  propostas: contagem,
  ganhos: contagem,
});
export type DadosMetaComercial = z.input<typeof esquemaMetaComercial>;
