import Link from "next/link";
import { AcoesModelo, ImportarModelo } from "@/components/admin/comercial/acoes-modelo";
import { Etiqueta } from "@/components/nucleo/etiqueta";
import { Secao } from "@/components/nucleo/secao";
import { dataCurta } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import { listarModelos, type TipoModelo } from "@/lib/repositorios/comercial/contratos";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.comercial;
export const metadata = { title: `${t.modelos.titulo} · ${t.titulo}` };

const TIPOS: TipoModelo[] = ["contrato", "condicoes_proposta"];
const TOM = { rascunho: "neutro", aprovado: "sucesso", arquivado: "neutro" } as const;

/** Modelos de documento (N.8): versões, rascunho editável, aprovado único por tipo. */
export default async function Modelos() {
  const modelos = await listarModelos(await criarClienteServidor());
  return (
    <div className="grid gap-5">
      {TIPOS.map((tipo) => {
        const doTipo = modelos.filter((m) => m.tipo === tipo);
        return (
          <Secao key={tipo} id={`modelos-${tipo}`} titulo={t.modelos.tipos[tipo]!}>
            <div className="grid gap-3">
              {!doTipo.length ? (
                <>
                  <p className="text-sm text-muted-foreground">{t.modelos.vazio}</p>
                  <ImportarModelo tipo={tipo} />
                </>
              ) : null}
              <ul className="grid gap-3">
                {doTipo.map((m) => (
                  <li key={m.id} className="cartao grid gap-3 rounded-2xl p-4" data-testid="modelo">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Link
                        href={`/admin/comercial/modelos/${m.id}`}
                        className="font-semibold text-ligacao underline"
                      >
                        {t.modelos.versao(m.versao)} · {m.titulo}
                      </Link>
                      <Etiqueta tom={TOM[m.estado as keyof typeof TOM] ?? "neutro"}>
                        {t.modelos.estados[m.estado]}
                      </Etiqueta>
                    </div>
                    {m.aprovado_em ? (
                      <p className="text-sm text-muted-foreground">
                        {t.modelos.aprovadoEm(dataCurta(m.aprovado_em))}
                      </p>
                    ) : null}
                    {m.estado !== "arquivado" ? <AcoesModelo id={m.id} estado={m.estado} /> : null}
                  </li>
                ))}
              </ul>
            </div>
          </Secao>
        );
      })}
    </div>
  );
}
