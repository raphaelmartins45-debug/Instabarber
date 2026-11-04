import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AvatarBarbeiro } from "@/components/publico/avatar-barbeiro";
import { MolduraCliente } from "@/components/publico/moldura-cliente";
import { PaginaModelo } from "@/components/publico/pagina-modelo";
import { lerEndereco } from "@/lib/inquilino/endereco";
import { obterBarbeariaDoEndereco } from "@/lib/publico/barbearia";
import { estiloDe } from "@/lib/publico/estilos";
import { textosDaPagina } from "@/lib/publico/lingua";
import { corDoTexto } from "@/lib/regras/contraste";
import { listarEquipaPublica } from "@/lib/repositorios/barbearias-publicas";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const BOTAO =
  "inline-flex h-12 items-center justify-center rounded-[var(--raio-botao)] px-5 font-bold";

/**
 * O perfil do barbeiro na página pública (D-210): fotografia, nome, especialidades, a
 * apresentação, «Marcar com…» e os trabalhos em grelha, com o modelo da página.
 */
export default async function PerfilBarbeiro({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const b = await obterBarbeariaDoEndereco(slug);
  if (!b?.id || !b.nome) notFound();
  const bd = await criarClienteServidor();
  const [{ lingua, t }, { base }, equipa] = await Promise.all([
    textosDaPagina(!!b.multilinguagem_ativa),
    lerEndereco(),
    listarEquipaPublica(bd, b.id),
  ]);
  const p = equipa.find((e) => e.id === id);
  if (!p) notFound();
  const cor = b.capa_cor ?? "#12100E";
  const marcar = b.aberto ? `${base}/marcar?profissional=${p.id}` : null;
  return (
    <PaginaModelo estilo={estiloDe(b.estilo_pagina)} lingua={lingua}>
      <MolduraCliente
        titulo={b.nome}
        voltar={`${base}/#equipa`}
        rotuloVoltar={t.marcacao.voltar}
        cor={cor}
        corTexto={corDoTexto(cor)}
      >
        <article className="grid gap-6" data-testid="perfil-barbeiro">
          <header className="grid justify-items-start gap-4">
            <AvatarBarbeiro nome={p.nome} fotoUrl={p.fotoUrl} className="size-24 text-4xl" />
            <div className="grid gap-1">
              <h1 className="titulo-estilo text-3xl font-extrabold" translate="no">
                {p.nome}
              </h1>
              {p.especialidades.length ? (
                <p className="text-sm text-muted-foreground">{p.especialidades.join(" · ")}</p>
              ) : null}
            </div>
            {p.apresentacao ? <p className="text-base">{p.apresentacao}</p> : null}
            {marcar ? (
              <Link
                href={marcar}
                className={`${BOTAO} w-full bg-primary text-primary-foreground sm:w-auto`}
              >
                {t.blocos.marcarCom(p.nome)}
              </Link>
            ) : null}
          </header>
          {p.portfolio.length ? (
            <section className="grid gap-3" aria-label={t.blocos.trabalhos(p.nome)}>
              <h2 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                {t.blocos.trabalhosTitulo}
              </h2>
              <div className="grid grid-cols-3 gap-1">
                {p.portfolio.map((f) => (
                  // eslint-disable-next-line @next/next/no-img-element -- imagem pública do Storage
                  <img
                    key={f}
                    src={f}
                    alt=""
                    loading="lazy"
                    className="aspect-square w-full rounded-sm object-cover"
                  />
                ))}
              </div>
            </section>
          ) : null}
        </article>
      </MolduraCliente>
    </PaginaModelo>
  );
}
