"use client";

import { useEffect, useState, useTransition } from "react";
import { confirmar, reservar, vagasDoDia } from "@/app/(publico)/b/[slug]/marcar/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { somarDias } from "@/lib/formatacao/datas";
import { textosPublicos, type Lingua } from "@/lib/i18n/publico";
import type { Reserva, VagaPublica } from "@/lib/repositorios/marcacao-publica";
import { Confirmacao } from "./confirmacao";
import { Contagem } from "./contagem";
import { PassoDados, type DadosCliente } from "./passo-dados";
import { PassoHora } from "./passo-hora";
import { PassoBarbeiro, PassoServico } from "./passos-escolha";
import type { BarbeariaMarcacao, BarbeiroMarcacao, ServicoMarcacao } from "./tipos";

type Passo = "servico" | "barbeiro" | "hora" | "dados" | "feita";

/** A marcação em passos (E.4): serviço, barbeiro, dia e hora, reserva de 10 minutos, dados, confirmação. */
export function FluxoMarcacao({
  lingua,
  barbearia,
  servicos,
  equipa,
  hoje,
  inicial,
  cliente,
}: {
  lingua: Lingua;
  barbearia: BarbeariaMarcacao;
  servicos: ServicoMarcacao[];
  equipa: BarbeiroMarcacao[];
  hoje: string;
  inicial: { servicoId?: string; profissionalId?: string; repetir?: boolean };
  cliente: { nome: string; telefone: string; email: string } | null;
}) {
  const t = textosPublicos(lingua);
  const m = t.marcacao;
  const umSo = equipa.length === 1 ? equipa[0]!.id : undefined;
  const servicoInicial = servicos.find((s) => s.id === inicial.servicoId);
  const barbeiroInicial = equipa.find((b) => b.id === inicial.profissionalId)?.id ?? umSo;
  const [passo, setPasso] = useState<Passo>(
    servicoInicial ? (barbeiroInicial ? "hora" : "barbeiro") : "servico",
  );
  const [servico, setServico] = useState(servicoInicial);
  const [barbeiro, setBarbeiro] = useState<string | null | undefined>(barbeiroInicial);
  const [reserva, setReserva] = useState<(Reserva & { inicio: string }) | null>(null);
  const [acesso, setAcesso] = useState<"criado" | "codigo" | null>(null);
  const [erro, setErro] = useState<string>();
  const [aEnviar, iniciar] = useTransition();
  const traduz = (codigo: string) => m.erros[codigo] ?? m.erros.erro!;

  const escolherVaga = (v: VagaPublica) =>
    iniciar(async () => {
      setErro(undefined);
      const r = await reservar(barbearia.slug, servico!.id, v.inicio, barbeiro ?? null);
      if (!r.ok) return setErro(traduz(r.erro));
      setReserva({ ...r.reserva, inicio: v.inicio });
      setPasso("dados");
    });

  // «Repetir o último serviço»: o mesmo serviço e barbeiro, no primeiro horário livre.
  useEffect(() => {
    if (!inicial.repetir || !servicoInicial || !barbeiroInicial) return;
    let ativo = true;
    void (async () => {
      for (let i = 0; i <= Math.min(barbearia.janelaDias, 30) && ativo; i++) {
        const vagas = await vagasDoDia(
          barbearia.slug,
          servicoInicial.id,
          somarDias(hoje, i),
          barbeiroInicial,
        );
        if (vagas[0]) return ativo && escolherVaga(vagas[0]);
      }
    })();
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só à entrada
  }, []);

  const enviar = (d: DadosCliente) =>
    iniciar(async () => {
      const r = await confirmar(barbearia.slug, reserva!.marcacaoId, reserva!.token, d);
      if (r.ok) {
        setAcesso(r.acesso);
        return setPasso("feita");
      }
      if (["reserva_expirada", "ocupado"].includes(r.erro)) {
        setReserva(null);
        setPasso("hora");
      }
      setErro(traduz(r.erro));
    });

  const voltar = () => {
    setErro(undefined);
    if (passo === "barbeiro") setPasso("servico");
    else if (passo === "hora") setPasso(umSo ? "servico" : "barbeiro");
    else if (passo === "dados") {
      setReserva(null);
      setPasso("hora");
    }
  };
  const nomeBarbeiro = (id: string) => equipa.find((b) => b.id === id)?.nome ?? "";

  return (
    <div className="grid gap-4">
      {passo !== "servico" && passo !== "feita" ? (
        <button
          type="button"
          onClick={voltar}
          className="h-11 justify-self-start text-sm font-semibold underline-offset-4 hover:underline"
        >
          ← {m.voltar}
        </button>
      ) : null}
      {erro && passo !== "dados" ? <Aviso tipo="erro">{erro}</Aviso> : null}
      {passo === "servico" ? (
        <PassoServico
          t={t}
          servicos={servicos}
          aoEscolher={(s) => (setServico(s), setPasso(umSo ? "hora" : "barbeiro"))}
        />
      ) : null}
      {passo === "barbeiro" ? (
        <PassoBarbeiro
          t={t}
          equipa={equipa}
          aoEscolher={(id) => (setBarbeiro(id), setPasso("hora"))}
        />
      ) : null}
      {passo === "hora" && servico ? (
        <>
          <h2 className="text-lg font-extrabold">{m.dia}</h2>
          <PassoHora
            t={t}
            lingua={lingua}
            slug={barbearia.slug}
            servicoId={servico.id}
            profissionalId={barbeiro ?? null}
            hoje={hoje}
            janelaDias={barbearia.janelaDias}
            aoEscolher={escolherVaga}
          />
        </>
      ) : null}
      {passo === "dados" && reserva ? (
        <>
          <h2 className="text-lg font-extrabold">{m.dados}</h2>
          <Contagem
            ate={reserva.reservadaAte}
            texto={m.reservada}
            aoAcabar={() => (setReserva(null), setErro(m.expirou), setPasso("hora"))}
          />
          <PassoDados
            t={t}
            inicial={cliente ?? {}}
            comConta={!!cliente}
            erro={erro}
            aEnviar={aEnviar}
            aoConfirmar={enviar}
            privacidade={barbearia.privacidade}
          />
        </>
      ) : null}
      {passo === "feita" && reserva && servico ? (
        <Confirmacao
          t={t}
          lingua={lingua}
          id={reserva.marcacaoId}
          servico={servico.nome}
          barbeiro={nomeBarbeiro(reserva.profissionalId)}
          inicio={reserva.inicio}
          fim={new Date(
            new Date(reserva.inicio).getTime() + servico.duracao * 60_000,
          ).toISOString()}
          valorCent={reserva.valorCobradoCent}
          barbearia={barbearia.nome}
          morada={barbearia.morada}
          cancelamentoMin={barbearia.cancelamentoMin}
          acesso={acesso}
          area={barbearia.area}
          nova={() => (setReserva(null), setServico(undefined), setPasso("servico"))}
        />
      ) : null}
    </div>
  );
}
