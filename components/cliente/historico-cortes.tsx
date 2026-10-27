import { SeccaoArea } from "@/components/publico/area/listas-area";
import { dataLongaNaLingua } from "@/lib/formatacao/datas";
import type { TextosPublicos } from "@/lib/i18n/publico/forma";
import type { EntradaMeuHistorico } from "@/lib/repositorios/meu-historico";
import { ConsentimentoFotos } from "./consentimento-fotos";

/** «O meu histórico de cortes» na área do cliente (D-179): as entradas que a barbearia partilhou. */
export function HistoricoCortes({
  t,
  lingua,
  inquilinoId,
  entradas,
  autorizado,
}: {
  t: TextosPublicos;
  lingua: string;
  inquilinoId: string;
  entradas: EntradaMeuHistorico[];
  autorizado: boolean;
}) {
  return (
    <SeccaoArea titulo={t.area.historicoCortes} testId="historico-cortes">
      {entradas.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.area.semHistoricoCortes}</p>
      ) : (
        <ul className="grid gap-3">
          {entradas.map((e) => (
            <li key={e.id} className="grid gap-2 text-sm" data-testid="entrada-historico">
              <p className="text-xs text-muted-foreground">
                {dataLongaNaLingua(e.data, lingua)}
                {e.servico ? ` · ${e.servico}` : ""}
                {e.profissional ? (
                  <>
                    {" · "}
                    <span translate="no">{e.profissional}</span>
                  </>
                ) : null}
              </p>
              {e.nota ? <p className="whitespace-pre-line">{e.nota}</p> : null}
              {e.fotoUrls.length ? (
                <div className="grid grid-cols-2 gap-2">
                  {e.fotoUrls.map((url) => (
                    // eslint-disable-next-line @next/next/no-img-element -- URL assinado e temporário do bucket privado
                    <img
                      key={url}
                      src={url}
                      alt=""
                      className="aspect-square w-full rounded-lg border object-cover"
                    />
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      <ConsentimentoFotos
        t={{
          fotos: t.area.fotos,
          fotosSim: t.area.fotosSim,
          fotosAjuda: t.area.fotosAjuda,
          fotosRetirar: t.area.fotosRetirar,
          fotosRetirarTitulo: t.area.fotosRetirarTitulo,
          fotosRetirarTexto: t.area.fotosRetirarTexto,
          fotosDar: t.area.fotosDar,
          fotosErro: t.area.fotosErro,
        }}
        inquilinoId={inquilinoId}
        autorizado={autorizado}
      />
    </SeccaoArea>
  );
}
