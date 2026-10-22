import { randomUUID } from "node:crypto";
import Image from "next/image";
import { FormularioAdesao } from "@/components/adesao/formulario-adesao";
import { dataCurta } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import { lerRegimeIva } from "@/lib/regras/mensalidade";
import { listarFuncionalidades, listarPacotes } from "@/lib/repositorios/funcionalidades";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export const metadata = { title: `${textos.adesao.titulo} · ${textos.marca.nome}` };
export const dynamic = "force-dynamic";

/** Formulário de adesão (D.8). A lista do que cada plano inclui vem da grelha (D.9). */
export default async function PaginaAdesao() {
  const bd = await criarClienteServidor();
  const [catalogo, pacotes] = await Promise.all([listarFuncionalidades(bd), listarPacotes(bd)]);
  return (
    <div className="min-h-dvh">
      <header className="bg-primary px-4 py-4">
        <div className="mx-auto max-w-2xl">
          <Image
            src="/marca/logo-horizontal-dourado.png"
            alt={textos.marca.nome}
            width={140}
            height={32}
            className="h-8 w-auto"
          />
        </div>
      </header>
      <main className="mx-auto grid max-w-2xl gap-6 px-4 py-8">
        <div className="grid gap-1">
          <h1 className="text-2xl font-extrabold">{textos.adesao.titulo}</h1>
          <p className="text-sm text-muted-foreground">{textos.adesao.subtitulo}</p>
        </div>
        <FormularioAdesao
          catalogo={catalogo.map(({ chave, nome, grupo }) => ({ chave, nome, grupo }))}
          pacotes={pacotes}
          regime={lerRegimeIva(process.env.PRESTADORA_REGIME_IVA)}
          pasta={randomUUID()}
          hoje={dataCurta(new Date())}
        />
      </main>
    </div>
  );
}
