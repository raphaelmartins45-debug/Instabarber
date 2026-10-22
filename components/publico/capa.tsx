import { formatarTelefone } from "@/lib/formatacao/telefone";
import type { Lingua, TextosPublicos } from "@/lib/i18n/publico";
import { corDoTexto } from "@/lib/regras/contraste";
import { BotaoAcao } from "./botao-acao";
import { EscolhaEntrar } from "./escolha-entrar";
import { LogoCapa } from "./logo-capa";

export type DadosCapa = {
  nome: string;
  cidade: string | null;
  morada: string | null;
  cor: string;
  logo: string | null;
  aberta: boolean;
  marcar: string;
  whatsapp: string | null;
  telefone: string | null;
  estado: string;
  entradas: { cliente: string; equipa: string };
};

/**
 * A capa é o cabeçalho (E.6): nome e morada, «Entrar», as três ações e o estado do momento.
 * No computador, duas colunas com o logótipo à direita; no telemóvel, o logótipo sobe.
 */
export function Capa({ d, t }: { d: DadosCapa; t: TextosPublicos }) {
  const texto = corDoTexto(d.cor);
  return (
    <header id="capa" style={{ backgroundColor: d.cor, color: texto }} className="px-4 pt-5 pb-10">
      <div className="mx-auto grid max-w-5xl gap-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-extrabold">{d.nome}</p>
            {d.morada || d.cidade ? (
              <p className="text-sm opacity-80">
                {[d.morada, d.cidade].filter(Boolean).join(" · ")}
              </p>
            ) : null}
          </div>
          <EscolhaEntrar lingua={t.lingua as Lingua} entradas={d.entradas} cor={texto} />
        </div>
        <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div className="order-2 grid gap-3 md:order-1 md:max-w-md">
            {d.cidade ? (
              <span className="justify-self-start rounded-full border border-current/30 px-3 py-1 text-[11px] font-bold tracking-wider uppercase">
                {t.capa.barbeariaEm(d.cidade)}
              </span>
            ) : null}
            {d.aberta ? (
              <BotaoAcao
                href={d.marcar}
                titulo={t.capa.marcar}
                linha={t.capa.marcarAjuda}
                variante="principal"
                cor={texto}
                corTexto={d.cor}
                testId="acao-marcar"
              />
            ) : (
              <p
                className="rounded-xl border border-current/30 px-5 py-4 font-bold"
                data-testid="marcacoes-indisponiveis"
              >
                {t.capa.indisponivel}
              </p>
            )}
            {d.whatsapp ? (
              <BotaoAcao
                href={d.whatsapp}
                titulo={t.capa.falar}
                linha={t.capa.falarAjuda}
                variante="verde"
              />
            ) : null}
            {d.telefone ? (
              <BotaoAcao
                href={`tel:${d.telefone}`}
                titulo={t.capa.ligar}
                linha={formatarTelefone(d.telefone)}
                variante="discreto"
              />
            ) : null}
            <p className="flex items-center gap-2 text-sm font-semibold">
              <span aria-hidden className="size-2 rounded-full bg-current" />
              {d.estado}
            </p>
          </div>
          <div className="order-1 justify-self-center md:order-2">
            <LogoCapa nome={d.nome} cidade={d.cidade} logo={d.logo} cor={d.cor} texto={texto} />
          </div>
        </div>
      </div>
    </header>
  );
}
