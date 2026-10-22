import { Campo } from "@/components/nucleo/campo";
import { Secao } from "@/components/nucleo/secao";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.admin.design;

const AMOSTRAS: { id: string; classe: string }[] = [
  { id: "fundo", classe: "bg-background" },
  { id: "cartao", classe: "bg-card" },
  { id: "elevado", classe: "bg-elevado" },
  { id: "destaque", classe: "bg-destaque" },
  { id: "sucesso", classe: "bg-sucesso" },
  { id: "alerta", classe: "bg-alerta" },
  { id: "perda", classe: "bg-destructive" },
  { id: "info", classe: "bg-info" },
];

const VARIANTES = ["default", "secondary", "outline", "ghost", "destructive", "link"] as const;

/** Cores, botões e campos do catálogo. */
export function BlocoBase() {
  return (
    <>
      <Secao id="design-cores" titulo={t.cores}>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {AMOSTRAS.map((a) => (
            <li key={a.id} className="grid gap-2">
              <span className={`h-14 rounded-xl border border-border ${a.classe}`} />
              <span className="rotulo">{t.amostras[a.id]}</span>
            </li>
          ))}
        </ul>
      </Secao>
      <Secao id="design-botoes" titulo={t.botoes}>
        <div className="cartao flex flex-wrap items-center gap-3 rounded-2xl p-5">
          {VARIANTES.map((v) => (
            <Button key={v} variant={v}>
              {t.variantes[v]}
            </Button>
          ))}
          <Button disabled>{t.desativado}</Button>
          <Button size="sm">{t.variantes.default}</Button>
          <Button size="lg">{t.variantes.default}</Button>
        </div>
      </Secao>
      <Secao id="design-campos" titulo={t.campos}>
        <div className="cartao grid gap-4 rounded-2xl p-5 md:grid-cols-2">
          <Campo id="design-nome" rotulo={t.nome} placeholder={t.nomeExemplo} ajuda={t.nomeAjuda} />
          <Campo id="design-preco" rotulo={t.preco} inputMode="decimal" erro={t.precoErro} />
        </div>
      </Secao>
    </>
  );
}
