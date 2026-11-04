"use client";

import { useRef, useState, useTransition } from "react";
import {
  gerarDemonstracao,
  novoCodigo,
  reenviarConvite,
  reporDemonstracao,
  type Convite,
  type Resultado,
} from "@/app/(admin)/admin/(protegido)/comercial/demo/acoes";
import { CodigoDemonstracao } from "@/components/admin/vendas/codigo-demonstracao";
import { LeadDemonstracao, type LeadOpcao } from "@/components/admin/vendas/lead-demonstracao";
import {
  LigacoesDemonstracao,
  VersaoDemonstracao,
} from "@/components/admin/vendas/partes-demonstracao";
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
export function ConfigurarDemonstracao({
  demo,
  leads,
}: {
  demo: Demonstracao | null;
  leads: LeadOpcao[];
}) {
  const formulario = useRef<HTMLFormElement>(null);
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [codigo, setCodigo] = useState<string | null>(null);
  const [convite, setConvite] = useState<{ lead: string; dados: Convite } | null>(null);
  const preencher = (lead: LeadOpcao | null) => {
    const campos = formulario.current?.elements;
    const definir = (nome: string, valor: string) => {
      const campo = campos?.namedItem(nome);
      if (campo instanceof HTMLInputElement) campo.value = valor;
    };
    if (lead) {
      definir("nome", lead.barbearia);
      definir("cidade", lead.cidade ?? "");
    }
  };
  const [aCorrer, iniciar] = useTransition();
  const personalizada = demo && demo.nome !== "Barbearia Demonstração";
  const correr = (acao: () => Promise<Resultado>, ok: string) =>
    iniciar(async () => {
      const r = await acao();
      if (r.ok) {
        setCodigo(r.codigo ?? null);
        if (r.convite !== undefined) {
          const lead = formulario.current?.elements.namedItem("lead");
          const id = lead instanceof HTMLSelectElement ? lead.value : "";
          setConvite(r.convite && id ? { lead: id, dados: r.convite } : null);
        }
      }
      setAviso(
        r.ok ? { tipo: "sucesso", texto: ok } : { tipo: "erro", texto: t.erros[r.erro] ?? t.erro },
      );
      if (r.ok && acao === reporDemonstracao) {
        formulario.current?.reset();
        setConvite(null);
      }
    });
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
        {demo ? (
          <CodigoDemonstracao
            codigo={codigo}
            aCorrer={aCorrer}
            onNovo={() => correr(novoCodigo, t.codigoNovo)}
            convite={convite?.dados ?? null}
            onReenviar={
              convite && codigo
                ? () => correr(() => reenviarConvite(convite.lead, codigo), t.gerada)
                : undefined
            }
          />
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          <LeadDemonstracao leads={leads} onEscolher={preencher} />
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
        <VersaoDemonstracao />
      </form>
      <LigacoesDemonstracao />
    </div>
  );
}
