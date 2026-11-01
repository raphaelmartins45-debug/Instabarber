import { textos } from "@/lib/i18n/pt-PT";
import type { EscolhaPlaca } from "@/lib/validacao/placa";

// Os textos sugeridos da placa do balcão (D-185), pela configuração da barbearia: com a
// fidelização por selos ligada, a placa empurra para marcar online e acumular selos (e diz o
// prémio, se houver); sem ela, fala das vantagens de marcar online.

const t = textos.documentos.placa.sugestoes;

export function sugestaoPlaca(f: {
  selosAtivos: boolean;
  selosNecessarios: number;
  premio: string | null;
}): EscolhaPlaca {
  if (!f.selosAtivos)
    return {
      modelo: "cor",
      titulo: t.tituloSimples,
      frase: t.fraseSimples,
      vantagem: t.vantagemSimples,
    };
  return {
    modelo: "selos",
    titulo: t.tituloSelos,
    frase: t.fraseSelos,
    vantagem: f.premio ? t.vantagemPremio(f.selosNecessarios, f.premio) : t.vantagemSelos,
  };
}
