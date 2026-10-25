import { resolverApoio } from "@/app/(admin)/admin/(protegido)/barbearias/[id]/acoes-apoio";
import { BotaoAcao } from "@/components/admin/financas/botao-acao";
import { Etiqueta } from "@/components/nucleo/etiqueta";
import { dataHora } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import { listarApoio } from "@/lib/repositorios/admin/apoio";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { FormularioApoio } from "./formulario-apoio";

const t = textos.gestao.apoio;

/** Separador «Registo de apoio» da ficha da barbearia (D-160): só a Performa LAB o vê. */
export async function SeparadorApoio({ inquilinoId }: { inquilinoId: string }) {
  const registos = await listarApoio(await criarClienteServidor(), inquilinoId);
  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">{t.ajuda}</p>
      <FormularioApoio inquilinoId={inquilinoId} />
      {registos.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.vazio}</p>
      ) : (
        <ul className="grid gap-3">
          {registos.map((r) => (
            <li key={r.id} className="cartao grid gap-2 rounded-2xl p-4" data-testid="apoio">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{r.assunto}</p>
                <Etiqueta tom={r.estado === "aberto" ? "alerta" : "sucesso"}>
                  {t.estados[r.estado]}
                </Etiqueta>
              </div>
              <p className="text-xs text-muted-foreground">
                {t.tipos[r.tipo]} · {dataHora(r.criado_em)}
              </p>
              {r.texto ? <p className="text-sm whitespace-pre-line">{r.texto}</p> : null}
              <div className="justify-self-start">
                <BotaoAcao
                  rotulo={r.estado === "aberto" ? t.resolver : t.reabrir}
                  acao={resolverApoio.bind(null, inquilinoId, r.id, r.estado === "aberto")}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
