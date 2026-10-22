import type { CampoFicha } from "@/lib/admin/ficha";
import { textos } from "@/lib/i18n/pt-PT";
import type { SeccaoComFormulario } from "@/lib/validacao/sistema";

// Os campos de cada secção de formulário da Gestão do sistema (E.2).

const t = textos.sistema;

export function camposSistema(
  seccao: SeccaoComFormulario,
  servicos: { id: string; nome: string }[],
): CampoFicha[] {
  switch (seccao) {
    case "estado":
      return [{ nome: "aberto", tipo: "booleano", rotulo: t.estado.aberto, ajuda: t.estado.ajuda }];
    case "sistema_marca":
      return [];
    case "sistema_horario":
      return [
        { nome: "hora_abertura", tipo: "hora", rotulo: t.horario.abertura },
        { nome: "hora_fecho", tipo: "hora", rotulo: t.horario.fecho },
        { nome: "intervalo_almoco_inicio", tipo: "hora", rotulo: t.horario.almocoInicio },
        { nome: "intervalo_almoco_fim", tipo: "hora", rotulo: t.horario.almocoFim },
        { nome: "dias_descanso", tipo: "dias", rotulo: t.horario.descanso },
        { nome: "fecha_feriados", tipo: "booleano", rotulo: t.horario.feriados },
        {
          nome: "granularidade_min",
          tipo: "selecao",
          rotulo: t.horario.granularidade,
          opcoes: ["5", "10", "15", "20", "30", "60"].map((v) => ({ valor: v, rotulo: v })),
        },
        { nome: "intervalo_marcacoes_min", tipo: "numero", rotulo: t.horario.intervalo },
        { nome: "antecedencia_minima_min", tipo: "numero", rotulo: t.horario.antecedencia },
        { nome: "antecedencia_cancelamento_min", tipo: "numero", rotulo: t.horario.cancelamento },
        { nome: "janela_marcacao_dias", tipo: "numero", rotulo: t.horario.janela },
        { nome: "aberto", tipo: "booleano", rotulo: t.estado.aberto },
      ];
    case "fidelizacao":
      return [
        { nome: "selos_necessarios", tipo: "numero", rotulo: t.fidelizacao.selos },
        { nome: "premio_ativo", tipo: "booleano", rotulo: t.fidelizacao.premioAtivo },
        {
          nome: "premio_servico_id",
          tipo: "selecao",
          rotulo: t.fidelizacao.premio,
          ajuda: t.fidelizacao.premioAjuda,
          opcoes: [
            { valor: "", rotulo: textos.comum.vazio },
            ...servicos.map((s) => ({ valor: s.id, rotulo: s.nome })),
          ],
        },
      ];
    case "aniversario":
      return [
        { nome: "desconto_aniversario_ativo", tipo: "booleano", rotulo: t.aniversario.ativo },
        {
          nome: "desconto_aniversario_percent",
          tipo: "numero",
          rotulo: t.aniversario.percentagem,
          ajuda: t.aniversario.ajuda,
        },
      ];
    case "faltas":
      return [
        { nome: "limite_faltas", tipo: "numero", rotulo: t.faltas.limite, ajuda: t.faltas.ajuda },
      ];
    case "ligacoes":
      return [
        { nome: "google_avaliacao_url", tipo: "url", rotulo: t.ligacoes.google },
        { nome: "livro_reclamacoes_url", tipo: "url", rotulo: t.ligacoes.reclamacoes },
      ];
  }
}
