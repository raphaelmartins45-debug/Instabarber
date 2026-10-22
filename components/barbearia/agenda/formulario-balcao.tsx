"use client";

import { useEffect, useState, useTransition } from "react";
import { marcarAoBalcao, vagasLivres } from "@/app/(app)/app/(painel)/agenda/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { horaCurta, instanteLocal } from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { Selecao } from "@/components/nucleo/selecao";
import { CampoCliente, type ClienteEncontrado } from "./campo-cliente";

const t = textos.agenda.balcao;
const erros = textos.agenda.erros;

type Opcao = { id: string; rotulo: string };

/**
 * Marcar ao balcão (cliente pelo telemóvel ou novo, serviço, profissional, hora das vagas livres)
 * ou registar um serviço feito agora (marca e conclui). A base de dados valida a vaga e o preço.
 */
export function FormularioBalcao({
  modo,
  servicos,
  profissionais,
  inicial,
  hoje,
  horaAgora,
  depois,
}: {
  modo: "marcar" | "registar";
  servicos: (Opcao & { precoCent: number })[];
  profissionais: Opcao[];
  inicial: { profissionalId?: string; dia?: string; inicio?: string };
  hoje: string;
  horaAgora: string;
  /** Para onde ir depois de gravar. */
  depois: string;
}) {
  const [v, setV] = useState({
    telefone: "",
    nome: "",
    consentimento: false,
    servicoId: servicos[0]?.id ?? "",
    profissionalId: inicial.profissionalId ?? profissionais[0]?.id ?? "",
    dia: inicial.dia ?? hoje,
    inicio: inicial.inicio ?? "",
    hora: horaAgora,
    valor: "",
  });
  const [cliente, setCliente] = useState<ClienteEncontrado>();
  const [vagas, setVagas] = useState<string[]>([]);
  const [erro, setErro] = useState<string>();
  const [aGuardar, iniciar] = useTransition();
  const muda = (campo: keyof typeof v, valor: string | boolean) =>
    setV((x) => ({ ...x, [campo]: valor }));

  useEffect(() => {
    if (modo !== "marcar" || !v.servicoId || !v.profissionalId || !v.dia) return;
    let ativo = true;
    void vagasLivres(v.servicoId, v.dia, v.profissionalId).then((lista) => {
      if (!ativo) return;
      setVagas(lista);
      setV((x) => (lista.includes(x.inicio) ? x : { ...x, inicio: "" }));
    });
    return () => {
      ativo = false;
    };
  }, [modo, v.servicoId, v.profissionalId, v.dia]);

  const enviar = () =>
    iniciar(async () => {
      const inicio = modo === "marcar" ? v.inicio : instanteLocal(hoje, v.hora).toISOString();
      if (!inicio) return setErro(erros.hora);
      const r = await marcarAoBalcao({
        modo,
        telefone: v.telefone,
        nome: v.nome,
        consentimento: v.consentimento,
        servicoId: v.servicoId,
        profissionalId: v.profissionalId,
        inicio,
        valor: modo === "registar" ? v.valor : undefined,
      });
      if (r.ok) window.location.assign(depois);
      else setErro(erros[r.erro] ?? erros.erro);
    });

  return (
    <form className="grid max-w-xl gap-4" onSubmit={(e) => (e.preventDefault(), enviar())}>
      <CampoCliente
        telefone={v.telefone}
        nome={v.nome}
        consentimento={v.consentimento}
        cliente={cliente}
        aoMudar={muda}
        aoEncontrar={setCliente}
      />
      <Selecao
        id="servico"
        rotulo={t.servico}
        valor={v.servicoId}
        aoMudar={(x) => muda("servicoId", x)}
        opcoes={servicos.map((s) => ({
          id: s.id,
          rotulo: `${s.rotulo} · ${formatarDinheiro(s.precoCent)}`,
        }))}
      />
      {profissionais.length > 1 ? (
        <Selecao
          id="profissional"
          rotulo={t.profissional}
          valor={v.profissionalId}
          aoMudar={(x) => muda("profissionalId", x)}
          opcoes={profissionais}
        />
      ) : null}
      {modo === "marcar" ? (
        <>
          <Campo
            id="dia"
            rotulo={t.dia}
            type="date"
            value={v.dia}
            onChange={(e) => muda("dia", e.target.value)}
          />
          {vagas.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.semVagas}</p>
          ) : (
            <Selecao
              id="hora"
              rotulo={t.hora}
              valor={v.inicio}
              aoMudar={(x) => muda("inicio", x)}
              opcoes={[
                { id: "", rotulo: t.escolherHora },
                ...vagas.map((x) => ({ id: x, rotulo: horaCurta(x) })),
              ]}
            />
          )}
        </>
      ) : (
        <>
          <Campo
            id="hora"
            rotulo={t.hora}
            type="time"
            value={v.hora}
            onChange={(e) => muda("hora", e.target.value)}
          />
          <Campo
            id="valor"
            rotulo={textos.agenda.concluir.valor}
            ajuda={textos.agenda.concluir.valorAjuda}
            inputMode="decimal"
            value={v.valor}
            onChange={(e) => muda("valor", e.target.value)}
          />
        </>
      )}
      {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}
      <Button
        type="submit"
        className="h-11 w-full sm:w-auto sm:justify-self-start"
        disabled={aGuardar}
      >
        {modo === "marcar" ? t.marcar_botao : t.registar_botao}
      </Button>
    </form>
  );
}
