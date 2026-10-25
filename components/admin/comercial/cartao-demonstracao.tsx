"use client";

import { useState, useTransition } from "react";
import {
  abrirPainel,
  preparar,
} from "@/app/(admin)/admin/(protegido)/comercial/acoes-demonstracao";
import { Aviso } from "@/components/nucleo/aviso";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.comercial.demonstracao;

/** A barbearia de demonstração (D-162): preparar os dados de hoje, abrir o painel e a página. */
export function CartaoDemonstracao({ pagina }: { pagina: string | null }) {
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aCorrer, iniciar] = useTransition();
  return (
    <section className="cartao grid gap-3 rounded-2xl p-4" data-testid="demonstracao">
      <h2 className="text-[15px] font-bold">{t.titulo}</h2>
      <p className="text-sm text-muted-foreground">{t.ajuda}</p>
      {aviso ? <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso> : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={aCorrer}
          onClick={() =>
            iniciar(async () => {
              const r = await preparar();
              setAviso(
                r.ok ? { tipo: "sucesso", texto: t.preparada } : { tipo: "erro", texto: t.erro },
              );
            })
          }
        >
          {t.preparar}
        </Button>
        <Button
          type="button"
          disabled={aCorrer}
          onClick={() =>
            iniciar(async () => {
              const r = await abrirPainel();
              if (r.ok) window.location.assign("/app");
              else setAviso({ tipo: "erro", texto: t.erro });
            })
          }
        >
          {t.abrirPainel}
        </Button>
        {pagina ? (
          <Button asChild variant="ghost">
            <a href={pagina} target="_blank" rel="noreferrer">
              {t.paginaPublica}
            </a>
          </Button>
        ) : null}
      </div>
    </section>
  );
}
