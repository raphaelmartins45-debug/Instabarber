"use client";

import { useState, useTransition } from "react";
import { guardarMeuTelefone } from "@/app/(admin)/admin/(protegido)/documentos/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.documentos.ecra;

/** Folheto da visita (D-181): o telefone de quem o gera e o botão para o descarregar. */
export function FolhetoVisita({ telefone }: { telefone: string | null }) {
  const [valor, setValor] = useState(telefone ?? "");
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  return (
    <div className="grid gap-3" data-testid="folheto-visita">
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          iniciar(async () => {
            const r = await guardarMeuTelefone(valor);
            setAviso({ ok: r.ok, texto: r.ok ? t.telefoneGuardado : t.telefoneInvalido });
          });
        }}
      >
        <div className="min-w-0 flex-1 sm:max-w-xs">
          <Campo
            id="meu-telefone"
            rotulo={t.telefone}
            ajuda={t.telefoneAjuda}
            type="tel"
            autoComplete="tel"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
        </div>
        <Button type="submit" variant="outline" className="h-11" disabled={aGuardar}>
          {t.guardarTelefone}
        </Button>
      </form>
      {aviso ? <Aviso tipo={aviso.ok ? "sucesso" : "erro"}>{aviso.texto}</Aviso> : null}
      {!telefone && !aviso?.ok ? (
        <p className="text-sm text-muted-foreground">{t.semTelefone}</p>
      ) : null}
      <Button asChild className="justify-self-start">
        <a href="/admin/documentos/folheto" download>
          {t.descarregar}
        </a>
      </Button>
    </div>
  );
}
