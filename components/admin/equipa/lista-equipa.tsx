import { alterar } from "@/app/(admin)/admin/(protegido)/equipa/acoes";
import { BotaoAcao } from "@/components/admin/financas/botao-acao";
import { Etiqueta } from "@/components/nucleo/etiqueta";
import { type Coluna, TabelaCartoes } from "@/components/nucleo/tabela-cartoes";
import { ApagarMembro } from "./apagar-membro";
import { BotaoReenviar } from "./botao-reenviar";
import { EditarMembro } from "./editar-membro";
import { dataHora } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import type { MembroEquipa } from "@/lib/repositorios/admin/equipa";

const t = textos.gestao.equipa;

export type LinhaMembro = MembroEquipa & { ultimaEntrada: string | null; eu: boolean };

/** As pessoas da equipa InstaBarber e o que o dono pode fazer a cada uma (D-161, D-186). */
export function ListaEquipa({ membros }: { membros: LinhaMembro[] }) {
  const colunas: Coluna<LinhaMembro>[] = [
    { id: "nome", rotulo: t.colunas.nome, valor: (m) => (m.eu ? `${m.nome} ${t.voce}` : m.nome) },
    { id: "email", rotulo: t.colunas.email, valor: (m) => m.email },
    { id: "papel", rotulo: t.colunas.papel, valor: (m) => t.papeis[m.papel] ?? m.papel },
    {
      id: "estado",
      rotulo: t.colunas.estado,
      valor: (m) => (
        <Etiqueta tom={m.ativo ? "sucesso" : "neutro"}>{m.ativo ? t.ativo : t.desativado}</Etiqueta>
      ),
    },
    {
      id: "entrada",
      rotulo: t.colunas.entrada,
      valor: (m) => (m.ultimaEntrada ? dataHora(m.ultimaEntrada) : t.nuncaEntrou),
    },
    {
      id: "acoes",
      rotulo: "",
      valor: (m) => (
        <div className="flex flex-wrap items-start gap-2">
          {/* Editar (D-186): toda a gente, o dono incluído. */}
          <EditarMembro perfilId={m.perfilId} nome={m.nome} email={m.email} telefone={m.telefone} />
          {m.eu || m.papel === "super_admin" ? null : (
            <>
              {m.ativo ? (
                <BotaoAcao
                  rotulo={t.mudarPara(
                    t.papeis[m.papel === "comercial" ? "gestor_plataforma" : "comercial"]!,
                  )}
                  acao={alterar.bind(null, m.perfilId, {
                    papel: m.papel === "comercial" ? "gestor_plataforma" : "comercial",
                  })}
                />
              ) : null}
              <BotaoAcao
                rotulo={m.ativo ? t.desativar : t.reativar}
                variante="ghost"
                acao={alterar.bind(null, m.perfilId, { ativo: !m.ativo })}
                confirmar={m.ativo ? t.confirmarDesativar : undefined}
              />
              {m.ativo && !m.ultimaEntrada ? <BotaoReenviar perfilId={m.perfilId} /> : null}
              <ApagarMembro
                perfilId={m.perfilId}
                nome={m.nome}
                destinos={membros
                  .filter((o) => o.ativo && o.perfilId !== m.perfilId)
                  .map((o) => ({ userId: o.userId, nome: o.nome, papel: o.papel }))}
              />
            </>
          )}
        </div>
      ),
    },
  ];
  return (
    <TabelaCartoes
      colunas={colunas}
      linhas={membros}
      chave={(m) => m.perfilId}
      vazio={t.ajuda}
      testId="membro"
    />
  );
}
