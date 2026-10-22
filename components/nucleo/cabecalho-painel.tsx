import Image from "next/image";
import type { ReactNode } from "react";
import { sair } from "@/app/(auth)/entrar/acoes";
import { textos } from "@/lib/i18n/pt-PT";
import { BotaoSair } from "./botao-sair";

/** Barra superior dos painéis: marca, camada, quem está a ver e «Sair». */
export function CabecalhoPainel({
  camada,
  vista,
  extra,
  acaoSair = sair,
}: {
  camada: string;
  /** «Vista do Carlos», «Vista do gestor», o nome da barbearia… */
  vista: string;
  extra?: ReactNode;
  /** Por omissão, a saída da equipa; a área de cliente passa a sua. */
  acaoSair?: () => Promise<{ destino: string }>;
}) {
  return (
    <header className="border-b bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Image
          src="/marca/logo-horizontal-dourado.png"
          alt={textos.marca.nome}
          width={120}
          height={28}
          className="h-7 w-auto"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-white/60">{camada}</p>
          <p data-testid="vista" className="truncate text-sm font-semibold">
            {vista}
          </p>
        </div>
        {extra}
        <BotaoSair acao={acaoSair} />
      </div>
    </header>
  );
}
