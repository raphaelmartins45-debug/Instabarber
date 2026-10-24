import { createClient } from "@supabase/supabase-js";

// Dados de teste dos ensaios de ponta a ponta, contra o Supabase local (scripts/e2e-local.sh).
// Nunca em produção: cria contas com palavras-passe conhecidas.

export const temSupabase =
  !!process.env.SUPABASE_SERVICE_ROLE_KEY && !!process.env.NEXT_PUBLIC_SUPABASE_URL;

export const PALAVRA_PASSE = "Teste-InstaBarber-2026";

export const BARBEARIA_A = {
  id: "e2e00000-0000-4000-8000-00000000000a",
  slug: "barbearia-a",
  nome: "Barbearia Alfa",
};
export const BARBEARIA_B = {
  id: "e2e00000-0000-4000-8000-00000000000b",
  slug: "barbearia-b",
  nome: "Barbearia Beta",
};

/** Barbearia suspensa por falta de pagamento (M.4): só o aviso e o plano do gestor. */
export const BARBEARIA_SUSPENSA = {
  id: "e2e00000-0000-4000-8000-00000000000c",
  slug: "barbearia-suspensa",
  nome: "Barbearia Gama",
};

/** Uma conta por projeto do Playwright (computador, telemóvel), para não se pisarem. */
export const contas = (projeto: string) => ({
  admin: `admin-${projeto}@teste.instabarber.pt`,
  dono: `dono-${projeto}@teste.instabarber.pt`,
  barbeiro: `barbeiro-${projeto}@teste.instabarber.pt`,
  duplo: `duplo-${projeto}@teste.instabarber.pt`,
  novo: `novo-${projeto}@teste.instabarber.pt`,
  // Super_admin próprio do ensaio da adesão (o 2FA inscreve-se uma vez por conta).
  adminAdesao: `admin-adesao-${projeto}@teste.instabarber.pt`,
  donoAdesao: `dono-adesao-${projeto}@teste.instabarber.pt`,
  // Super_admin do ensaio dos módulos desligados (Fase 6).
  adminModulos: `admin-modulos-${projeto}@teste.instabarber.pt`,
  donoSuspenso: `dono-suspenso-${projeto}@teste.instabarber.pt`,
  // Super_admin do catálogo de design (redesenho, lote A).
  adminDesign: `admin-design-${projeto}@teste.instabarber.pt`,
  // Super_admin do Comercial (Fase 3B).
  adminComercial: `admin-comercial-${projeto}@teste.instabarber.pt`,
});

/** Telefones dos clientes de teste, também por projeto. */
export const telefones = (projeto: string) => {
  const p = projeto === "computador" ? "1" : "2";
  return { semConta: `91200${p}001`, comConta: `91200${p}002` };
};

export const PROJETOS = ["computador", "telemovel"];

export function servico() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
