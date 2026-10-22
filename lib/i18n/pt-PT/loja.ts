// Loja de produtos (F.4.4): produtos e pedidos, pagamento ao balcão no levantamento.

export const loja = {
  titulo: "Loja",
  separadores: { produtos: "Produtos", pedidos: "Pedidos" },
  indicadores: {
    ativos: "Produtos ativos",
    novos: "Pedidos por preparar",
    prontos: "Prontos a levantar",
    abaixo: "Abaixo do stock mínimo",
  },
  nota: "O pagamento é feito ao balcão, no levantamento. Não há cobrança online.",
  produto: {
    novo: "Novo produto",
    editar: "Editar",
    nome: "Nome",
    descricao: "Descrição",
    foto: "Fotografia (JPG ou WEBP, até 3 MB)",
    custo: "Custo sem IVA (€)",
    iva: "Taxa de IVA",
    preco: "Preço de venda com IVA (€)",
    stock: "Stock",
    stockMinimo: "Stock mínimo",
    ativo: "Ativo",
    mostrarEsgotado: "Mostrar quando esgotado",
    guardar: "Guardar produto",
    guardado: "Produto guardado.",
    margem: (semIva: string, margem: string, percentagem: string) =>
      `Sem IVA ${semIva} · margem ${margem} · ${percentagem} %`,
    margemNegativa: "Margem negativa: está a vender abaixo do custo.",
    vazio: "Ainda sem produtos.",
  },
  estadosStock: { em_stock: "Em stock", repor: "Repor stock", esgotado: "Esgotado" } as Record<
    string,
    string
  >,
  estadosPedido: {
    novo: "Novo",
    pronto: "Pronto",
    levantado: "Levantado",
    cancelado: "Cancelado",
  } as Record<string, string>,
  pedidos: {
    vazio: "Sem pedidos.",
    numero: (n: number) => `Pedido #${n}`,
    pronto: "Marcar pronto",
    avisar: "Avisar",
    levantado: "Levantado",
    cancelar: "Cancelar",
    cancelarTitulo: "Cancelar o pedido?",
    cancelarTexto: "O pedido fica encerrado sem entrega.",
    aviso: (nome: string, numero: number, barbearia: string) =>
      `Olá ${nome}! O seu pedido #${numero} na ${barbearia} está pronto a levantar. O pagamento é feito ao balcão.`,
  },
  colunas: {
    produto: "Produto",
    preco: "Preço",
    stock: "Stock",
    estado: "Estado",
    margem: "Margem",
  },
  erros: {
    nome: "Escreva o nome.",
    valor: "Escreva um valor válido.",
    numero: "Escreva um número inteiro.",
    foto: "Fotografia em JPG ou WEBP, até 3 MB.",
    stock_insuficiente: "Não há stock suficiente para este pedido.",
    pedido_invalido: "Este pedido já não pode mudar.",
    erro: "Não foi possível guardar. Tente outra vez.",
  } as Record<string, string>,
} as const;
