import { LogotipoMarca } from "@/components/nucleo/logotipo-marca";
import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/** Moldura dos ecrãs de entrada: marca, título e o formulário ao centro. */
export function CartaoAcesso({
  titulo,
  descricao,
  marca,
  children,
}: {
  titulo: string;
  descricao?: string;
  /** Nome da barbearia (área do cliente). Sem ele, aparece a marca InstaBarber. */
  marca?: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <Card className="w-full max-w-sm rounded-lg">
        <CardHeader className="gap-3">
          {marca ? (
            <p className="text-sm font-semibold tracking-wide text-ligacao uppercase">{marca}</p>
          ) : (
            <LogotipoMarca className="h-8" priority />
          )}
          <CardTitle className="text-xl">{titulo}</CardTitle>
          {descricao ? <CardDescription>{descricao}</CardDescription> : null}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </main>
  );
}
