import { textos } from "@/lib/i18n/pt-PT";

export const metadata = { title: `${textos.paineis.admin.titulo} · ${textos.marca.nome}` };

export default function PainelGeral() {
  return (
    <section className="grid gap-2">
      <h1 className="text-2xl font-semibold">{textos.paineis.admin.titulo}</h1>
      <p className="text-sm text-muted-foreground">{textos.paineis.admin.texto}</p>
    </section>
  );
}
