import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sugestaoDaBarbearia } from "@/lib/documentos/placa";
import { textos } from "@/lib/i18n/pt-PT";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { MODELOS_PLACA } from "@/lib/validacao/placa";

const t = textos.documentos.placa;

/**
 * Placa do balcão (D-185): o gestor escolhe o modelo, revê os três textos (já preenchidos com a
 * sugestão; para mudar, apaga e escreve) e descarrega o PDF. Nada fica gravado. Formulário GET
 * simples: funciona sem JavaScript e o mesmo esquema Zod valida a rota que gera o PDF.
 */
export async function SeccaoPlaca({ inquilinoId }: { inquilinoId: string }) {
  const { sugestao } = await sugestaoDaBarbearia(await criarClienteServidor(), inquilinoId);
  const campos = [
    { nome: "titulo", rotulo: t.campos.titulo, ajuda: t.campos.tituloAjuda, max: 60 },
    { nome: "frase", rotulo: t.campos.frase, ajuda: t.campos.fraseAjuda, max: 140 },
    { nome: "vantagem", rotulo: t.campos.vantagem, ajuda: t.campos.vantagemAjuda, max: 60 },
  ] as const;
  return (
    <form action="/api/placa" method="get" className="grid max-w-2xl gap-6" data-testid="placa">
      <p className="text-sm text-muted-foreground">{t.intro}</p>
      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-semibold">{t.modelo}</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {MODELOS_PLACA.map((m) => (
            <label
              key={m}
              className="grid cursor-pointer gap-1 rounded-lg border bg-campo p-3 has-checked:border-destaque has-checked:bg-accent"
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="radio"
                  name="modelo"
                  value={m}
                  defaultChecked={m === sugestao.modelo}
                  className="accent-[var(--ac)]"
                />
                {t.modelos[m]!.nome}
              </span>
              <span className="text-xs text-muted-foreground">{t.modelos[m]!.texto}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {campos.map((c) => (
        <div key={c.nome} className="grid gap-1.5">
          <Label htmlFor={`placa-${c.nome}`}>{c.rotulo}</Label>
          <Input
            id={`placa-${c.nome}`}
            name={c.nome}
            defaultValue={sugestao[c.nome]}
            maxLength={c.max}
            required={c.nome === "titulo"}
            aria-describedby={`placa-${c.nome}-ajuda`}
          />
          <p id={`placa-${c.nome}-ajuda`} className="text-xs text-muted-foreground">
            {c.ajuda}
          </p>
        </div>
      ))}
      <div>
        <Button type="submit" className="h-11">
          {t.descarregar}
        </Button>
      </div>
    </form>
  );
}
