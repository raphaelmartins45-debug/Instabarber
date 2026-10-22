import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CartaoSelos } from "@/components/publico/area/cartao-selos";
import { ListasArea, SeccaoArea } from "@/components/publico/area/listas-area";
import { ProximaMarcacao } from "@/components/publico/area/proxima-marcacao";
import { MolduraCliente } from "@/components/publico/moldura-cliente";
import { SeletorLingua } from "@/components/publico/seletor-lingua";
import { BotaoSair } from "@/components/nucleo/botao-sair";
import { Button } from "@/components/ui/button";
import { hojeIso } from "@/lib/formatacao/datas";
import { lerEndereco } from "@/lib/inquilino/endereco";
import { obterBarbeariaDoEndereco } from "@/lib/publico/barbearia";
import { textosDaPagina } from "@/lib/publico/lingua";
import { corDoTexto } from "@/lib/regras/contraste";
import { ligacaoWhatsApp } from "@/lib/regras/whatsapp";
import {
  funcionalidadesLigadas,
  listarEquipaPublica,
  listarServicosPublicos,
} from "@/lib/repositorios/barbearias-publicas";
import { obterMinhaFicha } from "@/lib/repositorios/clientes-conta";
import {
  meuCartaoSelos,
  meuCodigoConvite,
  meusPlanos,
  minhasEncomendas,
  minhasMarcacoesFuturas,
  minhasVisitas,
} from "@/lib/repositorios/minha-area";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { sairCliente } from "../entrar/acoes";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Minha área (E.4): o cliente vê só os seus dados nesta barbearia (RLS meus_clientes). */
export default async function MinhaArea({ params }: { params: Promise<{ slug: string }> }) {
  const b = await obterBarbeariaDoEndereco((await params).slug);
  if (!b?.id || !b.nome) notFound();
  const { base } = await lerEndereco();
  const bd = await criarClienteServidor();
  const {
    data: { user },
  } = await bd.auth.getUser();
  const ficha = user ? await obterMinhaFicha(bd, b.id, user.id) : null;
  // Sem ficha nesta barbearia (sessão de equipa ou de outra barbearia): entrar como cliente.
  if (!ficha) redirect(`${base}/entrar`);
  const hoje = hojeIso();
  const [{ lingua, t }, ligadas, servicos, equipa, cartao, marcacoes, visitas, planos, encomendas] =
    await Promise.all([
      textosDaPagina(!!b.multilinguagem_ativa),
      funcionalidadesLigadas(bd, b.id, [
        "fidelizacao_selos",
        "clube_assinatura",
        "loja_produtos",
        "marcacao_rapida",
      ]),
      listarServicosPublicos(bd, b.id),
      listarEquipaPublica(bd, b.id),
      meuCartaoSelos(bd, b.id),
      minhasMarcacoesFuturas(bd, ficha.id),
      minhasVisitas(bd, ficha.id),
      meusPlanos(bd, ficha.id, hoje),
      minhasEncomendas(bd, ficha.id),
    ]);
  const codigo = ligadas.has("fidelizacao_selos") ? await meuCodigoConvite(bd, b.id) : null;
  const local = (s: (typeof servicos)[number] | undefined) =>
    (s && ((lingua === "en" ? s.nome_en : lingua === "fr" ? s.nome_fr : null) || s.nome)) ?? "";
  const servico = (id: string) => local(servicos.find((s) => s.id === id));
  const barbeiro = (id: string | null) => equipa.find((p) => p.id === id)?.nome ?? "";
  const cor = b.capa_cor ?? "#12100E";
  const corTexto = corDoTexto(cor);
  const proxima = marcacoes[0];
  const ultima = visitas[0];
  return (
    <div lang={lingua}>
      <MolduraCliente
        titulo={`${t.area.titulo} · ${b.nome}`}
        voltar={base || "/"}
        rotuloVoltar={t.marcacao.voltar}
        cor={cor}
        corTexto={corTexto}
        direita={
          <BotaoSair
            acao={sairCliente}
            rotulo={t.area.sair}
            className="border-current/30 bg-transparent"
          />
        }
      >
        <h1 className="text-xl font-extrabold" data-testid="vista">
          {t.area.ola(ficha.nome)}
        </h1>
        <div className="grid grid-cols-2 gap-2">
          <Button asChild className="h-12">
            <Link href={`${base}/marcar`}>{t.area.marcar}</Link>
          </Button>
          {ligadas.has("marcacao_rapida") && ultima?.profissionalId ? (
            <Button asChild variant="outline" className="h-12">
              <Link
                href={`${base}/marcar?servico=${ultima.servicoId}&profissional=${ultima.profissionalId}&repetir=1`}
              >
                {t.marcacao.repetir}
              </Link>
            </Button>
          ) : null}
          {b.whatsapp ? (
            <Button asChild variant="outline" className="h-12">
              <a href={ligacaoWhatsApp(b.whatsapp, "")} target="_blank" rel="noopener noreferrer">
                {t.area.whatsapp}
              </a>
            </Button>
          ) : null}
          {b.telefone ? (
            <Button asChild variant="outline" className="h-12">
              <a href={`tel:${b.telefone}`}>{t.area.ligar}</a>
            </Button>
          ) : null}
        </div>
        {cartao ? <CartaoSelos t={t} cartao={cartao} /> : null}
        <SeccaoArea titulo={t.area.proxima}>
          {proxima ? (
            <ProximaMarcacao
              lingua={lingua}
              id={proxima.id}
              inicio={proxima.inicio}
              servico={servico(proxima.servicoId)}
              barbeiro={barbeiro(proxima.profissionalId)}
              valorCent={proxima.valorCent}
              cancelamentoMin={b.antecedencia_cancelamento_min ?? 120}
            />
          ) : (
            <p className="text-sm text-muted-foreground">{t.area.semProxima}</p>
          )}
        </SeccaoArea>
        <ListasArea
          t={t}
          visitas={visitas}
          planos={ligadas.has("clube_assinatura") ? planos : null}
          encomendas={ligadas.has("loja_produtos") ? encomendas : null}
          servico={servico}
          barbeiro={barbeiro}
        />
        {codigo ? (
          <SeccaoArea titulo={t.area.convite} testId="codigo-convite">
            <p className="font-mono text-2xl font-bold tracking-widest">{codigo}</p>
            <p className="text-sm text-muted-foreground">{t.area.conviteTexto}</p>
          </SeccaoArea>
        ) : null}
        {b.multilinguagem_ativa ? <SeletorLingua atual={lingua} rotulo={t.linguas} /> : null}
      </MolduraCliente>
    </div>
  );
}
