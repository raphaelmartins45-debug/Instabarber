import type { CSSProperties, ReactNode } from "react";
import { LETRA_DO_ESTILO } from "@/components/publico/fontes";
import { ACABAMENTO, type Estilo } from "@/lib/publico/estilos";
import { corDoTexto } from "@/lib/regras/contraste";
import { cn } from "@/lib/utils";

// A miniatura de cada modelo (D-199): a estrutura da capa em ponto pequeno, na cor da barbearia,
// com o nome na letra do modelo. Mostra o que distingue o modelo (onde fica o nome, a imagem, a
// ação), não só a letra.

const PAPEL = "#F6F3EE";
const ESCURO = "#141210";

export function MiniaturaModelo({
  estilo,
  cor,
  nome,
}: {
  estilo: Estilo;
  cor: string;
  nome: string;
}) {
  const tinta = corDoTexto(cor);
  const a = ACABAMENTO[estilo];
  const letra: CSSProperties = {
    fontWeight: a.peso,
    letterSpacing: `${a.espacamento}em`,
    textTransform: a.maiusculas ? "uppercase" : a.minusculas ? "lowercase" : "none",
  };
  const Nome = ({ className, cor: c }: { className?: string; cor?: string }) => (
    <span
      className={cn(LETRA_DO_ESTILO[estilo], "block truncate leading-[0.9]", className)}
      style={{ ...letra, color: c }}
      translate="no"
    >
      {nome}
    </span>
  );
  // Um bloco cheio: a imagem (fachada ou logótipo) ou a ação, em forma, sem texto.
  const Bloco = ({ className, fundo }: { className?: string; fundo: string }) => (
    <span aria-hidden className={cn("block", className)} style={{ backgroundColor: fundo }} />
  );
  const Botao = ({ className, fundo = cor }: { className?: string; fundo?: string }) => (
    <Bloco className={cn("h-2.5", className)} fundo={fundo} />
  );
  const caixa = (fundo: string, conteudo: ReactNode, texto = corDoTexto(fundo)) => (
    <span
      className="relative block aspect-[16/10] w-full overflow-hidden"
      style={{ backgroundColor: fundo, color: texto }}
    >
      {conteudo}
    </span>
  );

  switch (estilo) {
    case "monumento":
      return caixa(
        cor,
        <>
          <Bloco className="absolute top-[18%] left-[6%] size-[22%]" fundo={tinta} />
          <span className="absolute top-[22%] right-[6%] grid w-[34%] gap-1">
            <Botao fundo={tinta} />
            <Botao fundo={`color-mix(in srgb, ${tinta} 25%, transparent)`} />
          </span>
          <Nome className="absolute right-[4%] bottom-[4%] left-[5%] text-[2.1rem]" />
        </>,
      );
    case "sala_escura":
      return caixa(
        ESCURO,
        <>
          <Bloco className="absolute inset-x-0 top-0 h-[46%]" fundo="#2A2724" />
          <span className="absolute top-[52%] right-[6%] w-[34%]">
            <Botao />
          </span>
          <Nome className="absolute right-[4%] bottom-[5%] left-[5%] text-[1.9rem]" />
        </>,
      );
    case "cartaz":
      return caixa(
        cor,
        <>
          <Nome className="absolute top-[16%] left-[5%] w-[62%] text-[1.6rem] whitespace-normal" />
          <span
            aria-hidden
            className="absolute right-[10%] bottom-[8%] h-[64%] w-[26%] rotate-[5deg] rounded-t-full"
            style={{ backgroundColor: tinta }}
          />
          <span className="absolute inset-x-0 bottom-0 h-[20%]" style={{ backgroundColor: tinta }}>
            <Botao className="absolute top-[35%] right-[6%] w-[30%]" fundo={cor} />
          </span>
        </>,
      );
    case "cartao":
      return caixa(
        cor,
        <span className="absolute inset-[5%] grid grid-cols-2 gap-[3%]">
          <span className="grid content-start overflow-hidden" style={{ backgroundColor: PAPEL }}>
            <span aria-hidden className="flex h-2.5">
              {Array.from({ length: 16 }, (_, i) => (
                <span
                  key={i}
                  className="w-1.5 shrink-0"
                  style={{ backgroundColor: i % 2 ? PAPEL : cor }}
                />
              ))}
            </span>
            <span className="grid justify-items-center gap-1.5 px-2 pt-[18%]">
              <Nome className="max-w-full text-lg" cor={ESCURO} />
              <Botao className="w-[70%]" />
            </span>
          </span>
          <Bloco className="size-full" fundo={ESCURO} />
        </span>,
      );
    case "palco":
      return caixa(
        ESCURO,
        <>
          <Bloco className="absolute top-[5%] bottom-[5%] left-[3%] w-[44%]" fundo="#2A2724" />
          <span className="absolute top-[34%] right-[8%] w-[34%]">
            <Botao />
          </span>
          <Nome
            className="absolute right-[4%] bottom-[5%] w-[62%] text-right text-[1.7rem]"
            cor={PAPEL}
          />
        </>,
      );
    case "bairro":
      return caixa(
        cor,
        <span className="absolute inset-[5%] grid grid-cols-2 gap-[3%]">
          <span
            className="grid content-center justify-items-center gap-1.5 px-2"
            style={{ backgroundColor: PAPEL }}
          >
            <Nome className="max-w-full text-xl" cor={ESCURO} />
            <Botao className="w-[70%]" />
          </span>
          <span className="relative block" style={{ backgroundColor: ESCURO }}>
            <span
              className="absolute inset-x-0 bottom-0 h-[14%]"
              style={{ backgroundColor: PAPEL }}
            />
          </span>
        </span>,
      );
    case "anuario":
      return caixa(
        cor,
        <>
          <Bloco className="absolute top-[8%] left-[6%] h-2 w-[10%]" fundo={tinta} />
          <Nome className="absolute bottom-[10%] left-[42%] w-[54%] text-[1.4rem]" />
          <span className="absolute bottom-[10%] left-[6%] w-[28%]">
            <Botao fundo={tinta} />
          </span>
        </>,
      );
    case "vitrine":
      return caixa(
        PAPEL,
        <>
          <Nome className="absolute top-[7%] left-[6%] w-[60%] text-xl" cor={ESCURO} />
          <span className="absolute top-[40%] left-[10%] grid w-[18%] justify-items-end gap-1">
            {[1, 0.5, 0.3].map((o) => (
              <Bloco
                key={o}
                className="h-1.5 w-full"
                fundo={`color-mix(in srgb, ${ESCURO} ${o * 100}%, transparent)`}
              />
            ))}
          </span>
          <Bloco className="absolute top-[30%] left-[36%] h-[62%] w-[26%]" fundo={cor} />
          <span className="absolute top-[52%] right-[8%] w-[22%]">
            <Botao />
          </span>
        </>,
        ESCURO,
      );
  }
}
