"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { atribuir } from "@/app/(admin)/admin/(protegido)/comercial/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.comercial.leads;

/** O comercial responsável pelo lead (D-161): só os administradores atribuem. */
export function AtribuirResponsavel({
  leadId,
  atual,
  comerciais,
}: {
  leadId: string;
  atual: string | null;
  comerciais: { userId: string; nome: string }[];
}) {
  const router = useRouter();
  const [escolha, setEscolha] = useState(atual ?? "");
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  return (
    <div className="grid gap-2">
      {aviso ? <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso> : null}
      <label htmlFor="lead-responsavel" className="rotulo">
        {t.colunas.responsavel}
      </label>
      <div className="flex flex-wrap gap-2">
        <select
          id="lead-responsavel"
          value={escolha}
          onChange={(e) => setEscolha(e.target.value)}
          className="h-11 min-w-48 flex-1 rounded-md border border-input bg-card px-3 text-sm"
        >
          <option value="">{t.semResponsavel}</option>
          {comerciais.map((c) => (
            <option key={c.userId} value={c.userId}>
              {c.nome}
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="outline"
          className="h-11"
          disabled={aGuardar || escolha === (atual ?? "")}
          onClick={() =>
            iniciar(async () => {
              const r = await atribuir(leadId, escolha);
              setAviso(
                r.ok
                  ? { tipo: "sucesso", texto: t.atribuido }
                  : { tipo: "erro", texto: textos.comercial.propostas.erros.generico! },
              );
              if (r.ok) router.refresh();
            })
          }
        >
          {t.atribuir}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{t.responsavelAjuda}</p>
    </div>
  );
}
