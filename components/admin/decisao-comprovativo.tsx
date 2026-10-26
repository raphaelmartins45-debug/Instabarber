"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { aprovar, recusar } from "@/app/(admin)/admin/(protegido)/pagamentos/comprovativos/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { ConfirmarAcao } from "@/components/nucleo/confirmar-acao";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.comprovativos.admin;

/** Aprovar ou recusar com motivo um comprovativo de pagamento (D-168). */
export function DecisaoComprovativo({ id }: { id: string }) {
  const router = useRouter();
  const [motivo, setMotivo] = useState("");
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  const decidir = (acao: () => ReturnType<typeof aprovar>, ok: string, semEmail: string) =>
    iniciar(async () => {
      const r = await acao();
      if (!r.ok) return setAviso({ tipo: "erro", texto: t.erros[r.erro] ?? t.erros.generico! });
      setAviso({ tipo: r.email ? "sucesso" : "erro", texto: r.email ? ok : semEmail });
      router.refresh();
    });
  return (
    <section className="grid gap-4 rounded-lg border bg-card p-4">
      {aviso ? <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso> : null}
      <ConfirmarAcao
        titulo={t.aprovar}
        descricao={t.confirmarAprovar}
        confirmar={t.aprovar}
        aoConfirmar={() => decidir(() => aprovar(id), t.aprovado, t.aprovadoSemEmail)}
        destrutiva={false}
      >
        <Button
          size="lg"
          className="h-11 justify-self-start bg-sucesso hover:bg-sucesso/90"
          disabled={aGuardar}
        >
          {t.aprovar}
        </Button>
      </ConfirmarAcao>
      <div className="grid gap-2 border-t pt-4">
        <Campo
          id="motivo-recusa"
          rotulo={t.motivo}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          maxLength={600}
        />
        <ConfirmarAcao
          titulo={t.recusar}
          descricao={motivo || t.erros.motivo!}
          confirmar={t.recusar}
          aoConfirmar={() => decidir(() => recusar(id, motivo), t.recusado, t.recusado)}
        >
          <Button
            variant="outline"
            className="h-11 justify-self-start text-destructive"
            disabled={aGuardar || motivo.trim().length < 3}
          >
            {t.recusar}
          </Button>
        </ConfirmarAcao>
      </div>
    </section>
  );
}
