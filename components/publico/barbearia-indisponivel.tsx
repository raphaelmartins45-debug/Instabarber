import { textos } from "@/lib/i18n/pt-PT";

/** Barbearia suspensa (M.4): aviso neutro, sem expor a razão. */
export function BarbeariaIndisponivel() {
  const t = textos.paineis.publico;
  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center gap-2 px-4 text-center"
      data-testid="barbearia-indisponivel"
    >
      <h1 className="text-2xl font-semibold">{t.indisponivel}</h1>
      <p className="text-sm text-muted-foreground">{t.indisponivelTexto}</p>
    </main>
  );
}
