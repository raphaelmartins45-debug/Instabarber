// Cortesia (D-189): a barbearia não paga enquanto a cortesia estiver ligada e a data de fim não
// tiver passado (sem data, até a Performa LAB a desligar). Datas em AAAA-MM-DD (hora de Lisboa).

export type ComCortesia = { cortesia?: boolean | null; cortesia_ate?: string | null };

export const emCortesia = (b: ComCortesia, hoje: string) =>
  !!b.cortesia && (!b.cortesia_ate || b.cortesia_ate >= hoje);
