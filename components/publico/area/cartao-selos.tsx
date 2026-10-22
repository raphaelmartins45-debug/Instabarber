import type { TextosPublicos } from "@/lib/i18n/publico";
import type { CartaoSelos as Cartao } from "@/lib/repositorios/minha-area";
import { cn } from "@/lib/utils";

/** Cartão de selos (E.4): os completos a dourado, barra de progresso, quantos faltam e o prémio. */
export function CartaoSelos({ t, cartao }: { t: TextosPublicos; cartao: Cartao }) {
  const noCartao = cartao.selos % cartao.necessarios || (cartao.selos > 0 ? cartao.necessarios : 0);
  const completo = cartao.selos >= cartao.necessarios;
  const faltam = completo ? 0 : cartao.necessarios - cartao.selos;
  return (
    <section className="grid gap-3 rounded-2xl border bg-card p-4" data-testid="cartao-selos">
      <h2 className="text-[15px] font-bold">{t.area.selos}</h2>
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: cartao.necessarios }, (_, i) => (
          <span
            key={i}
            aria-hidden
            className={cn(
              "aspect-square rounded-full border-2",
              i < Math.min(noCartao, cartao.necessarios)
                ? "border-destaque bg-destaque"
                : "border-muted",
            )}
          />
        ))}
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={cartao.necessarios}
        aria-valuenow={Math.min(cartao.selos, cartao.necessarios)}
      >
        <div
          className="h-full bg-destaque"
          style={{ width: `${Math.min(100, (cartao.selos / cartao.necessarios) * 100)}%` }}
        />
      </div>
      <p className="text-sm font-semibold">
        {completo ? t.area.selosCompleto : t.area.selosFaltam(faltam)}
      </p>
      {cartao.premio ? (
        <p className="text-sm text-muted-foreground">{t.area.premio(cartao.premio)}</p>
      ) : null}
    </section>
  );
}
