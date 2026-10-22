"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { pedirCodigo } from "@/app/(publico)/b/[slug]/entrar/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import { esquemaCriarAcesso, type DadosCriarAcesso } from "@/lib/validacao/acesso";

const t = textos.acesso.cliente;
const ERROS: Record<string, string> = {
  codigo: t.erroCodigo,
  telemovel: t.erroTelemovel,
  limite: textos.acesso.erros.limite,
  fraca: textos.acesso.definir.erroFraca,
  palavra_passe_curta: textos.acesso.definir.erroCurta,
};

/**
 * Pedir o código (que a barbearia envia por WhatsApp) e, com ele, escolher a palavra-passe.
 * A rota api/acesso verifica o código e cria ou recupera a conta (F.9).
 */
export function FormularioCodigo({ slug, minhaArea }: { slug: string; minhaArea: string }) {
  const [fase, setFase] = useState<"pedir" | "codigo">("pedir");
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aEnviar, iniciar] = useTransition();
  const { register, handleSubmit, getValues, formState } = useForm<DadosCriarAcesso>({
    resolver: zodResolver(esquemaCriarAcesso),
    defaultValues: { telefone: "", codigo: "", palavra_passe: "" },
  });
  const erro = (codigo?: string) =>
    codigo ? (ERROS[codigo] ?? textos.acesso.erros.generico) : undefined;

  const pedir = () =>
    iniciar(async () => {
      const r = await pedirCodigo({ slug, telefone: getValues("telefone") });
      if ("erro" in r) return setAviso({ tipo: "erro", texto: erro(r.erro)! });
      setFase("codigo");
      setAviso({
        tipo: "sucesso",
        texto: r.foraDeHoras ? `${t.pedido} ${t.foraDeHoras}` : t.pedido,
      });
    });

  const criar = handleSubmit((dados) =>
    iniciar(async () => {
      const resposta = await fetch("/api/acesso", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...dados, slug }),
      });
      if (resposta.ok) return window.location.assign(minhaArea);
      const { erro: codigo } = (await resposta.json().catch(() => ({}))) as { erro?: string };
      setAviso({ tipo: "erro", texto: erro(codigo ?? "generico")! });
    }),
  );

  return (
    <form onSubmit={criar} className="grid gap-4" noValidate>
      <p className="text-sm text-muted-foreground">{t.pedirTexto}</p>
      {aviso ? <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso> : null}
      <Campo
        id="telefone-codigo"
        rotulo={t.telemovel}
        type="tel"
        inputMode="tel"
        placeholder={t.exemploTelemovel}
        erro={formState.errors.telefone ? t.erroTelemovel : undefined}
        {...register("telefone")}
      />
      {fase === "pedir" ? (
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-11"
          disabled={aEnviar}
          onClick={pedir}
        >
          {t.pedirBotao}
        </Button>
      ) : (
        <>
          <Campo
            id="codigo"
            rotulo={t.codigo}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            erro={erro(formState.errors.codigo ? "codigo" : undefined)}
            {...register("codigo")}
          />
          <Campo
            id="palavra_passe_nova"
            rotulo={t.novaPalavraPasse}
            type="password"
            autoComplete="new-password"
            erro={erro(formState.errors.palavra_passe?.message)}
            {...register("palavra_passe")}
          />
          <Button type="submit" size="lg" className="h-11" disabled={aEnviar}>
            {t.criarBotao}
          </Button>
        </>
      )}
    </form>
  );
}
