import { cn } from "@/lib/utils";

/** Bloco de carregamento com a forma do que vai aparecer; pulsa só sem movimento reduzido. */
export function Esqueleto({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("rounded-xl bg-foreground/[.06] motion-safe:animate-pulse", className)}
    />
  );
}
