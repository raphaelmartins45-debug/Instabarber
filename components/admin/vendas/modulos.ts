import {
  Calculator,
  ListChecks,
  MessageCircle,
  MonitorPlay,
  ShieldQuestion,
  Tag,
} from "lucide-react";

// Os módulos do Apoio às vendas (D-181): um por página, com o ícone do cartão da visão geral.
export const MODULOS_VENDAS = [
  { id: "visita", href: "/admin/vendas/visita", icone: ListChecks },
  { id: "demonstracao", href: "/admin/vendas/demonstracao", icone: MonitorPlay },
  { id: "perdas", href: "/admin/vendas/perdas", icone: Calculator },
  { id: "objecoes", href: "/admin/vendas/objecoes", icone: ShieldQuestion },
  { id: "preco", href: "/admin/vendas/preco", icone: Tag },
  { id: "mensagens", href: "/admin/vendas/mensagens", icone: MessageCircle },
] as const;
