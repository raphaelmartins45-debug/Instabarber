import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { EntrarFilaPresencial } from "@/components/publico/fila/entrar-fila-presencial";
import { EstadoFila } from "@/components/publico/fila/estado-fila";
import { MolduraCliente } from "@/components/publico/moldura-cliente";
import { lerEndereco } from "@/lib/inquilino/endereco";
import { obterBarbeariaDoEndereco } from "@/lib/publico/barbearia";
import { COOKIE_FILA } from "@/lib/publico/fila";
import { textosDaPagina } from "@/lib/publico/lingua";
import { corDoTexto } from "@/lib/regras/contraste";
import { esperaEstimada } from "@/lib/regras/fila";
import {
  funcionalidadesLigadas,
  listarServicosPublicos,
} from "@/lib/repositorios/barbearias-publicas";
import { estadoFilaPresencial } from "@/lib/repositorios/filas-publicas";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Fila presencial (F.4.3): a página que o código QR à porta abre. Sem entrada, «Entrar sem
 * registo» ou «Criar acesso»; com entrada, a posição e a espera estimada, atualizadas sozinhas.
 */
export default async function Fila({ params }: { params: Promise<{ slug: string }> }) {
  const b = await obterBarbeariaDoEndereco((await params).slug);
  if (!b?.id || !b.slug || !b.nome) notFound();
  const bd = await criarClienteServidor();
  const ligadas = await funcionalidadesLigadas(bd, b.id, ["qr_entrada"]);
  if (!ligadas.has("qr_entrada")) notFound();
  const [{ lingua, t }, { base }, servicos, entradaId] = await Promise.all([
    textosDaPagina(!!b.multilinguagem_ativa),
    lerEndereco(),
    listarServicosPublicos(bd, b.id),
    cookies().then((c) => c.get(COOKIE_FILA)?.value),
  ]);
  const estado = entradaId ? await estadoFilaPresencial(bd, entradaId) : null;
  const cor = b.capa_cor ?? "#12100E";
  const local = (pt: string | null, en: string | null, fr: string | null) =>
    (lingua === "en" ? en : lingua === "fr" ? fr : null) || pt || "";
  return (
    <div lang={lingua}>
      <MolduraCliente
        titulo={`${t.fila.titulo} · ${b.nome}`}
        voltar={base || "/"}
        rotuloVoltar={t.marcacao.voltar}
        cor={cor}
        corTexto={corDoTexto(cor)}
      >
        {estado ? (
          <EstadoFila
            lingua={lingua}
            estado={estado.estado}
            posicao={estado.posicao}
            minutos={esperaEstimada(estado)}
          />
        ) : b.aberto ? (
          <EntrarFilaPresencial
            lingua={lingua}
            slug={b.slug}
            servicos={servicos.map((s) => ({
              id: s.id ?? "",
              nome: local(s.nome, s.nome_en, s.nome_fr),
            }))}
          />
        ) : (
          <p className="font-semibold">{t.fila.indisponivel}</p>
        )}
      </MolduraCliente>
    </div>
  );
}
