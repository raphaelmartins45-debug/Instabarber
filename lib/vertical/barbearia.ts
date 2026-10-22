// Vocabulário da vertical barbearia (regra 10). O núcleo fala de «estabelecimento» e
// «profissional»; os rótulos que o utilizador vê vêm daqui.

export const vertical = {
  estabelecimento: { singular: "barbearia", plural: "barbearias", artigo: "a" },
  profissional: { singular: "barbeiro", plural: "barbeiros", artigo: "o" },
  gestor: { singular: "gestor", plural: "gestores" },
  camadas: {
    admin: "InstaBarber Admin",
    gestao: "InstaBarber Gestão",
    equipa: "InstaBarber Equipa",
    cliente: "Minha área",
  },
} as const;
