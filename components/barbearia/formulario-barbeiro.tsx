"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { registarBarbeiro } from "@/app/(app)/app/(painel)/sistema/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import { esquemaRegistarBarbeiro, type DadosRegistarBarbeiro } from "@/lib/validacao/barbeiro";

const t = textos.paineis.equipa;
const ERROS: Record<string, string> = { ...t.erros, generico: textos.acesso.erros.generico };

/** Nome, e-mail e NIF opcional (E.3). Ao gravar, o barbeiro recebe o convite por e-mail. */
export function FormularioBarbeiro() {
  const [resultado, setResultado] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aEnviar, iniciar] = useTransition();
  const { register, handleSubmit, formState, reset, getValues } = useForm<DadosRegistarBarbeiro>({
    resolver: zodResolver(esquemaRegistarBarbeiro),
    defaultValues: { nome: "", email: "", nif: "" },
  });
  const erro = (codigo?: string) => (codigo ? ERROS[codigo] : undefined);

  const enviar = handleSubmit(() =>
    iniciar(async () => {
      // Os valores tal como escritos: o servidor valida-os com o mesmo esquema.
      const r = await registarBarbeiro(getValues());
      if (!r.ok) return setResultado({ tipo: "erro", texto: ERROS[r.erro] ?? ERROS.generico! });
      reset();
      setResultado({
        tipo: "sucesso",
        texto: r.novo ? t.convidado(r.email) : t.jaTinhaConta(r.nome),
      });
    }),
  );

  return (
    <form onSubmit={enviar} className="grid max-w-md gap-4" noValidate>
      <h3 className="font-semibold">{t.registar}</h3>
      {resultado ? <Aviso tipo={resultado.tipo}>{resultado.texto}</Aviso> : null}
      <Campo
        id="nome"
        rotulo={t.nome}
        autoComplete="off"
        erro={erro(formState.errors.nome?.message)}
        {...register("nome")}
      />
      <Campo
        id="email"
        rotulo={t.email}
        type="email"
        autoComplete="off"
        erro={erro(formState.errors.email?.message)}
        {...register("email")}
      />
      <Campo
        id="nif"
        rotulo={t.nif}
        inputMode="numeric"
        maxLength={9}
        ajuda={t.nifAjuda}
        erro={erro(formState.errors.nif?.message)}
        {...register("nif")}
      />
      <Button type="submit" size="lg" className="h-11" disabled={aEnviar}>
        {t.botao}
      </Button>
    </form>
  );
}
