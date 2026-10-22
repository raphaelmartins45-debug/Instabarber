import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FluxoMarcacao } from "@/components/publico/marcacao/fluxo-marcacao";
import { MolduraCliente } from "@/components/publico/moldura-cliente";
import { hojeIso } from "@/lib/formatacao/datas";
import { formatarTelefone } from "@/lib/formatacao/telefone";
import { lerEndereco, origemPrincipal } from "@/lib/inquilino/endereco";
import { obterBarbeariaDoEndereco } from "@/lib/publico/barbearia";
import { textosDaPagina } from "@/lib/publico/lingua";
import { corDoTexto } from "@/lib/regras/contraste";
import {
  funcionalidadesLigadas,
  listarEquipaPublica,
  listarServicosPublicos,
} from "@/lib/repositorios/barbearias-publicas";
import { obterMinhaFicha } from "@/lib/repositorios/clientes-conta";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// O fluxo de marcação não é indexado (E.6).
export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Marcação pública (E.4): sem conta; com sessão de cliente, os dados vêm preenchidos. */
export default async function Marcar({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ servico?: string; profissional?: string; repetir?: string }>;
}) {
  const b = await obterBarbeariaDoEndereco((await params).slug);
  if (!b?.id || !b.slug || !b.nome) notFound();
  const q = await searchParams;
  const bd = await criarClienteServidor();
  const [{ lingua, t }, { base }, servicos, equipa, principal, sessao, ligadas] = await Promise.all(
    [
      textosDaPagina(!!b.multilinguagem_ativa),
      lerEndereco(),
      listarServicosPublicos(bd, b.id),
      listarEquipaPublica(bd, b.id),
      origemPrincipal(),
      bd.auth.getUser(),
      funcionalidadesLigadas(bd, b.id, ["fila_espera"]),
    ],
  );
  const ficha = sessao.data.user ? await obterMinhaFicha(bd, b.id, sessao.data.user.id) : null;
  const cor = b.capa_cor ?? "#12100E";
  const local = (pt: string | null, en: string | null, fr: string | null) =>
    (lingua === "en" ? en : lingua === "fr" ? fr : null) || pt;
  return (
    <div lang={lingua}>
      <MolduraCliente
        titulo={`${t.marcacao.titulo} · ${b.nome}`}
        voltar={base || "/"}
        rotuloVoltar={t.marcacao.voltar}
        cor={cor}
        corTexto={corDoTexto(cor)}
      >
        {b.aberto ? (
          <FluxoMarcacao
            lingua={lingua}
            hoje={hojeIso()}
            barbearia={{
              slug: b.slug,
              nome: b.nome,
              morada: [b.morada, b.codigo_postal, b.cidade].filter(Boolean).join(", "),
              cancelamentoMin: b.antecedencia_cancelamento_min ?? 120,
              janelaDias: b.janela_marcacao_dias ?? 60,
              area: `${base}/minha-area`,
              privacidade: `${principal}/privacidade`,
              filaEspera: ligadas.has("fila_espera"),
            }}
            servicos={servicos.map((s) => ({
              id: s.id ?? "",
              nome: local(s.nome, s.nome_en, s.nome_fr) ?? "",
              descricao: local(s.descricao, s.descricao_en, s.descricao_fr),
              duracao: s.duracao_min ?? 0,
              precoCent: s.preco_centimos,
            }))}
            equipa={equipa}
            inicial={{
              servicoId: q.servico,
              profissionalId: q.profissional,
              repetir: q.repetir === "1",
            }}
            cliente={
              ficha
                ? {
                    nome: ficha.nome,
                    telefone: ficha.telefone
                      ? formatarTelefone(ficha.telefone).replace(/\s/g, "")
                      : "",
                    email: ficha.email ?? "",
                  }
                : null
            }
          />
        ) : (
          <p className="font-semibold">{t.capa.indisponivel}</p>
        )}
      </MolduraCliente>
    </div>
  );
}
