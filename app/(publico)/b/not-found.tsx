import { textos } from "@/lib/i18n/pt-PT";

export default function BarbeariaNaoEncontrada() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-2 px-4 text-center">
      <h1 className="text-2xl font-semibold">{textos.paineis.publico.naoEncontrada}</h1>
      <p className="text-sm text-muted-foreground">{textos.paineis.publico.naoEncontradaTexto}</p>
    </main>
  );
}
