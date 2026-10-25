import { ePapelPlataforma } from "@/lib/admin/acesso";
import { redirect } from "next/navigation";
import { CartaoAcesso } from "@/components/nucleo/cartao-acesso";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import { listarMeusPerfis } from "@/lib/repositorios/perfis";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { escolherBarbearia } from "./acoes";

export const metadata = { title: `${textos.paineis.escolher.titulo} · ${textos.marca.nome}` };

export default async function PaginaEscolher() {
  const bd = await criarClienteServidor();
  const {
    data: { user },
  } = await bd.auth.getUser();
  if (!user) redirect("/entrar");

  // Uma linha por barbearia, com os papéis que a pessoa lá tem.
  const porBarbearia = new Map<string, { nome: string; papeis: string[] }>();
  for (const p of await listarMeusPerfis(bd, user.id)) {
    if (ePapelPlataforma(p.papel) || p.inquilino?.estado !== "ativo") continue;
    const linha = porBarbearia.get(p.inquilino.id) ?? { nome: p.inquilino.nome, papeis: [] };
    linha.papeis.push(textos.paineis.papeis[p.papel]);
    porBarbearia.set(p.inquilino.id, linha);
  }

  return (
    <CartaoAcesso titulo={textos.paineis.escolher.titulo} descricao={textos.paineis.escolher.texto}>
      <ul className="grid gap-2">
        {[...porBarbearia].map(([id, { nome, papeis }]) => (
          <li key={id}>
            <form action={escolherBarbearia}>
              <input type="hidden" name="barbearia" value={id} />
              <Button
                type="submit"
                variant="outline"
                className="h-auto w-full justify-between py-3"
              >
                <span className="font-semibold">{nome}</span>
                <span className="text-xs text-muted-foreground">{papeis.join(" · ")}</span>
              </Button>
            </form>
          </li>
        ))}
      </ul>
    </CartaoAcesso>
  );
}
