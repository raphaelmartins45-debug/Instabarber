import "server-only";
import { textos } from "@/lib/i18n/pt-PT";
import type { EnderecosBarbearia } from "@/lib/inquilino/encaminhar";
import { gerarGuiaBarbearia } from "@/lib/pdf/guia-barbearia";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { assinaturaDe, barbeariaDoDocumento } from "./barbearia";
import { lerLogo } from "./logo";

export type Ficheiro = { nome: string; conteudo: Buffer };
export type GuiaGerado = Ficheiro & {
  para: string | null;
  barbearia: string;
  responsavel: string;
  enderecos: EnderecosBarbearia;
};

/** O guia de arranque personalizado em PDF (D-181), assinado por quem o gera. */
export async function pdfGuiaDeArranque(
  bd: ClienteBD,
  inquilinoId: string,
  userId: string,
): Promise<GuiaGerado | null> {
  const b = await barbeariaDoDocumento(bd, inquilinoId);
  if (!b) return null;
  const [logo, quem] = await Promise.all([lerLogo(b.logoUrl), assinaturaDe(bd, userId)]);
  const doc = gerarGuiaBarbearia({
    barbearia: b.nome,
    responsavel: b.responsavel,
    logo,
    enderecos: b.enderecos,
    assinatura: { nome: quem.nome, funcao: quem.funcao },
  });
  return {
    nome: textos.documentos.guia.nomeFicheiro(b.slug),
    conteudo: Buffer.from(doc.output("arraybuffer")),
    para: b.dono?.email ?? null,
    barbearia: b.nome,
    responsavel: b.responsavel,
    enderecos: b.enderecos,
  };
}
