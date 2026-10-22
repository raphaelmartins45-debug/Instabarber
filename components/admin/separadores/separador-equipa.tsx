import { TabelaCartoes } from "@/components/nucleo/tabela-cartoes";
import { textos } from "@/lib/i18n/pt-PT";
import type { Barbearia } from "@/lib/repositorios/admin/barbearias";
import { listarProprietarios } from "@/lib/repositorios/perfis";
import { listarEquipa, type MembroEquipa } from "@/lib/repositorios/profissionais";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { BotaoBoasVindas } from "./botao-boas-vindas";

const t = textos.admin.ficha.equipa;

/** Proprietários e profissionais; o número contratado muda-se em Identidade (E.1). */
export async function SeparadorEquipa({ barbearia }: { barbearia: Barbearia }) {
  const bd = await criarClienteServidor();
  const [donos, equipa] = await Promise.all([
    listarProprietarios(bd, barbearia.id),
    listarEquipa(bd, barbearia.id),
  ]);
  return (
    <div className="grid gap-4">
      <section className="grid gap-2 rounded-lg border bg-card p-4">
        <h2 className="text-[15px] font-bold text-ligacao">{t.donos}</h2>
        {donos.map((d) => (
          <p key={d.id} className="text-sm">
            {d.nome} · {d.email}
          </p>
        ))}
        <BotaoBoasVindas inquilinoId={barbearia.id} />
      </section>
      <section className="grid gap-2">
        <h2 className="text-[15px] font-bold text-ligacao">{t.profissionais}</h2>
        <p className="text-sm text-muted-foreground">
          {t.ativos(equipa.filter((p) => p.ativo).length, barbearia.profissionais_contratados)}
        </p>
        <TabelaCartoes<MembroEquipa>
          linhas={equipa}
          chave={(p) => p.id}
          vazio={t.vazio}
          colunas={[
            { id: "nome", rotulo: textos.paineis.equipa.nome, valor: (p) => p.nome },
            {
              id: "email",
              rotulo: textos.paineis.equipa.email,
              valor: (p) => p.email ?? textos.comum.vazio,
            },
            {
              id: "ativo",
              rotulo: textos.paineis.equipa.ativo,
              valor: (p) => (p.ativo ? textos.comum.sim : textos.comum.nao),
            },
          ]}
        />
      </section>
    </div>
  );
}
