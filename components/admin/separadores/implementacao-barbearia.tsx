"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { guardarImplementacao } from "@/app/(admin)/admin/(protegido)/barbearias/[id]/acoes-condicoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { IMPLEMENTACOES } from "@/lib/comercial/condicoes";
import { textos } from "@/lib/i18n/pt-PT";
import { type DadosImplementacao, esquemaImplementacao } from "@/lib/validacao/condicoes-barbearia";

const t = textos.admin.condicoesBarbearia;

/**
 * A implementação por cobrar no primeiro pagamento (D-189). Vem da proposta aceite ou do registo
 * pelo painel; depois de paga só se mostra.
 */
export function ImplementacaoBarbearia(p: {
  inquilinoId: string;
  tipo: string;
  valor: string;
  pagaEm: string | null;
  /** A condição especial da barbearia (D-190), se houver. */
  campanha?: string | null;
}) {
  const router = useRouter();
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  const { register, handleSubmit, getValues } = useForm<DadosImplementacao>({
    resolver: zodResolver(esquemaImplementacao, undefined, { raw: true }),
    defaultValues: { tipo: p.tipo as DadosImplementacao["tipo"], valor: p.valor },
  });
  const enviar = handleSubmit(
    () =>
      iniciar(async () => {
        const r = await guardarImplementacao(p.inquilinoId, getValues());
        setAviso(
          r.ok
            ? { tipo: "sucesso", texto: t.guardado }
            : { tipo: "erro", texto: t.erros[r.erro] ?? t.erros.generico! },
        );
        if (r.ok) router.refresh();
      }),
    () => setAviso({ tipo: "erro", texto: t.erros.valor! }),
  );
  return (
    <form
      onSubmit={enviar}
      className="cartao grid gap-3 rounded-2xl p-4"
      noValidate
      data-testid="implementacao"
    >
      <h3 className="text-sm font-bold">{t.implementacao}</h3>
      {p.campanha ? (
        <p className="text-xs font-semibold" data-testid="campanha-barbearia">
          {t.campanha(p.campanha)}
        </p>
      ) : null}
      <p className="text-xs text-muted-foreground">
        {p.pagaEm ? t.paga(p.pagaEm) : t.implementacaoAjuda}
      </p>
      {aviso ? <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso> : null}
      <fieldset disabled={!!p.pagaEm} className="grid gap-3 sm:grid-cols-2">
        <label className="grid min-w-0 gap-1.5">
          <span className="rotulo">{t.tipo}</span>
          <select
            {...register("tipo")}
            className="h-11 w-full min-w-0 rounded-md border border-input bg-campo px-3 text-sm"
          >
            {IMPLEMENTACOES.map((i) => (
              <option key={i} value={i}>
                {t.tipos[i]}
              </option>
            ))}
          </select>
        </label>
        <Campo
          id="implementacao-valor"
          inputMode="decimal"
          rotulo={t.valor}
          {...register("valor")}
        />
      </fieldset>
      {p.pagaEm ? null : (
        <Button type="submit" disabled={aGuardar} className="justify-self-start">
          {t.guardarImplementacao}
        </Button>
      )}
    </form>
  );
}
