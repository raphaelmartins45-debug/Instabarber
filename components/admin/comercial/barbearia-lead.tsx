import Link from "next/link";
import { EnviarComprovativo } from "@/components/barbearia/plano/enviar-comprovativo";
import { Etiqueta } from "@/components/nucleo/etiqueta";
import { textos } from "@/lib/i18n/pt-PT";
import type { BarbeariaDoLead } from "@/lib/repositorios/comercial/leads";

const t = textos.comercial.ficha;

/**
 * A barbearia de um lead ganho (D-195): se já está paga (plano ativo e primeiro comprovativo
 * aprovado) e o envio do comprovativo pela equipa. Só os administradores abrem a ficha dela.
 */
export function BarbeariaLead({
  barbearia,
  admin,
  hoje,
}: {
  barbearia: BarbeariaDoLead;
  admin: boolean;
  hoje: string;
}) {
  const b = barbearia;
  const formulario = (
    <EnviarComprovativo
      inquilinoId={b.inquilino_id}
      ajuda={t.comprovativoAjuda}
      valorInicial=""
      hoje={hoje}
      textoEnviado={textos.comprovativos.enviadoPelaEquipa}
    />
  );
  return (
    <div className="cartao grid gap-4 rounded-2xl p-5" data-testid="barbearia-lead">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold">{b.nome}</span>
        <Etiqueta tom={b.pago ? "sucesso" : b.comprovativo_pendente ? "alerta" : "info"}>
          {b.pago ? t.pago : b.comprovativo_pendente ? t.emAnalise : t.porPagar}
        </Etiqueta>
      </div>
      {b.pago ? null : <p className="text-sm text-muted-foreground">{t.barbeariaAjuda}</p>}
      {admin ? (
        <Link
          href={`/admin/barbearias/${b.inquilino_id}`}
          className="text-sm text-ligacao underline"
        >
          {t.abrirBarbearia}
        </Link>
      ) : null}
      {b.comprovativo_pendente ? null : b.pago ? (
        // Já paga: os pagamentos seguintes são do dono; fica à mão, recolhido.
        <details className="grid gap-2">
          <summary className="cursor-pointer text-sm font-bold">{t.enviarOutro}</summary>
          <div className="pt-3">{formulario}</div>
        </details>
      ) : (
        <div className="grid gap-2">
          <h3 className="text-sm font-bold">{t.enviarComprovativo}</h3>
          {formulario}
        </div>
      )}
    </div>
  );
}
