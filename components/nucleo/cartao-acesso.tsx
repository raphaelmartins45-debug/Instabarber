import { LogotipoMarca } from "@/components/nucleo/logotipo-marca";
import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type MarcaAcesso = {
  nome: string;
  cidade?: string | null;
  logoUrl?: string | null;
  capaUrl?: string | null;
  capaCor?: string | null;
};

/**
 * Moldura dos ecrãs de entrada: marca, título e o formulário ao centro. No endereço de uma
 * barbearia, a entrada leva a capa, o logótipo e o nome dela; no domínio principal, a InstaBarber.
 */
export function CartaoAcesso({
  titulo,
  descricao,
  barbearia,
  children,
}: {
  titulo: string;
  descricao?: string;
  barbearia?: MarcaAcesso;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <Card className="w-full max-w-sm overflow-hidden rounded-lg pt-0">
        {barbearia ? (
          <div data-testid="marca-barbearia">
            <div
              className="h-28 bg-cover bg-center"
              style={{
                backgroundColor: barbearia.capaCor ?? "#18181b",
                backgroundImage: barbearia.capaUrl ? `url(${barbearia.capaUrl})` : undefined,
              }}
            />
            <div className="-mt-10 flex flex-col items-center gap-1 px-6 text-center">
              {barbearia.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- imagem pública da barbearia
                <img
                  src={barbearia.logoUrl}
                  alt={barbearia.nome}
                  className="size-20 rounded-full border-4 border-card bg-card object-contain"
                />
              ) : (
                <span className="flex size-20 items-center justify-center rounded-full border-4 border-card bg-muted text-2xl font-extrabold">
                  {barbearia.nome.slice(0, 1)}
                </span>
              )}
              <p className="text-lg font-extrabold">{barbearia.nome}</p>
              {barbearia.cidade ? (
                <p className="text-xs text-muted-foreground">{barbearia.cidade}</p>
              ) : null}
            </div>
          </div>
        ) : null}
        <CardHeader className={barbearia ? "gap-2 pt-4 text-center" : "gap-3 pt-6"}>
          {barbearia ? null : <LogotipoMarca className="h-8" priority />}
          <CardTitle className="text-xl">{titulo}</CardTitle>
          {descricao ? <CardDescription>{descricao}</CardDescription> : null}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </main>
  );
}
