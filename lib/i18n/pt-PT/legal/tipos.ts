// Estrutura dos documentos legais (H.4). O texto vive em lib/i18n; a página só o apresenta.

export type Prestadora = { nome: string; nif: string; morada: string };

export type SeccaoLegal = { titulo: string; paragrafos: string[]; lista?: string[] };

export type DocumentoLegal = {
  titulo: string;
  versao: string;
  introducao: string[];
  seccoes: SeccaoLegal[];
};
