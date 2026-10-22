"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Abre a impressão do browser; não aparece no papel. */
export function BotaoImprimir({ rotulo }: { rotulo: string }) {
  return (
    <Button variant="outline" className="h-11 print:hidden" onClick={() => window.print()}>
      <Printer className="size-4" aria-hidden />
      {rotulo}
    </Button>
  );
}
