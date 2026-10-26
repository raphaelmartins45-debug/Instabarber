import { notFound, redirect } from "next/navigation";
import { FormularioBalcao } from "@/components/barbearia/agenda/formulario-balcao";
import { PainelEquipa } from "@/components/barbearia/painel-equipa";
import { obterContextoEquipa } from "@/lib/equipa/contexto";
import { hojeIso, horaCurta } from "@/lib/formatacao/datas";
import { exigirFuncionalidade } from "@/lib/funcionalidades/servidor";
import { textos } from "@/lib/i18n/pt-PT";
import { listarServicos } from "@/lib/repositorios/painel/servicos";
import { listarEquipa } from "@/lib/repositorios/profissionais";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { vertical } from "@/lib/vertical/barbearia";

const t = textos.agenda.balcao;
export const metadata = { title: `${t.tituloMarcar} · ${vertical.camadas.gestao}` };

/**
 * Marcar ao balcão ou registar um serviço feito agora. O gestor escolhe qualquer profissional;
 * o barbeiro marca só para si (E.3).
 */
export default async function MarcarBalcao({
  searchParams,
}: {
  searchParams: Promise<{ modo?: string; dia?: string; profissional?: string; inicio?: string }>;
}) {
  const contexto = await obterContextoEquipa();
  // Marcar é só escrita: na vista de apoio volta à agenda com o aviso de só leitura.
  if (contexto.apoio) redirect("/app/agenda?so_leitura=1");
  await exigirFuncionalidade(contexto.barbearia.id, "agenda_basica");
  const q = await searchParams;
  const modo = q.modo === "registar" ? "registar" : "marcar";
  const bd = await criarClienteServidor();
  const [servicos, equipa] = await Promise.all([
    listarServicos(bd, contexto.barbearia.id),
    listarEquipa(bd, contexto.barbearia.id),
  ]);
  const profissionais = equipa
    .filter((p) => p.ativo && (contexto.eGestor || p.id === contexto.profissionalId))
    .map((p) => ({ id: p.id, rotulo: p.nome_apresentado }));
  if (profissionais.length === 0) notFound();
  const inicio = q.inicio && !Number.isNaN(Date.parse(q.inicio)) ? q.inicio : undefined;
  const dia = inicio
    ? hojeIso(new Date(inicio))
    : q.dia && /^\d{4}-\d{2}-\d{2}$/.test(q.dia)
      ? q.dia
      : undefined;
  const depois = contexto.eGestor
    ? `/app/agenda?dia=${dia ?? hojeIso()}`
    : `/app/equipa/${contexto.profissionalId}/agenda?dia=${dia ?? hojeIso()}`;
  return (
    <PainelEquipa atual="agenda">
      <h1 className="text-[22px] font-extrabold">
        {modo === "marcar" ? t.tituloMarcar : t.tituloRegistar}
      </h1>
      <FormularioBalcao
        modo={modo}
        servicos={servicos.map((s) => ({ id: s.id, rotulo: s.nome, precoCent: s.precoCent }))}
        profissionais={profissionais}
        inicial={{
          profissionalId: profissionais.some((p) => p.id === q.profissional)
            ? q.profissional
            : undefined,
          dia,
          inicio,
        }}
        hoje={hojeIso()}
        horaAgora={horaCurta(new Date())}
        depois={depois}
      />
    </PainelEquipa>
  );
}
