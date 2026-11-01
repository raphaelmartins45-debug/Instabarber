import "server-only";
import { textos } from "@/lib/i18n/pt-PT";
import { gerarGuiaBarbeiro } from "@/lib/pdf/guia-barbeiro";
import { gerarResumoConta } from "@/lib/pdf/resumo-conta";
import { lerRegimeIva } from "@/lib/regras/mensalidade";
import { precoDaBarbearia } from "@/lib/regras/receita";
import { obterBarbearia } from "@/lib/repositorios/admin/barbearias";
import { listarRecebimentos } from "@/lib/repositorios/admin/pagamentos";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { assinaturaDoApoio, barbeariaDoDocumento } from "./barbearia";
import { type Ficheiro, pdfGuiaDeArranque } from "./guia";
import { lerLogo } from "./logo";
import { pdfPlaca } from "./placa";
import type { TipoDocumento } from "./tipos";

// Os documentos personalizados de uma barbearia no Gerador de documentos (D-181).

export { TIPOS_DOCUMENTO, type TipoDocumento } from "./tipos";

const t = textos.documentos;
const pdf = (d: { output: (tipo: "arraybuffer") => ArrayBuffer }) =>
  Buffer.from(d.output("arraybuffer"));

export async function documentoDaBarbearia(
  bd: ClienteBD,
  inquilinoId: string,
  tipo: TipoDocumento,
): Promise<Ficheiro | null> {
  if (tipo === "guia") return pdfGuiaDeArranque(bd, inquilinoId);
  const b = await barbeariaDoDocumento(bd, inquilinoId);
  if (!b) return null;
  if (tipo === "resumo") {
    const [linha, recebimentos] = await Promise.all([
      obterBarbearia(bd, inquilinoId),
      listarRecebimentos(bd, { inquilinoId }),
    ]);
    if (!linha) return null;
    const preco = precoDaBarbearia(linha, lerRegimeIva(process.env.PRESTADORA_REGIME_IVA));
    return {
      nome: t.resumo.nomeFicheiro(b.slug),
      conteudo: pdf(
        gerarResumoConta({
          barbearia: b.nome,
          plano: linha.plano,
          periodicidade: linha.periodicidade,
          profissionais: linha.profissionais_contratados,
          dominioProprio: !!linha.dominio_proprio,
          descontoPct: Number(linha.desconto_mensalidade_pct ?? 0),
          valorCent: preco.comIva,
          estado: linha.estado,
          estadoPagamento: linha.estado_pagamento,
          proximoVencimento: linha.proximo_vencimento,
          recebimentos: recebimentos.slice(0, 12).map((r) => ({
            data: r.data,
            metodo: r.metodo,
            valorCent: r.valor_centimos,
          })),
          assinatura: assinaturaDoApoio(),
        }),
      ),
    };
  }
  const logo = await lerLogo(b.logoUrl);
  if (tipo === "barbeiro")
    return {
      nome: t.barbeiro.nomeFicheiro(b.slug),
      conteudo: pdf(
        gerarGuiaBarbeiro({
          barbearia: b.nome,
          logo,
          barbeiro: b.enderecos.barbeiro,
          assinatura: assinaturaDoApoio(),
        }),
      ),
    };
  // O cartaz do balcão é a placa do gestor com os textos sugeridos (D-185).
  const placa = await pdfPlaca(bd, inquilinoId);
  return { nome: t.cartaz.nomeFicheiro(b.slug), conteudo: placa.conteudo };
}
