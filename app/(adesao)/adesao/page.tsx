import { LogotipoMarca } from "@/components/nucleo/logotipo-marca";
import { randomUUID } from "node:crypto";
import { FormularioAdesao } from "@/components/adesao/formulario-adesao";
import { dataCurta } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import { valoresComConvite } from "@/lib/adesao/convite";
import { lerRegimeIva } from "@/lib/regras/mensalidade";
import { listarFuncionalidades, listarPacotes } from "@/lib/repositorios/funcionalidades";
import { lerConviteAdesao } from "@/lib/repositorios/pedidos-adesao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export const metadata = { title: `${textos.adesao.titulo} · ${textos.marca.nome}` };
export const dynamic = "force-dynamic";

/**
 * Formulário de adesão (D.8). A lista do que cada plano inclui vem da grelha (D.9). Com
 * ?convite= válido (N.7), abre já preenchido com os dados do contrato.
 */
export default async function PaginaAdesao({
  searchParams,
}: {
  searchParams: Promise<{ convite?: string }>;
}) {
  const { convite } = await searchParams;
  const bd = await criarClienteServidor();
  const [catalogo, pacotes, dadosConvite] = await Promise.all([
    listarFuncionalidades(bd),
    listarPacotes(bd),
    convite ? lerConviteAdesao(bd, convite.slice(0, 100)) : null,
  ]);
  return (
    <div className="min-h-dvh">
      <header className="border-b border-border bg-card px-4 py-4">
        <div className="mx-auto max-w-2xl">
          <LogotipoMarca className="h-8" />
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
          inicial={dadosConvite ? valoresComConvite(dadosConvite) : undefined}
          convite={dadosConvite ? convite : undefined}
        />
      </main>
    </div>
  );
}
