"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.ficheiros;

/**
 * Escolher um ficheiro com um botão visível, o nome do escolhido e o que se aceita por baixo
 * (pedido do dono, 25/10/2026). Dentro de um formulário, vai com o `name`; com `aoEscolher`,
 * carrega logo e limpa a escolha para se poder repetir o mesmo ficheiro.
 */
export function CampoFicheiro({
  rotulo,
  ajuda,
  accept,
  name,
  required,
  disabled,
  imagem,
  aCarregar,
  aoEscolher,
  testId,
}: {
  rotulo: string;
  ajuda: string;
  accept: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  imagem?: boolean;
  aCarregar?: boolean;
  aoEscolher?: (ficheiro: File) => void;
  testId?: string;
}) {
  const id = useId();
  const entrada = useRef<HTMLInputElement>(null);
  const [nome, setNome] = useState<string>();
  useEffect(() => {
    const formulario = entrada.current?.form;
    const limpar = () => setNome(undefined);
    formulario?.addEventListener("reset", limpar);
    return () => formulario?.removeEventListener("reset", limpar);
  }, []);
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="rotulo">
        {rotulo}
      </label>
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed bg-card p-3">
        <input
          ref={entrada}
          id={id}
          type="file"
          name={name}
          accept={accept}
          required={required}
          disabled={disabled || aCarregar}
          className="sr-only"
          data-testid={testId}
          onChange={(e) => {
            const f = e.target.files?.[0];
            setNome(f?.name);
            if (f && aoEscolher) {
              aoEscolher(f);
              e.target.value = "";
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          className="h-11"
          disabled={disabled || aCarregar}
          onClick={() => entrada.current?.click()}
        >
          {imagem ? t.escolherImagem : t.escolher}
        </Button>
        <span className="min-w-0 truncate text-sm text-muted-foreground">
          {aCarregar ? t.aCarregar : (nome ?? t.nenhum)}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{ajuda}</p>
    </div>
  );
}
