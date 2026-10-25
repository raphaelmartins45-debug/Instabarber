// Carregar ficheiros (pedido do dono, 25/10/2026): botão visível, o nome do escolhido e o que se
// aceita (formatos, tamanho e medidas mínimas), em todos os carregamentos.

export const ficheiros = {
  escolher: "Escolher ficheiro",
  escolherImagem: "Escolher imagem",
  trocarImagem: "Trocar imagem",
  nenhum: "Nenhum ficheiro escolhido",
  aCarregar: "A carregar…",
  formatos: {
    "image/jpeg": "JPG",
    "image/png": "PNG",
    "image/webp": "WEBP",
    "image/svg+xml": "SVG",
    "application/pdf": "PDF",
    "text/csv": "CSV",
  } as Record<string, string>,
  aceita: (formatos: string, maxMb: number | null) =>
    maxMb ? `Formatos: ${formatos}. Até ${maxMb} MB.` : `Formato: ${formatos}.`,
  minimo: (largura: number, altura: number) => ` Mínimo ${largura} × ${altura} px.`,
} as const;
