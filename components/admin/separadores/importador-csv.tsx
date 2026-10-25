"use client";

import { descreverFicheiro } from "@/lib/formatacao/ficheiros";
import { CampoFicheiro } from "@/components/nucleo/campo-ficheiro";
import { useState, useTransition } from "react";
import { importar } from "@/app/(admin)/admin/(protegido)/barbearias/[id]/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import { lerCsv, validarClientes, validarServicos, type ErroLinha } from "@/lib/regras/importacao";

const t = textos.admin.ficha.importacao;
const motivos: Record<string, string> = t.motivos;

/** Carrega um CSV, mostra a pré-visualização e as linhas com erro, e grava só as válidas (E.1). */
export function ImportadorCsv({
  inquilinoId,
  tipo,
}: {
  inquilinoId: string;
  tipo: "clientes" | "servicos";
}) {
  const [csv, setCsv] = useState("");
  const [previa, setPrevia] = useState<{ validas: number; erros: ErroLinha[] }>();
  const [gravadas, setGravadas] = useState<number>();
  const [aGuardar, iniciar] = useTransition();

  async function escolher(ficheiro: File | undefined) {
    if (!ficheiro) return;
    const texto = await ficheiro.text();
    const linhas = lerCsv(texto);
    const r = tipo === "clientes" ? validarClientes(linhas, new Set()) : validarServicos(linhas);
    setCsv(texto);
    setGravadas(undefined);
    setPrevia({ validas: r.validas.length, erros: r.erros });
  }

  return (
    <section className="grid gap-3 rounded-lg border bg-card p-4" data-testid={`importar-${tipo}`}>
      <h2 className="text-[15px] font-bold text-ligacao">
        {tipo === "clientes" ? t.clientes : t.servicos}
      </h2>
      <p className="text-sm text-muted-foreground">
        {tipo === "clientes" ? t.clientesAjuda : t.servicosAjuda}
      </p>
      <CampoFicheiro
        rotulo={t.escolher}
        ajuda={descreverFicheiro({ formatos: ["text/csv"] })}
        accept=".csv,text/csv"
        aoEscolher={escolher}
      />
      {previa ? (
        <div className="grid gap-2">
          <p className="text-sm font-semibold">{t.previa(previa.validas, previa.erros.length)}</p>
          {previa.erros.length ? (
            <ul className="grid max-h-48 gap-1 overflow-y-auto text-sm text-destructive">
              {previa.erros.map((e) => (
                <li key={`${e.linha}-${e.motivo}`}>
                  {t.linha(e.linha)}: {motivos[e.motivo] ?? e.motivo}
                </li>
              ))}
            </ul>
          ) : null}
          <Button
            className="h-11 justify-self-start"
            disabled={aGuardar || previa.validas === 0}
            onClick={() =>
              iniciar(async () => {
                const r = await importar(inquilinoId, tipo, csv);
                setGravadas(r.ok ? r.gravadas : 0);
              })
            }
          >
            {t.gravar(previa.validas)}
          </Button>
        </div>
      ) : null}
      {gravadas !== undefined ? <Aviso tipo="sucesso">{t.gravadas(gravadas)}</Aviso> : null}
    </section>
  );
}
