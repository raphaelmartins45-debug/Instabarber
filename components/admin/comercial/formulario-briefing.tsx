"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { gerar, guardar } from "@/app/(admin)/admin/(protegido)/comercial/acoes-propostas";
import { Aviso } from "@/components/nucleo/aviso";
import { Button } from "@/components/ui/button";
import { type DadosBriefing, esquemaBriefing } from "@/lib/comercial/briefing";
import { textos } from "@/lib/i18n/pt-PT";
import type { RegimeIva } from "@/lib/regras/mensalidade";
import { cn } from "@/lib/utils";
import { PassoBriefing } from "./passos-briefing";

const t = textos.comercial.briefing;
const erros = textos.comercial.propostas.erros;

/** Briefing em sete passos (N.4): guarda a meio; «Gerar proposta» cria uma versão nova. */
export function FormularioBriefing({
  leadId,
  inicial,
  regime,
}: {
  leadId: string;
  inicial: DadosBriefing;
  regime: RegimeIva;
}) {
  const router = useRouter();
  const [passo, setPasso] = useState(0);
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  const form = useForm<DadosBriefing>({
    resolver: zodResolver(esquemaBriefing),
    defaultValues: inicial,
  });
  const total = t.passos.length;

  const gravar = () =>
    iniciar(async () => {
      const r = await guardar(leadId, form.getValues());
      setAviso(
        r.ok ? { tipo: "sucesso", texto: t.guardado } : { tipo: "erro", texto: erros.generico! },
      );
    });

  const gerarProposta = () =>
    iniciar(async () => {
      const g = await guardar(leadId, form.getValues());
      if (!g.ok) return setAviso({ tipo: "erro", texto: erros.generico! });
      const r = await gerar(leadId);
      if (r.ok) return router.push(`/admin/comercial/leads/${leadId}#propostas`);
      const texto =
        r.erro === "em_falta"
          ? t.emFalta((r.campos ?? []).map((c) => (t.campos[c] ?? c).replace(" *", "")).join(", "))
          : (erros[r.erro] ?? erros.generico!);
      setAviso({ tipo: "erro", texto });
    });

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      noValidate
      className="cartao grid gap-5 rounded-2xl p-5"
    >
      <div className="grid gap-2">
        <p className="rotulo">
          {t.passo(passo + 1, total)} · {t.passos[passo]}
        </p>
        <div className="flex gap-1" aria-hidden>
          {t.passos.map((p, i) => (
            <button
              key={p}
              type="button"
              tabIndex={-1}
              onClick={() => setPasso(i)}
              className={cn("h-1.5 flex-1 rounded-full", i <= passo ? "bg-destaque" : "bg-border")}
            />
          ))}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{t.ajuda}</p>
      {aviso ? <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso> : null}
      <PassoBriefing form={form} passo={passo} regime={regime} />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={passo === 0}
          onClick={() => setPasso((p) => p - 1)}
        >
          {t.anterior}
        </Button>
        {passo < total - 1 ? (
          <Button type="button" variant="outline" onClick={() => setPasso((p) => p + 1)}>
            {t.seguinte}
          </Button>
        ) : null}
        <Button type="button" variant="secondary" onClick={gravar} disabled={aGuardar}>
          {t.guardar}
        </Button>
        <Button type="button" onClick={gerarProposta} disabled={aGuardar} className="ml-auto">
          {t.gerar}
        </Button>
      </div>
    </form>
  );
}
