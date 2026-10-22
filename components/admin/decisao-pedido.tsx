"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { aprovar, rejeitar } from "@/app/(admin)/admin/(protegido)/pedidos/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { ConfirmarAcao } from "@/components/nucleo/confirmar-acao";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import { INCLUIDOS, type Periodicidade, type Plano } from "@/lib/regras/mensalidade";

const t = textos.admin.pedidos;
const ERROS = {
  ja_decidido: t.jaDecidido,
  slug: textos.admin.ficha.erros.slug,
  profissionais: textos.admin.ficha.erros.profissionais,
  falhou: t.erroAprovar,
};

/** Aprovar (com ajustes opcionais) ou rejeitar com motivo (E.1, D.8.2). */
export function DecisaoPedido(props: {
  pedidoId: string;
  slugSugerido: string;
  plano: Plano;
  periodicidade: Periodicidade;
  profissionais: number;
}) {
  const router = useRouter();
  const [ajustar, setAjustar] = useState(false);
  const [slug, setSlug] = useState(props.slugSugerido);
  const [plano, setPlano] = useState(props.plano);
  const [periodicidade, setPeriodicidade] = useState(props.periodicidade);
  const [profissionais, setProfissionais] = useState(String(props.profissionais));
  const [motivo, setMotivo] = useState("");
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();

  const confirmarAprovacao = () =>
    iniciar(async () => {
      const r = await aprovar(
        props.pedidoId,
        ajustar ? { slug, plano, periodicidade, profissionais: Number(profissionais) } : {},
      );
      if (!r.ok) return setAviso({ tipo: "erro", texto: ERROS[r.erro] });
      setAviso({
        tipo: r.emailEnviado ? "sucesso" : "erro",
        texto: r.emailEnviado ? t.aprovado : t.aprovadoSemEmail,
      });
      router.push(`/admin/barbearias/${r.inquilinoId}`);
    });
  const confirmarRejeicao = () =>
    iniciar(async () => {
      if (motivo.trim().length < 3) return setAviso({ tipo: "erro", texto: t.erroMotivo });
      const r = await rejeitar(props.pedidoId, motivo);
      setAviso(
        r.ok ? { tipo: "sucesso", texto: t.rejeitado } : { tipo: "erro", texto: t.jaDecidido },
      );
      if (r.ok) router.push("/admin/pedidos");
    });

  return (
    <section className="grid gap-4 rounded-lg border bg-card p-4">
      {aviso ? <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso> : null}
      {ajustar ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo
            id="slug"
            rotulo={textos.admin.ficha.campos.slug}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <Campo
            id="profissionais"
            rotulo={textos.admin.ficha.campos.profissionais_contratados}
            inputMode="numeric"
            value={profissionais}
            onChange={(e) => setProfissionais(e.target.value)}
          />
          <label className="grid gap-1.5 text-sm">
            <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              {textos.admin.ficha.campos.plano}
            </span>
            <select
              className="h-11 rounded-md border bg-card px-3"
              value={plano}
              onChange={(e) => (
                setPlano(e.target.value as Plano),
                setProfissionais(String(INCLUIDOS[e.target.value as Plano]))
              )}
            >
              <option value="basic">{textos.admin.planos.basic}</option>
              <option value="pro">{textos.admin.planos.pro}</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              {textos.admin.ficha.campos.periodicidade}
            </span>
            <select
              className="h-11 rounded-md border bg-card px-3"
              value={periodicidade}
              onChange={(e) => setPeriodicidade(e.target.value as Periodicidade)}
            >
              <option value="mensal">{textos.admin.periodicidades.mensal}</option>
              <option value="anual">{textos.admin.periodicidades.anual}</option>
            </select>
          </label>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <ConfirmarAcao
          titulo={t.aprovar}
          descricao={t.confirmarAprovar}
          confirmar={t.aprovar}
          aoConfirmar={confirmarAprovacao}
          destrutiva={false}
        >
          <Button size="lg" className="h-11 bg-sucesso hover:bg-sucesso/90" disabled={aGuardar}>
            {t.aprovar}
          </Button>
        </ConfirmarAcao>
        {!ajustar ? (
          <Button size="lg" variant="outline" className="h-11" onClick={() => setAjustar(true)}>
            {t.ajustar}
          </Button>
        ) : null}
      </div>
      <div className="grid gap-2 border-t pt-4">
        <Campo
          id="motivo"
          rotulo={t.motivo}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />
        <ConfirmarAcao
          titulo={t.rejeitar}
          descricao={motivo || t.erroMotivo}
          confirmar={t.rejeitar}
          aoConfirmar={confirmarRejeicao}
        >
          <Button
            variant="outline"
            className="h-11 justify-self-start text-destructive"
            disabled={aGuardar || motivo.trim().length < 3}
          >
            {t.rejeitar}
          </Button>
        </ConfirmarAcao>
      </div>
    </section>
  );
}
