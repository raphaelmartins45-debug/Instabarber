"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { atualizar, criar } from "@/app/(admin)/admin/(protegido)/comercial/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import { type DadosLead, esquemaLead, ORIGENS } from "@/lib/validacao/comercial";

const t = textos.comercial;
const CAMPOS = [
  "nome_contacto",
  "nome_barbearia",
  "cidade",
  "telefone",
  "email",
  "n_barbeiros",
] as const;

/** Dados do lead (N.3): pelo menos o telemóvel ou o e-mail. Cria um lead novo ou edita um. */
export function FormularioLead({ id, inicial }: { id?: string; inicial?: DadosLead }) {
  const router = useRouter();
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  const { register, handleSubmit, formState, getValues } = useForm<DadosLead>({
    resolver: zodResolver(esquemaLead),
    defaultValues: inicial ?? {
      nome_contacto: "",
      nome_barbearia: "",
      cidade: "",
      telefone: "",
      email: "",
      n_barbeiros: "",
      origem: "whatsapp",
    },
  });
  const erro = (c?: string) => (c ? (t.erros[c] ?? t.erros.generico) : undefined);

  const enviar = handleSubmit(() =>
    iniciar(async () => {
      const r = id ? await atualizar(id, getValues()) : await criar(getValues());
      if (!r.ok) return setAviso({ tipo: "erro", texto: erro(r.erro)! });
      if (!id && r.id) return router.push(`/admin/comercial/leads/${r.id}`);
      setAviso({ tipo: "sucesso", texto: t.ficha.guardado });
      router.refresh();
    }),
  );

  return (
    <form onSubmit={enviar} noValidate className="cartao grid gap-4 rounded-2xl p-5">
      {aviso ? <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {CAMPOS.map((c) => (
          <Campo
            key={c}
            id={`lead-${c}`}
            rotulo={t.campos[c]!}
            type={c === "email" ? "email" : c === "telefone" ? "tel" : "text"}
            autoComplete="off"
            erro={erro(formState.errors[c]?.message)}
            {...register(c)}
          />
        ))}
        <label className="grid gap-1.5">
          <span className="rotulo">{t.campos.origem}</span>
          <select
            {...register("origem")}
            className="h-11 rounded-lg border border-input bg-card px-3 text-sm"
          >
            {ORIGENS.map((o) => (
              <option key={o} value={o}>
                {t.origens[o]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <Button type="submit" className="h-11 justify-self-start" disabled={aGuardar}>
        {id ? t.ficha.guardar : t.criar}
      </Button>
    </form>
  );
}
