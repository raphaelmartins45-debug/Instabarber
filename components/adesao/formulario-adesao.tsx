"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Aviso } from "@/components/nucleo/aviso";
import { Button } from "@/components/ui/button";
import { dadosDoResumo, type Catalogo, type Pacotes } from "@/lib/adesao/resumo";
import { VALORES_VAZIOS } from "@/lib/adesao/convite";
import { textoErro } from "@/lib/adesao/erros";
import { textos } from "@/lib/i18n/pt-PT";
import type { DadosResumo } from "@/lib/pdf/resumo-contratacao";
import type { RegimeIva } from "@/lib/regras/mensalidade";
import { esquemaPedidoAdesao, type DadosPedidoAdesao } from "@/lib/validacao/adesao";
import { IndicadorPassos } from "./indicador-passos";
import { PassoContactos } from "./passo-contactos";
import { PassoContratacao } from "./passo-contratacao";
import { PassoIdentidade } from "./passo-identidade";
import { PassoServicos } from "./passo-servicos";
import { PedidoEnviado } from "./pedido-enviado";

const t = textos.adesao;
const PASSOS = ["identidade", "contactos", "servicos", "contratacao"] as const;

/** Formulário de adesão em quatro passos (D.8). Cada passo valida antes de avançar. */
export function FormularioAdesao(props: {
  catalogo: Catalogo;
  pacotes: Pacotes;
  regime: RegimeIva;
  pasta: string;
  hoje: string;
  /** Valores do convite do Comercial (N.7) e o código, que segue no envio. */
  inicial?: DadosPedidoAdesao;
  convite?: string;
}) {
  const [passo, setPasso] = useState(0);
  const [erro, setErro] = useState<string>();
  const [resumo, setResumo] = useState<DadosResumo>();
  const [aEnviar, iniciar] = useTransition();
  const form = useForm<DadosPedidoAdesao>({
    resolver: zodResolver(esquemaPedidoAdesao),
    defaultValues: props.inicial ?? VALORES_VAZIOS,
  });

  const avancar = async () => {
    if (await form.trigger(PASSOS[passo])) {
      setPasso((p) => p + 1);
      window.scrollTo({ top: 0 });
    }
  };

  // O validador do formulário devolve os valores já transformados; o servidor valida o que a
  // pessoa escreveu, com o mesmo esquema, por isso envia-se form.getValues().
  const enviar = form.handleSubmit(() =>
    iniciar(async () => {
      setErro(undefined);
      const dados = form.getValues();
      const resposta = await fetch("/api/adesoes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(props.convite ? { ...dados, convite: props.convite } : dados),
      });
      if (!resposta.ok) return setErro(textoErro(resposta.status === 429 ? "limite" : "envio"));
      const v = esquemaPedidoAdesao.parse(dados);
      setResumo(
        dadosDoResumo(
          { ...v.identidade, ...v.contratacao },
          props.catalogo,
          props.pacotes,
          props.regime,
          props.hoje,
        ),
      );
    }),
  );

  if (resumo) return <PedidoEnviado resumo={resumo} />;

  return (
    <FormProvider {...form}>
      <form onSubmit={enviar} className="grid gap-6" noValidate>
        <IndicadorPassos atual={passo} />
        <h2 className="text-xl font-extrabold">{t.passos[passo]}</h2>
        {/* Campo-isco: invisível para pessoas. */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="hidden"
          {...form.register("website")}
        />
        <div hidden={passo !== 0}>
          <PassoIdentidade pasta={props.pasta} />
        </div>
        <div hidden={passo !== 1}>
          <PassoContactos />
        </div>
        <div hidden={passo !== 2}>
          <PassoServicos />
        </div>
        <div hidden={passo !== 3}>
          <PassoContratacao
            catalogo={props.catalogo}
            pacotes={props.pacotes}
            regime={props.regime}
          />
        </div>
        {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          {passo > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-11"
              onClick={() => setPasso((p) => p - 1)}
            >
              {t.anterior}
            </Button>
          ) : (
            <span />
          )}
          {passo < PASSOS.length - 1 ? (
            <Button type="button" size="lg" className="h-11" onClick={avancar}>
              {t.seguinte}
            </Button>
          ) : (
            <Button type="submit" size="lg" className="h-11" disabled={aEnviar}>
              {t.enviar}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
