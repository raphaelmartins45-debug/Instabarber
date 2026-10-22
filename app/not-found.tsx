import Link from "next/link";
import { textos } from "@/lib/i18n/pt-PT";

export default function NaoEncontrado() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-2xl font-semibold">{textos.paineis.naoEncontrado.titulo}</h1>
      <Link href="/" className="text-sm text-ligacao underline underline-offset-4">
        {textos.paineis.naoEncontrado.voltar}
      </Link>
    </main>
  );
}
