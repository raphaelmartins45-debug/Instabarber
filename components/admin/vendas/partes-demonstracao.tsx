import { ExternalLink } from "lucide-react";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.comercial.demonstracao;

/** A versão da demonstração (D-207): Basic com um barbeiro, ou Pro com três. */
export function VersaoDemonstracao() {
  return (
    <fieldset className="grid gap-2">
      <legend className="rotulo mb-1.5">{t.versao}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {(["basic", "pro"] as const).map((p) => (
          <label
            key={p}
            className="flex cursor-pointer items-start gap-3 rounded-lg border bg-card p-3 has-[:checked]:border-primary"
          >
            <input
              type="radio"
              name="plano"
              value={p}
              defaultChecked={p === "pro"}
              className="mt-1"
            />
            <span className="grid">
              <span className="font-semibold">{t[p]}</span>
              <span className="text-xs text-muted-foreground">{t[`${p}Ajuda`]}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** As ligações para a reunião (D-207): cada vista abre numa janela nova. */
export function LigacoesDemonstracao() {
  const ligacao = (href: string, rotulo: string) => (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className="flex h-11 items-center justify-between gap-2 rounded-lg border bg-card px-4 text-sm font-semibold hover:bg-campo"
    >
      {rotulo}
      <ExternalLink aria-hidden className="size-4 text-muted-foreground" />
    </a>
  );
  return (
    <section className="grid gap-2">
      <h2 className="text-sm font-bold">{t.ligacoes}</h2>
      <p className="text-xs text-muted-foreground">{t.ligacoesAjuda}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {ligacao("/demo", t.inicioDemo)}
        {ligacao("/demo/gestor", t.vistaGestor)}
        {ligacao("/demo/barbeiro", t.vistaBarbeiro)}
        {ligacao("/demo/publica", t.vistaPublica)}
      </div>
    </section>
  );
}
