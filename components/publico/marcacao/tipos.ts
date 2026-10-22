// Dados que a página da marcação entrega ao fluxo (só públicos, já na língua do cliente).

export type ServicoMarcacao = {
  id: string;
  nome: string;
  descricao: string | null;
  duracao: number;
  precoCent: number;
};
export type BarbeiroMarcacao = {
  id: string;
  nome: string;
  fotoUrl: string | null;
  portfolio: string[];
};
export type BarbeariaMarcacao = {
  slug: string;
  nome: string;
  morada: string;
  cancelamentoMin: number;
  janelaDias: number;
  area: string;
  privacidade: string;
};
