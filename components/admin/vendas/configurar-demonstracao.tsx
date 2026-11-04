"use client";

import { ExternalLink } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import {
  gerarDemonstracao,
  reporDemonstracao,
} from "@/app/(admin)/admin/(protegido)/comercial/demo/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import { ESTILOS } from "@/lib/publico/estilos";
import type { Demonstracao } from "@/lib/repositorios/admin/demonstracao";

const t = textos.comercial.demonstracao;
const rotuloModelo = textos.sistema.marca.estilos;

/**
 * Preparar a demonstração para uma reunião (D-207): «Gerar» com o nome, o logótipo, a cor, a
 * versão, a cidade, o WhatsApp de teste e o modelo; «Reset» para a deixar livre. Por baixo, as
 * ligações para abrir cada vista numa janela nova.
 */
export function ConfigurarDemonstracao({ demo }: { demo: Demonstracao | null }) {
  const formulario = useRef<HTMLFormElement>(null);
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aCorrer, iniciar] = useTransition();
  const personalizada = demo && demo.nome !== "Barbearia Demonstração";
  const correr = (acao: () => Promise<{ ok: true } | { ok: false; erro: string }>, ok: string) =>
    iniciar(async () => {
      const r = await acao();
      setAviso(
        r.ok ? { tipo: "sucesso", texto: ok } : { tipo: "erro", texto: t.erros[r.erro] ?? t.erro },
      );
      if (r.ok && acao === reporDemonstracao) formulario.current?.reset();
    });
  const ligacao = (href: string, rotulo: string) => (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className="flex h-11 items-center justify-between gap-2 rounded-lg border bg-card px-4 text-sm font-semibold hover:bg-campo"
    >
      {rotulo}
      <ExternalLink aria-hidden className="size-4 text-muted-foreground" />
    </a>
  );
  return (
    <div className="grid gap-6" data-testid="demonstracao">
      <p className="text-sm text-muted-foreground">{t.ajuda}</p>
      <form
        ref={formulario}
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const dados = new FormData(e.currentTarget);
          correr(() => gerarDemonstracao(dados), t.gerada);
        }}
      >
        <div className="flex flex-wrap gap-2">
          <Button type="submit" className="h-11 px-6" disabled={aCorrer}>
            {t.gerar}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 px-6"
            disabled={aCorrer}
            onClick={() => correr(reporDemonstracao, t.reposta)}
          >
            {t.reset}
          </Button>
        </div>
        {aviso ? <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <Campo
            id="demo-nome"
            name="nome"
            rotulo={t.nome}
            required
            maxLength={60}
            defaultValue={personalizada ? demo.nome : ""}
          />
          <Campo
            id="demo-cidade"
            name="cidade"
            rotulo={t.cidade}
            maxLength={60}
            defaultValue={personalizada ? (demo.cidade ?? "") : ""}
          />
          <div className="grid gap-1.5">
            <Campo
              id="demo-logo"
              name="logo"
              type="file"
              rotulo={t.logo}
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
            />
            {personalizada && demo.logo_url ? (
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                {/* eslint-disable-next-line @next/next/no-img-element -- imagem pública do Storage */}
                <img src={demo.logo_url} alt="" className="h-8 w-auto rounded" />
                {t.logoAtual}
              </span>
            ) : null}
          </div>
          <Campo
            id="demo-cor"
            name="cor"
            type="color"
            rotulo={t.cor}
            ajuda={t.corAjuda}
            defaultValue={personalizada ? (demo.capa_cor ?? "#111111") : "#111111"}
          />
          <Campo
            id="demo-whatsapp"
            name="whatsapp"
            rotulo={t.whatsapp}
            ajuda={t.whatsappAjuda}
            inputMode="tel"
            defaultValue={personalizada ? (demo.whatsapp ?? "") : ""}
          />
          <label className="grid gap-1.5">
            <span className="rotulo">{t.modelo}</span>
            <select
              name="estilo"
              defaultValue={personalizada ? demo.estilo_pagina : "anuario"}
              className="h-11 rounded-md border bg-card px-3 text-sm"
            >
              {ESTILOS.map((e) => (
                <option key={e} value={e}>
                  {rotuloModelo[e]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <fieldset className="grid gap-2">
          <legend className="rotulo mb-1.5">{t.versao}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {(["basic", "pro"] as const).map((p) => (
              <label
                key={p}
                className="flex cursor-pointer items-start gap-3 rounded-lg border bg-card p-3 has-[:checked]:border-primary"
              >
                <input
                  type="radio"
                  name="plano"
                  value={p}
                  defaultChecked={p === "pro"}
                  className="mt-1"
                />
                <span className="grid">
                  <span className="font-semibold">{t[p]}</span>
                  <span className="text-xs text-muted-foreground">{t[`${p}Ajuda`]}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </form>
      <section className="grid gap-2">
        <h2 className="text-sm font-bold">{t.ligacoes}</h2>
        <p className="text-xs text-muted-foreground">{t.ligacoesAjuda}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {ligacao("/demo", t.inicioDemo)}
          {ligacao("/demo/gestor", t.vistaGestor)}
          {ligacao("/demo/barbeiro", t.vistaBarbeiro)}
          {ligacao("/demo/publica", t.vistaPublica)}
        </div>
      </section>
    </div>
  );
}
