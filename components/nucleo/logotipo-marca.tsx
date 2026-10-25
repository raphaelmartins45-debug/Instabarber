import Image from "next/image";
import { textos } from "@/lib/i18n/pt-PT";
import { cn } from "@/lib/utils";

/**
 * O logótipo horizontal da InstaBarber que contrasta com a página: branco no modo escuro, preto
 * no modo claro (pedido do dono, 25/10/2026). Os dois ficam no HTML e o tema escolhe o visível.
 */
export function LogotipoMarca({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <>
      <Image
        src="/marca/logo-horizontal-branco.png"
        alt={textos.marca.nome}
        width={1400}
        height={432}
        className={cn("w-auto claro:hidden", className)}
        priority={priority}
      />
      <Image
        src="/marca/logo-horizontal-preto.png"
        alt={textos.marca.nome}
        width={1400}
        height={434}
        className={cn("hidden w-auto claro:block", className)}
        priority={priority}
      />
    </>
  );
}
