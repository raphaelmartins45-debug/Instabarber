import "server-only";
import { textos } from "@/lib/i18n/pt-PT";
import { gerarCartaz } from "@/lib/pdf/cartaz";
import { gerarGuiaBarbeiro } from "@/lib/pdf/guia-barbeiro";
import { gerarResumoConta } from "@/lib/pdf/resumo-conta";
import { lerRegimeIva } from "@/lib/regras/mensalidade";
import { precoDaBarbearia } from "@/lib/regras/receita";
import { obterBarbearia } from "@/lib/repositorios/admin/barbearias";
import { listarRecebimentos } from "@/lib/repositorios/admin/pagamentos";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { barbeariaDoDocumento } from "./barbearia";
import { type Ficheiro, pdfGuiaDeArranque } from "./guia";
import { lerLogo } from "./logo";
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
  userId: string,
): Promise<Ficheiro | null> {
  if (tipo === "guia") return pdfGuiaDeArranque(bd, inquilinoId, userId);
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
        }),
      ),
    };
  }
  const logo = await lerLogo(b.logoUrl);
  if (tipo === "barbeiro")
    return {
      nome: t.barbeiro.nomeFicheiro(b.slug),
      conteudo: pdf(gerarGuiaBarbeiro({ barbearia: b.nome, logo, barbeiro: b.enderecos.barbeiro })),
    };
  return {
    nome: t.cartaz.nomeFicheiro(b.slug),
    conteudo: pdf(
      gerarCartaz({
        barbearia: b.nome,
        cor: b.cor,
        logo,
        qr: b.enderecos.marcar,
        endereco: b.enderecos.pagina,
      }),
    ),
  };
}
