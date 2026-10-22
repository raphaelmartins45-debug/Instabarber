import { PaginaDocumentoLegal } from "@/components/nucleo/documento-legal";
import { lerPrestadora } from "@/lib/configuracao/prestadora";
import { textos } from "@/lib/i18n/pt-PT";
import { privacidade } from "@/lib/i18n/pt-PT/legal/privacidade";

export const metadata = { title: `${textos.legal.privacidade} · ${textos.marca.nome}` };
// Lê a identificação da Prestadora das variáveis de ambiente em cada pedido.
export const dynamic = "force-dynamic";

export default function PaginaPrivacidade() {
  return <PaginaDocumentoLegal documento={privacidade(lerPrestadora())} />;
}
