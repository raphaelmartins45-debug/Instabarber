import { ChevronDown } from "lucide-react";
import { textos } from "@/lib/i18n/pt-PT";
import { AcoesTexto } from "./acoes-texto";

const t = textos.vendas.objecoes;

/**
 * Respostas às objeções (D-181): um acordeão em que abre uma de cada vez (`name` comum), com a
 * seta a rodar e a resposta pronta a copiar ou a abrir no WhatsApp.
 */
export function Objecoes() {
  return (
    <ul className="grid gap-2" data-testid="objecoes">
      {t.lista.map((o) => (
        <li key={o.id}>
          <details
            name="objecoes"
            className="group rounded-xl border transition-colors duration-150 open:border-destaque/45 open:bg-destaque/4"
          >
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 font-semibold [&::-webkit-details-marker]:hidden">
              <span className="min-w-0">{o.objecao}</span>
              <ChevronDown
                aria-hidden
                className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-sistema group-open:rotate-180 motion-reduce:transition-none"
              />
            </summary>
            <div className="grid gap-3 px-4 pb-4">
              <p className="text-sm">{o.resposta}</p>
              <AcoesTexto texto={o.resposta} />
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
