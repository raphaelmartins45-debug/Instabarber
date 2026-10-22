import { PaginaDocumentoLegal } from "@/components/nucleo/documento-legal";
import { lerPrestadora } from "@/lib/configuracao/prestadora";
import { textos } from "@/lib/i18n/pt-PT";
import { termos } from "@/lib/i18n/pt-PT/legal/termos";

export const metadata = { title: `${textos.legal.termos} · ${textos.marca.nome}` };
// Lê a identificação da Prestadora das variáveis de ambiente em cada pedido.
export const dynamic = "force-dynamic";

export default function PaginaTermos() {
  return <PaginaDocumentoLegal documento={termos(lerPrestadora())} />;
}
