import { Acoes, corDoCabecalho, Entrar, Info, Logo, Nome, type PropsCapa } from "./partes";

// Cabeçalhos de uma só faixa na cor da marca (D-200): centrado, dividido e faixa.

const caixa = "mx-auto w-full max-w-6xl px-4 md:px-8";

/** Logótipo ao centro, o nome por baixo e as ações em linha. */
export function CabecalhoCentrado({ d, t, c }: PropsCapa) {
  return (
    <header id="capa" data-fundo-logo style={corDoCabecalho(c)}>
      <div className={`${caixa} grid justify-items-center gap-6 pt-3 pb-12 text-center md:pb-16`}>
        <Entrar d={d} t={t} className="justify-self-end" />
        <Logo d={d} className="max-h-36 md:max-h-44" />
        <div className="grid justify-items-center gap-3">
          <Nome d={d} />
          <Info d={d} className="justify-items-center" />
        </div>
        <Acoes d={d} t={t} centro className="w-full max-w-xl" />
      </div>
    </header>
  );
}

/** O logótipo à esquerda; o nome, as informações e as ações à direita. */
export function CabecalhoDividido({ d, t, c }: PropsCapa) {
  return (
    <header id="capa" data-fundo-logo style={corDoCabecalho(c)}>
      <div className={`${caixa} grid gap-6 pt-3 pb-10 md:pb-14`}>
        <Entrar d={d} t={t} className="justify-self-end" />
        <div className="grid items-center gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-14">
          {d.logo ? (
            <div className="flex justify-center md:justify-start">
              <Logo d={d} className="max-h-40 md:max-h-64" />
            </div>
          ) : null}
          <div className="grid gap-5">
            <div className="grid gap-3">
              <Nome d={d} />
              <Info d={d} />
            </div>
            <Acoes d={d} t={t} />
          </div>
        </div>
      </div>
    </header>
  );
}

/** O nome em maior, à esquerda, como num cartaz; o logótipo à direita. */
export function CabecalhoFaixa({ d, t, c }: PropsCapa) {
  return (
    <header id="capa" data-fundo-logo style={corDoCabecalho(c)}>
      <div className={`${caixa} grid gap-6 pt-3 pb-10 md:pb-14`}>
        <Entrar d={d} t={t} className="justify-self-end" />
        <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:gap-14">
          <div className="grid gap-6">
            <div className="grid gap-4">
              <Nome d={d} className="text-5xl md:text-7xl" />
              <Info d={d} />
            </div>
            <Acoes d={d} t={t} />
          </div>
          {d.logo ? (
            <div className="row-start-1 flex justify-center md:col-start-2">
              <Logo d={d} className="max-h-36 md:max-h-72" />
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
