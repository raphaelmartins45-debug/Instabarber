import { notFound } from "next/navigation";
import { FormularioPagamento } from "@/components/admin/formulario-pagamento";
import { FormularioFicha } from "@/components/nucleo/formulario-ficha";
import { guardarSeparador } from "../acoes";
import { GrelhaFuncionalidades } from "@/components/admin/grelha-funcionalidades";
import { ListasPagamentos } from "@/components/admin/listas-pagamentos";
import { SeparadorAuditoria } from "@/components/admin/separadores/separador-auditoria";
import { SeparadorEquipa } from "@/components/admin/separadores/separador-equipa";
import { ImagensMarca } from "@/components/admin/separadores/imagens-marca";
import { ImportadorCsv } from "@/components/admin/separadores/importador-csv";
import { ServicosBarbearia } from "@/components/admin/separadores/servicos-barbearia";
import { dadosDaGrelha } from "@/lib/admin/dados-grelha";
import { camposDe, SEPARADORES, valoresDe, type Separador } from "@/lib/admin/ficha";
import { hojeIso } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import { obterBarbearia } from "@/lib/repositorios/admin/barbearias";
import { listarFaturas, listarRecebimentos } from "@/lib/repositorios/admin/pagamentos";
import { listarServicosAdmin } from "@/lib/repositorios/admin/servicos";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const rotulos = {
  planos: textos.admin.planos,
  periodicidades: textos.admin.periodicidades,
  pagamentos: textos.admin.estadosPagamento,
  slugAjuda: textos.admin.ficha.campos.slugAjuda,
  dominioAjuda: textos.admin.ficha.campos.dominioAjuda,
};

/** Um separador da ficha da barbearia (E.1). */
export default async function SeparadorFicha({
  params,
}: {
  params: Promise<{ id: string; separador: string }>;
}) {
  const { id, separador } = await params;
  if (!SEPARADORES.includes(separador as Separador)) notFound();
  const bd = await criarClienteServidor();
  const b = await obterBarbearia(bd, id);
  if (!b) notFound();
  const s = separador as Separador;

  if (s === "marca") {
    const campos = camposDe(s, rotulos);
    return (
      <div className="grid gap-6">
        <ImagensMarca
          inquilinoId={b.id}
          logo={b.logo_url}
          capa={b.capa_foto_url}
          galeria={b.galeria_urls}
        />
        <FormularioFicha
          guardar={guardarSeparador.bind(null, b.id)}
          esquema={s}
          campos={campos}
          valores={valoresDe(b, campos)}
        />
      </div>
    );
  }
  if (s === "identidade" || s === "contactos" || s === "horario") {
    const campos = camposDe(s, rotulos);
    return (
      <FormularioFicha
        guardar={guardarSeparador.bind(null, b.id)}
        esquema={s}
        campos={campos}
        valores={valoresDe(b, campos)}
      />
    );
  }
  if (s === "pagamentos") {
    const campos = camposDe(s, rotulos);
    const [faturas, recebimentos] = await Promise.all([
      listarFaturas(bd, b.id),
      listarRecebimentos(bd, { inquilinoId: b.id }),
    ]);
    const hoje = hojeIso();
    const opcaoFaturas = faturas.map((f) => ({
      id: f.id,
      rotulo: f.numero,
      inquilinoId: f.inquilino_id,
    }));
    return (
      <div className="grid gap-6">
        <FormularioFicha
          guardar={guardarSeparador.bind(null, b.id)}
          esquema="pagamentos"
          campos={campos}
          valores={valoresDe(b, campos)}
        />
        <ListasPagamentos faturas={faturas} recebimentos={recebimentos} />
        <div className="grid gap-4 lg:grid-cols-2">
          <FormularioPagamento
            tipo="fatura"
            barbearias={[{ id: b.id, rotulo: b.nome }]}
            faturas={opcaoFaturas}
            hoje={hoje}
          />
          <FormularioPagamento
            tipo="recebimento"
            barbearias={[{ id: b.id, rotulo: b.nome }]}
            faturas={opcaoFaturas}
            hoje={hoje}
          />
        </div>
      </div>
    );
  }
  if (s === "servicos")
    return <ServicosBarbearia inquilinoId={b.id} servicos={await listarServicosAdmin(bd, b.id)} />;
  if (s === "equipa") return <SeparadorEquipa barbearia={b} />;
  if (s === "funcionalidades") return <GrelhaFuncionalidades {...await dadosDaGrelha(bd, b)} />;
  if (s === "importacao") {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <ImportadorCsv inquilinoId={b.id} tipo="clientes" />
        <ImportadorCsv inquilinoId={b.id} tipo="servicos" />
      </div>
    );
  }
  return <SeparadorAuditoria inquilinoId={b.id} />;
}
