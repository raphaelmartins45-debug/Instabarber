"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { iniciarInscricao, verificarCodigo } from "@/app/(admin)/admin/dois-passos/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import { esquemaCodigoTotp } from "@/lib/validacao/acesso";

const t = textos.acesso.doisPassos;

/**
 * Com um fator já verificado, pede só o código. Sem fator, mostra o código QR para inscrever
 * a aplicação de autenticação e confirma com o primeiro código.
 */
export function FormularioDoisPassos({ fatorVerificado }: { fatorVerificado: string | null }) {
  const [inscricao, setInscricao] = useState<{ qr: string; segredo: string }>();
  const [erro, setErro] = useState<string>();
  const [aEnviar, iniciar] = useTransition();
  const { register, handleSubmit, setValue, formState } = useForm<{
    fator: string;
    codigo: string;
  }>({
    resolver: zodResolver(esquemaCodigoTotp),
    defaultValues: { fator: fatorVerificado ?? "", codigo: "" },
  });

  useEffect(() => {
    if (fatorVerificado) return;
    iniciarInscricao().then((r) => {
      if ("erro" in r) return setErro(textos.acesso.erros.generico);
      setValue("fator", r.fator);
      setInscricao({ qr: r.qr, segredo: r.segredo });
    });
  }, [fatorVerificado, setValue]);

  const enviar = handleSubmit((dados) =>
    iniciar(async () => {
      const r = await verificarCodigo(dados);
      setErro(r?.erro ? t.erroCodigo : undefined);
    }),
  );

  return (
    <form onSubmit={enviar} className="grid gap-4" noValidate>
      <p className="text-sm text-muted-foreground">{fatorVerificado ? t.desafio : t.inscrever}</p>
      {inscricao ? (
        <div className="grid justify-items-center gap-2">
          <Image src={inscricao.qr} alt="" width={180} height={180} unoptimized />
          <p className="text-xs text-muted-foreground">{t.chave}</p>
          <code data-testid="segredo-totp" className="rounded bg-muted px-2 py-1 text-xs break-all">
            {inscricao.segredo}
          </code>
        </div>
      ) : null}
      {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}
      <Campo
        id="codigo"
        rotulo={t.codigo}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        erro={formState.errors.codigo ? t.erroCodigo : undefined}
        {...register("codigo")}
      />
      <Button type="submit" size="lg" className="h-11" disabled={aEnviar}>
        {t.botao}
      </Button>
    </form>
  );
}
