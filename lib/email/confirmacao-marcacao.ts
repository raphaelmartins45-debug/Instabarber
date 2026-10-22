import "server-only";
import { variavel } from "@/lib/configuracao/ambiente";
import { dataLongaNaLingua, horaCurta } from "@/lib/formatacao/datas";
import { textosPublicos, type Lingua } from "@/lib/i18n/publico";
import { ficheiroCalendario } from "@/lib/regras/calendario";
import type { DadosEmailConfirmacao } from "@/lib/repositorios/email-confirmacao";
import type { Email } from "./enviar";

// Confirmação de marcação ao cliente (F.4.12, G.2): o único envio automático. Remetente da
// plataforma com o nome da barbearia; a resposta vai para o e-mail da barbearia.

export function emailConfirmacao(d: DadosEmailConfirmacao, lingua: Lingua, pagina: string): Email {
  const t = textosPublicos(lingua);
  const e = t.email;
  const quando = `${dataLongaNaLingua(d.inicio, lingua)}, ${horaCurta(d.inicio)}`;
  const texto = [
    e.ola(d.cliente.split(/\s+/)[0] ?? d.cliente),
    "",
    e.confirmada,
    "",
    `${e.servico}: ${d.servico}`,
    `${e.barbeiro}: ${d.barbeiro}`,
    `${e.quando}: ${quando}`,
    ...(d.morada ? [`${e.morada}: ${d.morada}`] : []),
    "",
    t.marcacao.cancelamento(t.duracao(d.cancelamentoMin)),
    e.calendario,
    "",
    `${e.pagina}: ${pagina}`,
    "",
    e.despedida,
    d.barbearia,
  ].join("\n");
  return {
    de: `${d.barbearia} <${variavel("EMAIL_REMETENTE")}>`,
    para: d.para,
    assunto: e.assunto(d.barbearia),
    texto,
    ...(d.emailBarbearia ? { responderPara: d.emailBarbearia } : {}),
    anexos: [
      {
        nome: "marcacao.ics",
        conteudo: ficheiroCalendario({
          id: d.marcacaoId,
          titulo: `${d.servico} · ${d.barbearia}`,
          inicio: d.inicio,
          fim: d.fim,
          local: d.morada ?? d.barbearia,
          descricao: `${e.barbeiro}: ${d.barbeiro}`,
        }),
      },
    ],
  };
}
