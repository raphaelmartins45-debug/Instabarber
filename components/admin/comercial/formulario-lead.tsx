"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { type Resolver, useForm } from "react-hook-form";
import {
  atualizar,
  criar,
  procurarSemelhantes,
} from "@/app/(admin)/admin/(protegido)/comercial/acoes";
import { CamposProspecao } from "@/components/admin/comercial/campos-prospecao";
import { LeadsSemelhantes } from "@/components/admin/comercial/leads-semelhantes";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import type { LeadSemelhante } from "@/lib/repositorios/comercial/leads";
import {
  type DadosLead,
  type DadosNovoLead,
  esquemaLead,
  esquemaNovoLead,
  ORIGENS,
} from "@/lib/validacao/comercial";

const t = textos.comercial;
const CAMPOS = [
  "nome_contacto",
  "nome_barbearia",
  "cidade",
  "telefone",
  "email",
  "n_barbeiros",
] as const;

const VAZIO: DadosNovoLead = {
  nome_contacto: "",
  nome_barbearia: "",
  cidade: "",
  telefone: "",
  email: "",
  n_barbeiros: "",
  origem: "whatsapp",
  instagram: "",
  morada: "",
  google_nota: "",
  google_avaliacoes: "",
  contacto_cargo: "",
  fala_com_decisor: false,
  origem_detalhe: "",
  consentimento_contacto: false,
  cadeiras: "",
  como_marcam: "",
  sistema_atual: "",
  custo_atual: "",
  fim_contrato_atual: "",
  temperatura: "",
  proxima_acao: "",
  proxima_acao_em: "",
};

/**
 * Dados do lead (N.3) e ficha de prospeção (D-174): pelo menos o telemóvel ou o e-mail. Cria um
 * lead novo (com a próxima ação e o aviso de duplicados) ou edita um.
 */
export function FormularioLead({ id, inicial }: { id?: string; inicial?: DadosLead }) {
  const router = useRouter();
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [semelhantes, setSemelhantes] = useState<LeadSemelhante[]>([]);
  const [aGuardar, iniciar] = useTransition();
  const { register, handleSubmit, formState, getValues } = useForm<DadosNovoLead>({
    resolver: zodResolver(id ? esquemaLead : esquemaNovoLead) as Resolver<DadosNovoLead>,
    defaultValues: inicial ? { ...VAZIO, ...inicial } : VAZIO,
  });
  const erro = (c?: string) => (c ? (t.erros[c] ?? t.erros.generico) : undefined);

  const verificar = () => {
    if (id) return;
    const v = getValues();
    procurarSemelhantes(v.telefone ?? "", v.instagram ?? "", v.morada ?? "")
      .then(setSemelhantes)
      .catch(() => setSemelhantes([]));
  };

  const enviar = handleSubmit(() =>
    iniciar(async () => {
      const r = id ? await atualizar(id, getValues()) : await criar(getValues());
      if (!r.ok) return setAviso({ tipo: "erro", texto: erro(r.erro)! });
      if (!id && r.id) return router.push(`/admin/comercial/leads/${r.id}`);
      setAviso({ tipo: "sucesso", texto: t.ficha.guardado });
      router.refresh();
    }),
  );

  return (
    <form onSubmit={enviar} noValidate className="cartao grid gap-4 rounded-2xl p-5">
      {aviso ? <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {CAMPOS.map((c) => (
          <Campo
            key={c}
            id={`lead-${c}`}
            rotulo={t.campos[c]!}
            type={c === "email" ? "email" : c === "telefone" ? "tel" : "text"}
            autoComplete="off"
            erro={erro(formState.errors[c]?.message)}
            {...register(c, c === "telefone" ? { onBlur: verificar } : {})}
          />
        ))}
        <label className="grid gap-1.5">
          <span className="rotulo">{t.campos.origem}</span>
          <select
            id="lead-origem"
            {...register("origem")}
            className="h-11 rounded-lg border border-input bg-card px-3 text-sm"
          >
            {ORIGENS.map((o) => (
              <option key={o} value={o}>
                {t.origens[o]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <LeadsSemelhantes leads={semelhantes} />
      <CamposProspecao
        register={register}
        errors={formState.errors}
        erro={erro}
        novo={!id}
        aoSairDeContacto={verificar}
      />
      <Button type="submit" className="h-11 justify-self-start" disabled={aGuardar}>
        {id ? t.ficha.guardar : t.criar}
      </Button>
    </form>
  );
}
