"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { entrarNaFilaPresencial } from "@/app/(publico)/b/[slug]/fila/acoes";
import { Campo } from "@/components/nucleo/campo";
import { textosPublicos, type Lingua } from "@/lib/i18n/publico";
import { cn } from "@/lib/utils";
import { FormularioContacto } from "../formulario-contacto";

/** Os dois caminhos do código QR (F.4.3): entrar sem registo, ou criar acesso ao entrar. */
export function EntrarFilaPresencial({
  lingua,
  slug,
  servicos,
}: {
  lingua: Lingua;
  slug: string;
  servicos: { id: string; nome: string }[];
}) {
  const t = textosPublicos(lingua);
  const f = t.fila;
  const router = useRouter();
  const [comAcesso, setComAcesso] = useState(false);
  const [servicoId, setServicoId] = useState("");
  const [palavraPasse, setPalavraPasse] = useState("");
  const [erro, setErro] = useState<string>();
  const [aEnviar, iniciar] = useTransition();
  const caminho = (ativo: boolean, titulo: string, ajuda: string, valor: boolean) => (
    <button
      type="button"
      aria-pressed={ativo}
      onClick={() => setComAcesso(valor)}
      className={cn(
        "grid min-h-16 gap-0.5 rounded-xl border p-3 text-left",
        ativo ? "border-foreground bg-foreground text-background" : "bg-card",
      )}
    >
      <span className="font-bold">{titulo}</span>
      <span className="text-xs opacity-80">{ajuda}</span>
    </button>
  );
  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-2 gap-2">
        {caminho(!comAcesso, f.semRegisto, f.semRegistoAjuda, false)}
        {caminho(comAcesso, f.comAcesso, f.comAcessoAjuda, true)}
      </div>
      <FormularioContacto
        t={t}
        prefixo="fp"
        submeter={f.entrarHoje}
        erro={erro}
        aEnviar={aEnviar}
        aoEnviar={(c) =>
          iniciar(async () => {
            const r = await entrarNaFilaPresencial(slug, {
              ...c,
              servicoId,
              palavraPasse: comAcesso ? palavraPasse : "",
            });
            if (!r.ok) return setErro(t.marcacao.erros[r.erro] ?? t.marcacao.erros.erro);
            router.refresh();
          })
        }
      >
        <div className="grid gap-1.5">
          <label
            htmlFor="fp-servico"
            className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase"
          >
            {f.servico}
          </label>
          <select
            id="fp-servico"
            className="h-11 rounded-md border bg-background px-3"
            value={servicoId}
            onChange={(e) => setServicoId(e.target.value)}
          >
            <option value="">{f.qualquer}</option>
            {servicos.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>
        </div>
        {comAcesso ? (
          <Campo
            id="fp-palavra"
            rotulo={t.marcacao.palavraPasse}
            ajuda={t.marcacao.criarAcessoAjuda}
            type="password"
            autoComplete="new-password"
            value={palavraPasse}
            onChange={(e) => setPalavraPasse(e.target.value)}
          />
        ) : null}
      </FormularioContacto>
    </div>
  );
}
