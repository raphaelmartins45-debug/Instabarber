import { Button } from "@/components/ui/button";
import { TIPOS_DOCUMENTO } from "@/lib/documentos/tipos";
import { textos } from "@/lib/i18n/pt-PT";
import { EnviarGuia } from "./enviar-guia";

const t = textos.documentos.ecra;

/** Os quatro documentos personalizados de uma barbearia, para descarregar (e o guia, enviar). */
export function DocumentosBarbearia({ inquilinoId }: { inquilinoId: string }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2" data-testid="documentos-barbearia">
      {TIPOS_DOCUMENTO.map((tipo) => (
        <li key={tipo} className="cartao grid content-between gap-3 rounded-2xl p-4">
          <div className="grid gap-1">
            <p className="font-semibold">{t.documentos[tipo]!.titulo}</p>
            <p className="text-sm text-muted-foreground">{t.documentos[tipo]!.texto}</p>
          </div>
          <div className="flex flex-wrap items-start gap-2">
            <Button asChild size="sm">
              <a href={`/admin/documentos/barbearia/${inquilinoId}/${tipo}`} download>
                {t.descarregar}
              </a>
            </Button>
            {tipo === "guia" ? <EnviarGuia inquilinoId={inquilinoId} /> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
