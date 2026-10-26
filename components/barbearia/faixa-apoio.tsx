"use client";

import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { terminarApoio } from "@/app/(admin)/admin/(protegido)/barbearias/[id]/acoes";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.admin.ficha.apoio;

/**
 * Faixa visível da vista de apoio (E.1): só leitura, com a hora a que termina. Quando uma ação
 * tentou gravar (`?so_leitura=1`, D-166), mostra que nada foi gravado.
 */
export function FaixaApoio({ barbearia, hora }: { barbearia: string; hora: string }) {
  const [aSair, iniciar] = useTransition();
  const router = useRouter();
  const caminho = usePathname();
  const parametros = useSearchParams();
  const recusado = parametros.get("so_leitura") === "1";
  const fechar = () => {
    const resto = new URLSearchParams(parametros);
    resto.delete("so_leitura");
    router.replace(resto.size ? `${caminho}?${resto}` : caminho, { scroll: false });
  };
  return (
    <>
      {recusado ? (
        <div
          role="alert"
          data-testid="apoio-recusado"
          className="fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-md items-start gap-3 rounded-lg border border-destaque bg-card p-3 text-sm shadow-lg md:bottom-6"
        >
          <span className="flex-1">{t.naoGravado}</span>
          <Button size="sm" variant="outline" onClick={fechar} aria-label={t.fecharAviso}>
            <X />
          </Button>
        </div>
      ) : null}
      <div
        role="status"
        data-testid="faixa-apoio"
        className="flex flex-wrap items-center justify-between gap-2 bg-destaque px-4 py-2 text-sm font-semibold text-primary"
      >
        <span>{t.faixa(barbearia, hora)}</span>
        <Button
          size="sm"
          variant="outline"
          className="border-primary/40 bg-transparent"
          disabled={aSair}
          onClick={() =>
            iniciar(async () => window.location.assign((await terminarApoio()).destino))
          }
        >
          {t.sair}
        </Button>
      </div>
    </>
  );
}
