import { Aviso } from "@/components/nucleo/aviso";
import { Etiqueta, type TomEtiqueta } from "@/components/nucleo/etiqueta";
import type { Briefing } from "@/lib/comercial/briefing";
import type { DadosContratante } from "@/lib/comercial/contrato";
import { dataCurta, hojeIso } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import type { Contrato } from "@/lib/repositorios/comercial/contratos";
import type { Lead } from "@/lib/repositorios/comercial/leads";
import type { Proposta } from "@/lib/repositorios/comercial/propostas";
import { AcoesContrato } from "./acoes-contrato";
import { AssinarContrato } from "./assinar-contrato";
import { AvisoContrato } from "./aviso-contrato";
import { ConferirContrato } from "./conferir-contrato";
import { ConviteAdesao } from "./convite-adesao";
import { EnviarContrato } from "./enviar-contrato";
import { GerarContrato } from "./gerar-contrato";

const t = textos.comercial.contratos;

export const TOM_CONTRATO: Record<string, TomEtiqueta> = {
  rascunho: "neutro",
  enviado: "info",
  carregado: "alerta",
  assinado: "sucesso",
  terminado: "neutro",
  cancelado: "neutro",
};

/** Os dados do contratante saem do briefing; o operador confirma-os antes de gerar. */
const contratanteDoBriefing = (b: Briefing, lead: Lead): DadosContratante => ({
  razao_social: b.firma || b.nome_comercial,
  nif: b.nif,
  morada: b.morada,
  representante: b.decisor_nome || lead.nome_contacto,
  cargo: b.decisor_cargo,
  email: b.decisor_email || lead.email || "",
  data_inicio: /^\d{4}-\d{2}-\d{2}$/.test(b.data_arranque) ? b.data_arranque : hojeIso(),
});

/**
 * Secção «Contratos» da ficha (N.6, N.7, D-181): gerar, enviar ao cliente por e-mail, conferir o
 * que ele carregou, assinar e convidar para a adesão.
 */
export function ContratosLead({
  lead,
  briefing,
  propostas,
  contratos,
  haModelo,
}: {
  lead: Lead;
  briefing: Briefing;
  propostas: Proposta[];
  contratos: Contrato[];
  haModelo: boolean;
}) {
  const aceite = propostas.find((p) => p.estado_efetivo === "aceite");
  const assinado = contratos.some((c) => c.estado === "assinado");
  const emCurso = contratos.some((c) => ["rascunho", "enviado", "carregado"].includes(c.estado));
  const formulario =
    aceite && !assinado ? (
      <GerarContrato
        leadId={lead.id}
        propostaId={aceite.id!}
        numero={aceite.numero ?? ""}
        inicial={contratanteDoBriefing(briefing, lead)}
      />
    ) : null;
  return (
    <div className="grid gap-3">
      <AvisoContrato />
      {aceite && !assinado && !haModelo ? <Aviso tipo="erro">{t.semModelo}</Aviso> : null}
      {formulario && haModelo ? (
        emCurso ? (
          <details>
            <summary className="cursor-pointer text-sm text-ligacao underline">{t.regerar}</summary>
            <div className="pt-3">{formulario}</div>
          </details>
        ) : (
          formulario
        )
      ) : null}
      {!contratos.length && !aceite ? (
        <p className="text-sm text-muted-foreground">{t.vazio}</p>
      ) : null}
      <ul className="grid gap-3">
        {contratos.map((c) => (
          <li key={c.id} className="cartao grid gap-3 rounded-2xl p-4" data-testid="contrato">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">{c.numero}</p>
              <Etiqueta tom={TOM_CONTRATO[c.estado] ?? "neutro"}>{t.estados[c.estado]}</Etiqueta>
            </div>
            {c.assinado_em ? (
              <p className="text-sm text-muted-foreground">
                {t.assinado(dataCurta(`${c.assinado_em}T12:00:00Z`))}
              </p>
            ) : null}
            {c.estado !== "cancelado" ? (
              <AcoesContrato leadId={lead.id} id={c.id} estado={c.estado} />
            ) : null}
            {c.estado === "enviado" && c.recusa_motivo ? (
              <p className="text-sm text-alerta" data-testid="contrato-recusado">
                {textos.contratoCliente.equipa.ultimaRecusa(c.recusa_motivo)}
              </p>
            ) : null}
            {c.estado === "rascunho" || c.estado === "enviado" ? (
              <>
                <EnviarContrato
                  leadId={lead.id}
                  id={c.id}
                  email={(c.dados as { email?: string }).email || null}
                  enviadoEm={c.enviado_cliente_em}
                />
                <AssinarContrato leadId={lead.id} id={c.id} />
              </>
            ) : null}
            {c.estado === "carregado" ? (
              <ConferirContrato leadId={lead.id} id={c.id} hoje={hojeIso()} />
            ) : null}
            {c.estado === "assinado" ? (
              c.inquilino_id ? (
                <p className="text-sm text-sucesso">{t.ligado}</p>
              ) : (
                <ConviteAdesao
                  leadId={lead.id}
                  id={c.id}
                  nome={briefing.decisor_nome || lead.nome_contacto}
                  telefone={lead.telefone}
                />
              )
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
