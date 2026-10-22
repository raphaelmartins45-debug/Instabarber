import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Barras } from "@/components/publico/barras";
import { BlocoEquipa, BlocoLoja, BlocoPromocoes, BlocoServicos } from "@/components/publico/blocos";
import {
  BlocoContactos,
  BlocoHistoria,
  BlocoHorario,
  BlocoMapa,
} from "@/components/publico/blocos-info";
import { Capa } from "@/components/publico/capa";
import { Rodape } from "@/components/publico/rodape";
import { numericDeCentimos } from "@/lib/formatacao/dinheiro";
import { lerEndereco, origemDoPedido, origemPrincipal } from "@/lib/inquilino/endereco";
import { enderecoIcone } from "@/lib/inquilino/icones";
import { obterBarbeariaDoEndereco } from "@/lib/publico/barbearia";
import { dadosHairSalon } from "@/lib/publico/dados-estruturados";
import { textosDaPagina } from "@/lib/publico/lingua";
import { corDoTexto } from "@/lib/regras/contraste";
import { estaAberta } from "@/lib/regras/horario";
import { ligacaoWhatsApp } from "@/lib/regras/whatsapp";
import {
  listarEquipaPublica,
  listarProdutosPublicos,
  listarPromocoesPublicas,
  listarServicosPublicos,
} from "@/lib/repositorios/barbearias-publicas";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { textos } from "@/lib/i18n/pt-PT";

const hm = (h: string | null) => (h ?? "").slice(0, 5);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const b = await obterBarbeariaDoEndereco((await params).slug);
  if (!b?.id || !b.slug) return { title: textos.paineis.publico.naoEncontrada };
  const servicos = await listarServicosPublicos(await criarClienteServidor(), b.id);
  const titulo = b.cidade ? `${b.nome} · ${b.cidade}` : (b.nome ?? "");
  return {
    title: titulo,
    description:
      b.descricao ??
      servicos
        .slice(0, 4)
        .map((s) => s.nome)
        .join(", "),
    icons: {
      icon: [{ url: enderecoIcone(b.slug, 32, b.logo_url), sizes: "32x32", type: "image/png" }],
      apple: [{ url: enderecoIcone(b.slug, 180, b.logo_url) }],
    },
    manifest: `/api/manifesto/${b.slug}`,
    appleWebApp: { title: b.nome ?? undefined },
  };
}

/** Página pública (E.6): a porta de entrada do cliente, do gestor e do barbeiro. */
export default async function PaginaBarbearia({ params }: { params: Promise<{ slug: string }> }) {
  const b = await obterBarbeariaDoEndereco((await params).slug);
  if (!b?.id || !b.slug || !b.nome) notFound();
  const bd = await criarClienteServidor();
  const [{ lingua, t }, { base }, servicos, equipa, produtos, promocoes, principal, origem] =
    await Promise.all([
      textosDaPagina(!!b.multilinguagem_ativa),
      lerEndereco(),
      listarServicosPublicos(bd, b.id),
      listarEquipaPublica(bd, b.id),
      listarProdutosPublicos(bd, b.id),
      listarPromocoesPublicas(bd, b.id),
      origemPrincipal(),
      origemDoPedido(),
    ]);
  const cor = b.capa_cor ?? "#12100E";
  const aberta = estaAberta({
    hora_abertura: b.hora_abertura ?? "00:00",
    hora_fecho: b.hora_fecho ?? "00:00",
    dias_descanso: b.dias_descanso ?? [],
    aberto: true,
  });
  const estado = aberta ? t.capa.aberto(hm(b.hora_fecho)) : t.capa.fechado;
  const marcar = b.aberto ? `${base}/marcar` : null;
  const whatsapp = b.whatsapp ? ligacaoWhatsApp(b.whatsapp, "") : null;
  const entradas = { cliente: `${base}/entrar`, equipa: base ? "/entrar" : "/app/entrar" };
  const nomeServico = (s: (typeof servicos)[number]) =>
    (lingua === "en" ? s.nome_en : lingua === "fr" ? s.nome_fr : null) || s.nome || "";
  const descricaoServico = (s: (typeof servicos)[number]) =>
    (lingua === "en" ? s.descricao_en : lingua === "fr" ? s.descricao_fr : null) || s.descricao;
  const redes = [
    b.instagram
      ? {
          rotulo: "Instagram",
          url: b.instagram.startsWith("http")
            ? b.instagram
            : `https://instagram.com/${b.instagram.replace(/^@/, "")}`,
        }
      : null,
    b.facebook
      ? {
          rotulo: "Facebook",
          url: b.facebook.startsWith("http") ? b.facebook : `https://facebook.com/${b.facebook}`,
        }
      : null,
    b.tiktok
      ? {
          rotulo: "TikTok",
          url: b.tiktok.startsWith("http")
            ? b.tiktok
            : `https://tiktok.com/@${b.tiktok.replace(/^@/, "")}`,
        }
      : null,
  ].filter((r) => r !== null);
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
    <div lang={lingua}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(json).replace(/</g, "\\u003c") }}
      />
      <Capa
        t={t}
        d={{
          nome: b.nome,
          cidade: b.cidade,
          morada: b.morada,
          cor,
          logo: b.logo_url,
          aberta: !!b.aberto,
          marcar: marcar ?? "",
          whatsapp,
          telefone: b.telefone,
          estado,
          entradas,
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
        entrar={entradas.cliente}
      />
      <main className="mx-auto max-w-5xl divide-y px-4">
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
        <BlocoLoja t={t} produtos={produtos} />
        <BlocoContactos t={t} whatsapp={whatsapp} telefone={b.telefone} redes={redes} />
      </main>
      <Rodape
        t={t}
        lingua={lingua}
        multilinguagem={!!b.multilinguagem_ativa}
        origemPrincipal={principal}
        reclamacoes={b.livro_reclamacoes_url}
        avaliacao={b.google_avaliacao_url}
        entradas={entradas}
      />
    </div>
  );
}
