import { type ItemMontado, planificar } from "@/lib/funcionalidades/menus";
import { textos } from "@/lib/i18n/pt-PT";
import type { PapelPlataforma } from "./acesso";

// Separadores do InstaBarber Admin (E.1). Não dependem da grelha: o super_admin vê tudo.
// O que é da empresa (CRM, finanças…) fica dentro da pasta «Gestão do negócio» (D-149).

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
  // A empresa InstaBarber, separada da gestão da plataforma (D-149).
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
      { id: "vendas", rotulo: m.vendas, href: "/admin/vendas", chave: null, estado: "ativo" },
      {
        id: "financas",
        rotulo: m.financas,
        href: "/admin/financas",
        chave: null,
        estado: "ativo",
      },
      { id: "saude", rotulo: m.saude, href: "/admin/saude", chave: null, estado: "ativo" },
      { id: "metricas", rotulo: m.metricas, href: "/admin/metricas", chave: null, estado: "ativo" },
      {
        id: "comunicados",
        rotulo: m.comunicados,
        href: "/admin/comunicados",
        chave: null,
        estado: "ativo",
      },
      { id: "equipa", rotulo: m.equipa, href: "/admin/equipa", chave: null, estado: "ativo" },
    ],
  },
];

/** O comercial tem o Comercial, o Apoio às vendas e o seu desempenho (D-161, D-181). */
const MENU_COMERCIAL: ItemMontado[] = [
  { id: "comercial", rotulo: m.comercial, href: "/admin/comercial", chave: null, estado: "ativo" },
  { id: "vendas", rotulo: m.vendas, href: "/admin/vendas", chave: null, estado: "ativo" },
  {
    id: "desempenho",
    rotulo: m.desempenho,
    href: "/admin/comercial/desempenho",
    chave: null,
    estado: "ativo",
  },
];

/** O menu de cada papel da equipa InstaBarber: o gestor não tem a «Equipa InstaBarber». */
export function menuDoPapel(papel: PapelPlataforma): ItemMontado[] {
  if (papel === "comercial") return MENU_COMERCIAL;
  if (papel === "super_admin") return MENU_ADMIN;
  return MENU_ADMIN.map((i) =>
    i.filhos ? { ...i, filhos: i.filhos.filter((f) => f.id !== "equipa") } : i,
  );
}

/** O separador ativo a partir do caminho: o prefixo mais longo que coincide. */
export function separadorAtual(caminho: string, menu: ItemMontado[] = MENU_ADMIN): string {
  const candidatos = planificar(menu).filter(
    (i) => caminho === i.href || caminho.startsWith(`${i.href}/`),
  );
  return candidatos.sort((a, b) => b.href.length - a.href.length)[0]?.id ?? menu[0]?.id ?? "inicio";
}
