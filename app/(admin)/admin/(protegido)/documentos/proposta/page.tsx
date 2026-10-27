import Link from "next/link";
import { FormularioPropostaRapida } from "@/components/admin/documentos/formulario-proposta-rapida";
import { exigirEquipaPlataforma } from "@/lib/admin/contexto";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.documentos.rapida;
export const metadata = { title: `${t.titulo} · ${textos.marca.nome}` };

/** Proposta para um lead novo (D-181): o lead, o briefing essencial e a proposta, de uma vez. */
export default async function PropostaRapida() {
  await exigirEquipaPlataforma();
  return (
    <section className="grid max-w-3xl gap-5">
      <Link href="/admin/documentos" className="text-sm text-ligacao underline">
        {t.voltar}
      </Link>
      <header className="grid gap-1">
        <h1 className="text-[22px] font-extrabold tracking-tight">{t.titulo}</h1>
        <p className="text-sm text-muted-foreground">{t.ajuda}</p>
      </header>
      <FormularioPropostaRapida />
    </section>
  );
}
