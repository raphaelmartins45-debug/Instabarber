import { cn } from "@/lib/utils";
import { Acoes, corDoCabecalho, Entrar, Info, Logo, Nome, type PropsCapa } from "./partes";

// Cabeçalhos dos modelos de D-204: «destaque» (Produto) e «loja» (Pedido).

const caixa = "mx-auto w-full max-w-6xl px-4 md:px-8";

/** O nome enorme ao centro, muito espaço à volta e as ações em cápsula (modelo Produto). */
export function CabecalhoDestaque({ d, t, c }: PropsCapa) {
  return (
    <header id="capa" style={corDoCabecalho(c)}>
      <div className={`${caixa} grid justify-items-center gap-7 pt-3 pb-16 text-center md:pb-28`}>
        <Entrar d={d} t={t} className="justify-self-end" />
        <Logo d={d} className="max-h-16 md:max-h-20" />
        <div className="grid justify-items-center gap-4">
          <Nome d={d} className="text-5xl tracking-tight md:text-8xl" />
          <Info d={d} className="justify-items-center text-base" />
        </div>
        <Acoes d={d} t={t} centro className="w-full max-w-xl" />
      </div>
    </header>
  );
}

/**
 * Uma faixa curta na cor da barbearia e, por cima, o cartão da «loja»: logótipo, nome, estado,
 * ações e os separadores para saltar para cada parte da página (modelo Pedido).
 */
export function CabecalhoLoja({ d, t, c }: PropsCapa) {
  const separadores = [
    ["servicos", t.blocos.servicos],
    ["equipa", t.blocos.barbeiros],
    ["horario", t.blocos.horario],
    ["onde", t.blocos.ondeEstamos],
    ["contactos", t.blocos.contactos],
  ] as const;
  return (
    <header id="capa">
      <div style={corDoCabecalho(c)}>
        <div className={`${caixa} flex justify-end pt-3 pb-20 md:pb-24`}>
          <Entrar d={d} t={t} />
        </div>
      </div>
      <div className={`${caixa} -mt-16`}>
        <div className="cartao-modelo grid gap-5 rounded-[var(--raio)] border bg-card p-5 text-card-foreground md:p-6">
          <div className="grid gap-5 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
            {d.logo ? (
              <div
                className="grid size-20 place-items-center overflow-hidden rounded-[var(--raio)] border p-2 md:size-24"
                style={{ backgroundColor: d.cor }}
              >
                <Logo d={d} />
              </div>
            ) : null}
            <div className="grid gap-2">
              <Nome d={d} className="text-3xl md:text-4xl" />
              <Info d={d} className="text-muted-foreground" />
            </div>
            <Acoes d={d} t={t} tom="corpo" />
          </div>
          <nav
            aria-label={t.capa.secoes}
            className="-mx-5 flex gap-2 overflow-x-auto border-t px-5 pt-4 md:mx-0 md:px-0"
          >
            {separadores.map(([id, rotulo], i) => (
              <a
                key={id}
                href={`#${id}`}
                className={cn(
                  "inline-flex h-10 shrink-0 items-center rounded-[var(--raio-botao)] px-4 text-sm font-semibold transition-colors",
                  i === 0 ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-campo",
                )}
              >
                {rotulo}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
