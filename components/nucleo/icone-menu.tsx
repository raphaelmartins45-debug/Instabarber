import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  FileBarChart,
  HandCoins,
  Handshake,
  House,
  Inbox,
  Landmark,
  Puzzle,
  type LucideIcon,
  Receipt,
  Settings,
  ShoppingBag,
  Store,
  Target,
  ToggleRight,
  UserRound,
  Users,
  UsersRound,
  Wallet,
} from "lucide-react";

// Ícone de cada entrada de menu, para a navegação inferior no telemóvel (I.3.1).

const ICONES: Record<string, LucideIcon> = {
  inicio: House,
  clientes: Users,
  agenda: CalendarDays,
  equipa: UsersRound,
  financeiro: Wallet,
  comissoes: HandCoins,
  loja: ShoppingBag,
  relatorio: FileBarChart,
  sistema: Settings,
  plano: BadgeCheck,
  metas: Target,
  perfil: UserRound,
  barbearias: Store,
  pedidos: Inbox,
  funcionalidades: ToggleRight,
  pagamentos: Receipt,
  modulos: Puzzle,
  negocio: BriefcaseBusiness,
  comercial: Handshake,
  financas: Landmark,
};

export function IconeMenu({ id, className }: { id: string; className?: string }) {
  const Icone = ICONES[id] ?? House;
  return <Icone aria-hidden className={className} />;
}
