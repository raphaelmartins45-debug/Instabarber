import Image from "next/image";
import type { ReactNode } from "react";
import { sair } from "@/app/(auth)/entrar/acoes";
import type { ItemMontado } from "@/lib/funcionalidades/menus";
import { textos } from "@/lib/i18n/pt-PT";
import { BotaoSair } from "./botao-sair";
import { PaletaComandos } from "./paleta-comandos";
import { SeletorAparencia } from "./seletor-aparencia";

/** Barra superior dos painéis, em vidro: marca, camada, procura (Ctrl K), aparência e «Sair». */
export function CabecalhoPainel({
  camada,
  vista,
  extra,
  comandos,
  acaoSair = sair,
}: {
  camada: string;
  /** «Vista do Carlos», «Vista do gestor», o nome da barbearia… */
  vista: string;
  extra?: ReactNode;
  /** Entradas do menu, para a paleta de comandos. Sem elas, não há procura. */
  comandos?: ItemMontado[];
  /** Por omissão, a saída da equipa; a área de cliente passa a sua. */
  acaoSair?: () => Promise<{ destino: string }>;
}) {
  return (
    <header className="vidro sticky top-0 z-40 border-b border-border">
      <div className="flex h-16 items-center gap-2 px-4 sm:gap-3 md:gap-4 md:px-6">
        {/* Logótipo horizontal a partir de 640 px; no telemóvel, só o ícone, para caber o nome. */}
        <Image
          src="/marca/logo-escuro.png"
          alt={textos.marca.nome}
          width={704}
          height={360}
          className="hidden h-9 w-auto sm:block claro:sm:hidden"
        />
        <Image
          src="/marca/logo-claro.png"
          alt={textos.marca.nome}
          width={724}
          height={360}
          className="hidden h-9 w-auto claro:sm:block"
        />
        <Image
          src="/marca/icone-escuro.png"
          alt={textos.marca.nome}
          width={191}
          height={360}
          className="h-8 w-auto sm:hidden claro:hidden"
        />
        <Image
          src="/marca/icone-claro.png"
          alt={textos.marca.nome}
          width={186}
          height={360}
          className="hidden h-8 w-auto claro:block claro:sm:hidden"
        />
        <span aria-hidden className="hidden h-6 w-px bg-border sm:block" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-terciario">{camada}</p>
          <p data-testid="vista" className="truncate text-sm font-semibold">
            {vista}
          </p>
        </div>
        {extra}
        {comandos ? <PaletaComandos itens={comandos} /> : null}
        <SeletorAparencia />
        <BotaoSair acao={acaoSair} className="" />
      </div>
    </header>
  );
}
