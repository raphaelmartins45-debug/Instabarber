"use client";

import { Megaphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { lerComunicado } from "@/app/(app)/app/(painel)/acoes";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.gestao.comunicados.painel;

/** Avisos da InstaBarber no Início do gestor (D-160), até ele carregar em «Li». */
export function ComunicadosInicio({
  comunicados,
}: {
  comunicados: { id: string; titulo: string; texto: string }[];
}) {
  const router = useRouter();
  const [aMarcar, iniciar] = useTransition();
  if (comunicados.length === 0) return null;
  return (
    <section className="grid gap-3" aria-label={t.titulo}>
      {comunicados.map((c) => (
        <article
          key={c.id}
          className="cartao grid gap-2 rounded-2xl border-destaque/40 p-4"
          data-testid="comunicado-painel"
        >
          <p className="rotulo flex items-center gap-1.5">
            <Megaphone className="size-4" aria-hidden />
            {t.titulo}
          </p>
          <h2 className="text-[15px] font-bold">{c.titulo}</h2>
          <p className="text-sm whitespace-pre-line">{c.texto}</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="justify-self-start"
            disabled={aMarcar}
            onClick={() =>
              iniciar(async () => {
                await lerComunicado(c.id);
                router.refresh();
              })
            }
          >
            {t.li}
          </Button>
        </article>
      ))}
    </section>
  );
}
