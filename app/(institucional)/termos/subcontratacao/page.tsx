import { PaginaDocumentoLegal } from "@/components/nucleo/documento-legal";
import { lerPrestadora } from "@/lib/configuracao/prestadora";
import { textos } from "@/lib/i18n/pt-PT";
import { subcontratacao } from "@/lib/i18n/pt-PT/legal/subcontratacao";

export const metadata = { title: `${textos.legal.subcontratacao} · ${textos.marca.nome}` };
// Lê a identificação da Prestadora das variáveis de ambiente em cada pedido.
export const dynamic = "force-dynamic";

export default function PaginaSubcontratacao() {
  return <PaginaDocumentoLegal documento={subcontratacao(lerPrestadora())} />;
}
