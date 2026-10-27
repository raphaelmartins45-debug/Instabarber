// Os documentos personalizados de uma barbearia (D-181). Sem dependências de servidor, para a
// interface os listar.

export const TIPOS_DOCUMENTO = ["guia", "barbeiro", "cartaz", "resumo"] as const;
export type TipoDocumento = (typeof TIPOS_DOCUMENTO)[number];
