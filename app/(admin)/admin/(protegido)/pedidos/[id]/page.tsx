import { notFound } from "next/navigation";
import { DecisaoPedido } from "@/components/admin/decisao-pedido";
import { ImagemPedido } from "@/components/admin/imagem-pedido";
import { dataCurta } from "@/lib/formatacao/datas";
import { centimosDeNumeric, formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import type { Periodicidade, Plano } from "@/lib/regras/mensalidade";
import { slugDoNome } from "@/lib/regras/slug";
import { urlTemporario } from "@/lib/repositorios/imagens-adesao";
import { obterPedido } from "@/lib/repositorios/pedidos-adesao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.admin.pedidos;
const c = textos.admin.ficha.campos;
export const metadata = { title: `${t.titulo} · ${textos.marca.nome}` };

type Servico = { nome: string; duracao_min: number; preco: string | number };
type Membro = { nome: string; email: string };

/** Um pedido de adesão: dados, imagens com a verificação (D.8.1) e a decisão (E.1). */
export default async function Pedido({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const bd = await criarClienteServidor();
  const p = await obterPedido(bd, id);
  if (!p) notFound();
  const url = (caminho: string | null) =>
    caminho ? urlTemporario(bd, caminho) : Promise.resolve(null);
  const [logo, capa, ...galeria] = await Promise.all([
    url(p.logo_path),
    url(p.capa_path),
    ...p.galeria_paths.map(url),
  ]);

  const dados: [string, string | null | undefined][] = [
    [c.responsavel, p.responsavel],
    [c.nif, p.nif],
    [c.telefone, p.telefone],
    [c.email, p.email],
    [c.cidade, p.cidade],
    [c.morada, p.morada],
    [textos.adesao.contratacao.emailAcesso, p.email_acesso],
    [c.plano, textos.admin.planos[p.plano as Plano]],
    [c.periodicidade, textos.admin.periodicidades[p.periodicidade as Periodicidade]],
    [t.colunas.profissionais, String(p.profissionais)],
    [t.colunas.mensalidade, formatarDinheiro(centimosDeNumeric(p.mensalidade_calculada))],
    [
      t.colunas.pagamento,
      p.preferencia_pagamento
        ? textos.adesao.contratacao.pagamentos[p.preferencia_pagamento as "mbway"]
        : null,
    ],
    [textos.adesao.servicos.caixa, textos.adesao.servicos.modelos[p.modelo_caixa as "A"]],
    [t.colunas.submetido, dataCurta(p.submetido_em)],
    [textos.adesao.contratacao.observacoes, p.observacoes],
  ];

  return (
    <section className="grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-[22px] font-extrabold">{p.nome}</h1>
        <p className="text-sm text-muted-foreground">{t.estados[p.estado as "pendente"]}</p>
      </div>
      <div className="grid gap-2 rounded-lg border bg-card p-4">
        <h2 className="text-[15px] font-bold text-ligacao">{t.dados}</h2>
        <dl className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
          {dados.map(([rotulo, valor]) => (
            <div key={rotulo} className="flex justify-between gap-3 border-b py-1 last:border-0">
              <dt className="text-muted-foreground">{rotulo}</dt>
              <dd className="text-right">{valor || textos.comum.vazio}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="grid gap-2">
        <h2 className="text-[15px] font-bold text-ligacao">{t.imagens}</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ImagemPedido url={logo ?? null} tipo="logo" rotulo={textos.adesao.identidade.logo} />
          <ImagemPedido url={capa ?? null} tipo="capa" rotulo={textos.adesao.identidade.capa} />
          {galeria.map((g, i) => (
            <ImagemPedido
              key={i}
              url={g ?? null}
              tipo="galeria"
              rotulo={`${textos.adesao.identidade.galeria} ${i + 1}`}
            />
          ))}
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid content-start gap-1 rounded-lg border bg-card p-4 text-sm">
          <h2 className="text-[15px] font-bold text-ligacao">{t.servicos}</h2>
          {(p.servicos as Servico[]).map((s) => (
            <p key={s.nome} className="flex justify-between gap-3">
              <span>
                {s.nome} · {s.duracao_min} min
              </span>
              <span>{formatarDinheiro(centimosDeNumeric(s.preco))}</span>
            </p>
          ))}
        </div>
        <div className="grid content-start gap-1 rounded-lg border bg-card p-4 text-sm">
          <h2 className="text-[15px] font-bold text-ligacao">{t.equipa}</h2>
          {(p.equipa as Membro[]).map((m) => (
            <p key={m.email}>
              {m.nome} · {m.email}
            </p>
          ))}
          <p className="text-xs text-muted-foreground">{t.equipaAjuda}</p>
        </div>
      </div>
      {p.estado === "pendente" ? (
        <DecisaoPedido
          pedidoId={p.id}
          slugSugerido={slugDoNome(p.nome)}
          plano={p.plano as Plano}
          periodicidade={p.periodicidade as Periodicidade}
          profissionais={p.profissionais}
        />
      ) : null}
    </section>
  );
}
