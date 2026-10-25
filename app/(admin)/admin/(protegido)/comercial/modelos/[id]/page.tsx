import { exigirSuperAdmin } from "@/lib/admin/contexto";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AcoesModelo } from "@/components/admin/comercial/acoes-modelo";
import { EditorModelo } from "@/components/admin/comercial/editor-modelo";
import { Etiqueta } from "@/components/nucleo/etiqueta";
import { textos } from "@/lib/i18n/pt-PT";
import { obterModelo } from "@/lib/repositorios/comercial/contratos";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.comercial.modelos;
export const metadata = { title: `${t.titulo} · ${textos.comercial.titulo}` };

/** Um modelo (N.8): editar o rascunho com pré-visualização; os outros só se leem. */
export default async function Modelo({ params }: { params: Promise<{ id: string }> }) {
  await exigirSuperAdmin();
  const m = await obterModelo(await criarClienteServidor(), (await params).id);
  if (!m) notFound();
  return (
    <div className="grid gap-5">
      <Link href="/admin/comercial/modelos" className="text-sm text-ligacao underline">
        {t.voltar}
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold">
          {t.tipos[m.tipo]} · {t.versao(m.versao)}
        </h2>
        <Etiqueta tom={m.estado === "aprovado" ? "sucesso" : "neutro"}>
          {t.estados[m.estado]}
        </Etiqueta>
      </div>
      {m.estado !== "arquivado" ? <AcoesModelo id={m.id} estado={m.estado} /> : null}
      <EditorModelo
        id={m.id}
        titulo={m.titulo}
        corpo={m.corpo}
        editavel={m.estado === "rascunho"}
      />
    </div>
  );
}
