import { CarregarContrato } from "@/components/adesao/carregar-contrato";
import { Aviso } from "@/components/nucleo/aviso";
import { LogotipoMarca } from "@/components/nucleo/logotipo-marca";
import { textos } from "@/lib/i18n/pt-PT";
import { contratoDoCliente } from "@/lib/repositorios/comercial/contratos";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.contratoCliente.pagina;
export const metadata = {
  title: `${t.titulo} · ${textos.marca.nome}`,
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

/**
 * O cliente carrega o contrato assinado (D-181), pela ligação do e-mail. A ligação valida-se na
 * base de dados; errada, expirada ou de um contrato já assinado, mostra só o aviso.
 */
export default async function ContratoDoCliente({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const c = await contratoDoCliente(await criarClienteServidor(), token);
  return (
    <div className="min-h-dvh">
      <header className="border-b border-border bg-card px-4 py-4">
        <div className="mx-auto max-w-xl">
          <LogotipoMarca className="h-8" />
        </div>
      </header>
      <main className="mx-auto grid max-w-xl gap-5 px-4 py-8">
        <h1 className="text-2xl font-extrabold">{t.titulo}</h1>
        {!c ? (
          <Aviso tipo="erro">{t.invalida}</Aviso>
        ) : (
          <>
            <p className="text-sm text-muted-foreground" data-testid="contrato-numero">
              {t.ajuda(c.numero, c.contratante ?? "")}
            </p>
            {c.recusa_motivo ? <Aviso tipo="erro">{t.recusado(c.recusa_motivo)}</Aviso> : null}
            {c.estado === "carregado" ? <Aviso tipo="sucesso">{t.carregadoAntes}</Aviso> : null}
            <ol className="grid list-decimal gap-2 pl-5 text-sm">
              {t.passos.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ol>
            <CarregarContrato ligacao={token} />
          </>
        )}
      </main>
    </div>
  );
}
