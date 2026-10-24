import { type ItemMontado, planificar } from "@/lib/funcionalidades/menus";
import { textos } from "@/lib/i18n/pt-PT";

// Separadores do InstaBarber Admin (E.1). Não dependem da grelha: o super_admin vê tudo.
// O que é da empresa (CRM, finanças…) fica dentro da pasta «Gestão do negócio» (D-145).

const m = textos.admin.menu;

export const MENU_ADMIN: ItemMontado[] = [
  { id: "inicio", rotulo: m.inicio, href: "/admin", chave: null, estado: "ativo" },
  {
    id: "barbearias",
    rotulo: m.barbearias,
    href: "/admin/barbearias",
    chave: null,
    estado: "ativo",
  },
  { id: "pedidos", rotulo: m.pedidos, href: "/admin/pedidos", chave: null, estado: "ativo" },
  {
    id: "pagamentos",
    rotulo: m.pagamentos,
    href: "/admin/pagamentos",
    chave: null,
    estado: "ativo",
  },
  { id: "modulos", rotulo: m.modulos, href: "/admin/modulos", chave: null, estado: "ativo" },
  // A empresa InstaBarber, separada da gestão da plataforma (D-145).
  {
    id: "negocio",
    rotulo: m.negocio,
    href: "/admin/comercial",
    chave: null,
    estado: "ativo",
    filhos: [
      {
        id: "comercial",
        rotulo: m.comercial,
        href: "/admin/comercial",
        chave: null,
        estado: "ativo",
      },
    ],
  },
];

/** O separador ativo a partir do caminho: o prefixo mais longo que coincide. */
export function separadorAtual(caminho: string): string {
  const candidatos = planificar(MENU_ADMIN).filter(
    (i) => caminho === i.href || caminho.startsWith(`${i.href}/`),
  );
  return candidatos.sort((a, b) => b.href.length - a.href.length)[0]?.id ?? "inicio";
}
