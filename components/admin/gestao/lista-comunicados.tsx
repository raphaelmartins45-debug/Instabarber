import { apagar, terminar } from "@/app/(admin)/admin/(protegido)/comunicados/acoes";
import { BotaoAcao } from "@/components/admin/financas/botao-acao";
import { Etiqueta } from "@/components/nucleo/etiqueta";
import { alvosDoComunicado, estadoComunicado } from "@/lib/admin/comunicados";
import { dataCurta } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import type { Comunicado } from "@/lib/repositorios/admin/comunicados";
import { AvisoWhatsapp } from "./aviso-whatsapp";

const t = textos.gestao.comunicados;
const TOM = { agendado: "info", ativo: "sucesso", terminado: "neutro" } as const;

type Barbearia = {
  id: string;
  nome: string;
  plano: string;
  estado: string;
  whatsapp: string | null;
};

/** Os comunicados publicados, com quantas barbearias leram e o aviso por WhatsApp (D-160). */
export function ListaComunicados({
  comunicados,
  barbearias,
  agora,
}: {
  comunicados: Comunicado[];
  barbearias: Barbearia[];
  agora: Date;
}) {
  if (comunicados.length === 0) return <p className="text-sm text-muted-foreground">{t.vazio}</p>;
  const nomes = new Map(barbearias.map((b) => [b.id, b.nome]));
  const para = (c: Comunicado) =>
    c.destino === "plano"
      ? `${t.destinos.plano}: ${textos.admin.planos[c.plano as "pro"]}`
      : c.destino === "barbearia"
        ? (nomes.get(c.inquilinoId ?? "") ?? t.destinos.barbearia)
        : t.destinos.todas;
  return (
    <ul className="grid gap-3">
      {comunicados.map((c) => {
        const estado = estadoComunicado(c, agora);
        const alvos = alvosDoComunicado(c, barbearias);
        const lidas = alvos.filter((b) => c.lidas.includes(b.id));
        // O último dia mostrado é o anterior ao fim gravado (o fim é a meia-noite seguinte).
        const ultimo = c.fim ? dataCurta(new Date(new Date(c.fim).getTime() - 1)) : null;
        return (
          <li key={c.id} className="cartao grid gap-2 rounded-2xl p-4" data-testid="comunicado">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">{c.titulo}</p>
              <Etiqueta tom={TOM[estado]}>{t.estados[estado]}</Etiqueta>
            </div>
            <p className="text-sm whitespace-pre-line">{c.texto}</p>
            <p className="text-xs text-muted-foreground">
              {t.para(para(c))} · {t.periodo(dataCurta(c.inicio), ultimo)}
            </p>
            <p className="text-sm font-semibold">{t.leituras(lidas.length, alvos.length)}</p>
            {estado === "ativo" ? (
              <AvisoWhatsapp
                titulo={c.titulo}
                porLer={alvos.filter((b) => !c.lidas.includes(b.id))}
              />
            ) : null}
            <div className="flex flex-wrap gap-2">
              {estado === "ativo" ? (
                <BotaoAcao rotulo={t.terminar} acao={terminar.bind(null, c.id)} />
              ) : null}
              <BotaoAcao
                rotulo={t.apagar}
                variante="ghost"
                acao={apagar.bind(null, c.id)}
                confirmar={t.confirmarApagar}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
