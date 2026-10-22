// Filas no painel da barbearia (F.4.1, F.4.3).

export const filas = {
  esperaTitulo: "Fila de espera",
  esperaAjuda: "Clientes que queriam este dia e não encontraram vaga.",
  esperaVazia: "Ninguém na fila de espera deste dia.",
  presencialTitulo: "Fila de hoje (QR)",
  presencialVazia: "Ninguém na fila de hoje.",
  codigoQr: "Código QR para imprimir",
  qrTitulo: "Código QR da fila",
  qrAjuda: "Imprima e afixe à porta, no balcão ou junto ao posto de trabalho.",
  imprimir: "Imprimir",
  entrou: (hora: string) => `Entrou às ${hora}`,
  semServico: "Serviço por escolher",
  posicao: (n: number) => `${n}.º`,
  avisar: "Avisar da vaga",
  semVaga: "Ainda não há vaga neste dia.",
  vagaAberta: (hora: string) => `Vaga às ${hora}`,
  avisado: (hora: string) => `Avisado · responde até às ${hora}`,
  expirado: "O prazo acabou",
  seguinte: "Passar ao seguinte",
  marcou: "Ficou com a vaga",
  remover: "Tirar da fila",
  chamar: "Chamar",
  emAtendimento: (barbeiro: string) => `Em atendimento com ${barbeiro}`,
  atendido: "Atendido",
  saiu: "Saiu",
  naoRegistado: "Sem conta",
} as const;

// Mensagens em lote (F.4.10, Pro: envio_lote).
export const mensagensLote = {
  tituloClientes: "Abrir em lote",
  tituloLembretes: "Lembretes em lote",
  progresso: (feitos: number, total: number) => `${feitos} de ${total} abertas`,
  abrir: (nome: string) => `Abrir a seguinte: ${nome}`,
  fim: "Todas as conversas foram abertas.",
  nota: "O WhatsApp abre com a mensagem pronta; o envio confirma-se lá.",
  avaliar: "Pedir avaliação",
} as const;
