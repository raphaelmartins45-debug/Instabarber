import { textos } from "@/lib/i18n/pt-PT";
import { AcoesTexto } from "./acoes-texto";

const t = textos.vendas.objecoes;

/** Respostas às objeções (D-181): abrem uma a uma, com a resposta pronta a copiar. */
export function Objecoes() {
  return (
    <div className="grid gap-3" data-testid="objecoes">
      <p className="text-sm text-muted-foreground">{t.ajuda}</p>
      <ul className="grid gap-2">
        {t.lista.map((o) => (
          <li key={o.id}>
            <details className="group rounded-xl border p-3">
              <summary className="flex min-h-8 cursor-pointer items-center font-semibold">
                {o.objecao}
              </summary>
              <div className="mt-2 grid gap-3">
                <p className="text-sm">{o.resposta}</p>
                <AcoesTexto texto={o.resposta} />
              </div>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
