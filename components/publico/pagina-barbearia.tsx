import { Barras } from "@/components/publico/barras";
import { BlocoEquipa, BlocoPromocoes, BlocoServicos } from "@/components/publico/blocos";
import { BlocosReceita } from "@/components/publico/blocos-receita";
import {
  BlocoContactos,
  BlocoHistoria,
  BlocoHorario,
  BlocoMapa,
} from "@/components/publico/blocos-info";
import { CapaDoModelo } from "@/components/publico/capas";
import { PaginaModelo } from "@/components/publico/pagina-modelo";
import { Rodape } from "@/components/publico/rodape";
import { formatarDinheiro, numericDeCentimos } from "@/lib/formatacao/dinheiro";
import { lerEndereco, origemDoPedido, origemPrincipal } from "@/lib/inquilino/endereco";
import { obterBarbeariaDoEndereco } from "@/lib/publico/barbearia";
import { coresDaCapa } from "@/lib/publico/cores-capa";
import { estiloDe, type Estilo } from "@/lib/publico/estilos";
import { proximaVaga } from "@/lib/publico/proxima-vaga";
import { dadosHairSalon } from "@/lib/publico/dados-estruturados";
import { textosDaPagina } from "@/lib/publico/lingua";
import { redesSociais } from "@/lib/publico/redes";
import { corDoTexto } from "@/lib/regras/contraste";
import { estaAberta } from "@/lib/regras/horario";
import { ligacaoWhatsApp } from "@/lib/regras/whatsapp";
import {
  listarEquipaPublica,
  listarPromocoesPublicas,
  listarServicosPublicos,
} from "@/lib/repositorios/barbearias-publicas";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const hm = (h: string | null) => (h ?? "").slice(0, 5);

export type BarbeariaPublica = NonNullable<Awaited<ReturnType<typeof obterBarbeariaDoEndereco>>>;

/**
 * A página pública da barbearia (E.6, D-198): a mesma para o público e para a pré-visualização da
 * Gestão do sistema, onde `sobrepor` mostra um modelo e uma cor ainda por guardar.
 */
export async function PaginaPublica({
  b,
  sobrepor,
}: {
  b: BarbeariaPublica & { id: string; nome: string };
  sobrepor?: { estilo?: Estilo; cor?: string };
}) {
  const bd = await criarClienteServidor();
  const [{ lingua, t }, { base }, servicos, equipa, promocoes, principal, origem] =
    await Promise.all([
      textosDaPagina(!!b.multilinguagem_ativa),
      lerEndereco(),
      listarServicosPublicos(bd, b.id),
      listarEquipaPublica(bd, b.id),
      listarPromocoesPublicas(bd, b.id),
      origemPrincipal(),
      origemDoPedido(),
    ]);
  const cor = sobrepor?.cor ?? b.capa_cor ?? "#12100E";
  const aberta = estaAberta({
    hora_abertura: b.hora_abertura ?? "00:00",
    hora_fecho: b.hora_fecho ?? "00:00",
    dias_descanso: b.dias_descanso ?? [],
    aberto: true,
  });
  const estado = aberta ? t.capa.aberto(hm(b.hora_fecho)) : t.capa.fechado;
  const marcar = b.aberto ? `${base}/marcar` : null;
  const whatsapp = b.whatsapp ? ligacaoWhatsApp(b.whatsapp, "") : null;
  const entrar = `${base}/cliente`;
  const estilo = sobrepor?.estilo ?? estiloDe(b.estilo_pagina);
  // A próxima vaga do serviço principal (D-198): só com a marcação online aberta.
  const vaga = marcar && servicos[0]?.id ? await proximaVaga(bd, b.id, servicos[0].id, t) : null;
  const nomeServico = (s: (typeof servicos)[number]) =>
    (lingua === "en" ? s.nome_en : lingua === "fr" ? s.nome_fr : null) || s.nome || "";
  const descricaoServico = (s: (typeof servicos)[number]) =>
    (lingua === "en" ? s.descricao_en : lingua === "fr" ? s.descricao_fr : null) || s.descricao;
  const redes = redesSociais(b);
  const json = dadosHairSalon({
    nome: b.nome,
    url: `${origem}${base || "/"}`,
    descricao: b.descricao,
    morada: b.morada,
    codigoPostal: b.codigo_postal,
    cidade: b.cidade,
    telefone: b.telefone,
    logo: b.logo_url,
    abertura: hm(b.hora_abertura),
    fecho: hm(b.hora_fecho),
    descanso: b.dias_descanso ?? [],
    servicos: servicos.map((s) => ({
      nome: s.nome ?? "",
      precoEuros: numericDeCentimos(s.preco_centimos),
    })),
  });

  return (
    <PaginaModelo lingua={lingua} estilo={estilo} cor={cor}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(json).replace(/</g, "\\u003c") }}
      />
      <CapaDoModelo
        t={t}
        d={{
          nome: b.nome,
          cidade: b.cidade,
          morada: b.morada,
          cor,
          logo: b.logo_url,
          logoFundo: b.logo_fundo,
          foto: b.capa_foto_url,
          estilo,
          vaga,
          aberta: !!b.aberto,
          marcar: marcar ?? "",
          whatsapp,
          telefone: b.telefone,
          estado,
          entrar,
          servicos: servicos.map((s) => ({
            id: s.id ?? "",
            nome: nomeServico(s),
            preco: formatarDinheiro(s.preco_centimos),
            duracao: t.blocos.minutos(s.duracao_min ?? 0),
          })),
        }}
      />
      <Barras
        lingua={lingua}
        nome={b.nome}
        logo={b.logo_url}
        cor={cor}
        corTexto={corDoTexto(cor)}
        marcar={marcar}
        whatsapp={whatsapp}
        telefone={b.telefone}
        entrar={entrar}
      />
      <main className="mx-auto max-w-6xl px-4 md:px-8">
        <BlocoServicos
          t={t}
          marcar={marcar}
          servicos={servicos.map((s) => ({
            id: s.id ?? "",
            nome: nomeServico(s),
            descricao: descricaoServico(s),
            duracao: s.duracao_min ?? 0,
            precoCent: s.preco_centimos,
          }))}
        />
        <BlocoPromocoes t={t} promocoes={promocoes} />
        <BlocoEquipa t={t} equipa={equipa} />
        <BlocoHistoria t={t} historia={b.historia} />
        {/* Onde e quando, lado a lado no computador (D-198). */}
        <div className="grid md:grid-cols-2 md:gap-x-16">
          <BlocoMapa
            t={t}
            morada={[b.morada, b.codigo_postal, b.cidade].filter(Boolean).join(", ") || null}
            mapa={b.google_maps_url}
          />
          <BlocoHorario
            t={t}
            abertura={hm(b.hora_abertura)}
            fecho={hm(b.hora_fecho)}
            descanso={b.dias_descanso ?? []}
            almoco={
              b.intervalo_almoco_inicio && b.intervalo_almoco_fim
                ? [hm(b.intervalo_almoco_inicio), hm(b.intervalo_almoco_fim)]
                : null
            }
            estado={estado}
          />
        </div>
        <BlocosReceita t={t} inquilinoId={b.id} encomendar={`${base}/loja`} />
        <BlocoContactos t={t} whatsapp={whatsapp} telefone={b.telefone} redes={redes} />
      </main>
      <Rodape
        t={t}
        lingua={lingua}
        multilinguagem={!!b.multilinguagem_ativa}
        origemPrincipal={principal}
        reclamacoes={b.livro_reclamacoes_url}
        avaliacao={b.google_avaliacao_url}
        entrar={entrar}
        nome={b.nome}
        estilo={estilo}
        cores={coresDaCapa(cor, b.logo_fundo)}
      />
    </PaginaModelo>
  );
}
