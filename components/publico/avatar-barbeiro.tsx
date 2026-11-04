import { cn } from "@/lib/utils";

/** A fotografia do barbeiro em círculo; sem fotografia, a inicial (D-210). */
export function AvatarBarbeiro({
  nome,
  fotoUrl,
  className,
}: {
  nome: string;
  fotoUrl: string | null;
  className?: string;
}) {
  return fotoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element -- imagem pública do Storage
    <img
      src={fotoUrl}
      alt=""
      loading="lazy"
      className={cn("shrink-0 rounded-full object-cover", className)}
    />
  ) : (
    <span
      aria-hidden
      className={cn(
        "titulo-estilo grid shrink-0 place-items-center rounded-full bg-accent font-bold text-accent-foreground",
        className,
      )}
    >
      {nome[0]}
    </span>
  );
}
