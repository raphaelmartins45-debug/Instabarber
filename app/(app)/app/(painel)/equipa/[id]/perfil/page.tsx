import { PainelProfissional } from "@/components/barbearia/painel-profissional";
import { FormularioPerfil } from "@/components/barbearia/profissional/formulario-perfil";
import { Portfolio } from "@/components/barbearia/profissional/portfolio";
import { Sessoes } from "@/components/barbearia/profissional/sessoes";
import { Secao } from "@/components/nucleo/secao";
import { textos } from "@/lib/i18n/pt-PT";
import { abrirAreaProfissional } from "@/lib/painel/area-profissional";
import { listarPortfolio } from "@/lib/repositorios/painel/portfolio";
import { listarFichasEquipa } from "@/lib/repositorios/profissionais";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { vertical } from "@/lib/vertical/barbearia";

const t = textos.profissional.perfil;
export const metadata = { title: `${t.titulo} · ${vertical.camadas.equipa}` };

/** Perfil do barbeiro (E.3.1): nome apresentado, fotografia, portfólio, palavra-passe e sessões. */
export default async function PerfilProfissional({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const area = await abrirAreaProfissional(id);
  const bd = await criarClienteServidor();
  const portfolioAtivo = area.grelha.ativas.has("portfolio_barbeiro");
  const [fichas, fotos] = await Promise.all([
    listarFichasEquipa(bd, area.contexto.barbearia.id),
    portfolioAtivo ? listarPortfolio(bd, id) : [],
  ]);
  const ficha = fichas.find((f) => f.id === id)!;
  const pode = !area.contexto.apoio;
  return (
    <PainelProfissional area={area} atual="perfil">
      <h1 className="text-[22px] font-extrabold">{t.titulo}</h1>
      {pode ? (
        <FormularioPerfil
          profissionalId={id}
          nome={ficha.nome_apresentado}
          fotoUrl={ficha.foto_url}
        />
      ) : null}
      {portfolioAtivo && pode ? (
        <Secao id="portfolio" titulo={t.portfolio}>
          <Portfolio profissionalId={id} fotos={fotos} visivel={ficha.portfolio_visivel} />
        </Secao>
      ) : null}
      {area.proprio ? <Sessoes /> : null}
    </PainelProfissional>
  );
}
