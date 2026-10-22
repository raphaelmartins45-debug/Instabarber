import { Lock } from "lucide-react";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { calcularPrecoCent, INCLUIDOS, lerRegimeIva } from "@/lib/regras/mensalidade";

const t = textos.upgrade;

/**
 * Chamada de upgrade (D.2), só nas funcionalidades marcadas «Upgrade» na grelha D.3: painel
 * amarelo claro com o cadeado discreto. O preço do Pro vem da fórmula única, nunca escrito à mão.
 * Sem botão de ativação: a mudança de plano faz-se com a InstaBarber (O meu plano).
 */
export function ChamadaUpgrade({ curta }: { curta?: string }) {
  const preco = calcularPrecoCent(
    "pro",
    INCLUIDOS.pro,
    "mensal",
    false,
    lerRegimeIva(process.env.PRESTADORA_REGIME_IVA),
  );
  return (
    <aside
      className="grid gap-2 rounded-xl border border-destaque/40 bg-accent p-4 text-sm"
      data-testid="chamada-upgrade"
    >
      <p className="flex items-center gap-2 text-[11px] font-bold tracking-wide uppercase">
        <Lock className="size-3.5" aria-hidden />
        {t.titulo}
      </p>
      {curta ? (
        <p>{curta}</p>
      ) : (
        <>
          <p>{t.texto}</p>
          <p className="text-muted-foreground">{t.incluidos(INCLUIDOS.pro)}</p>
        </>
      )}
      <a
        href={`mailto:${textos.marca.apoio}`}
        className="font-semibold text-ligacao underline-offset-4 hover:underline"
      >
        {t.botao(formatarDinheiro(preco.semIva), formatarDinheiro(preco.comIva))}
      </a>
    </aside>
  );
}

/** Botão desativado com o cadeado (I.2), ao lado de uma ação fora do plano. */
export function BotaoUpgrade({ rotulo }: { rotulo: string }) {
  return (
    <button
      type="button"
      disabled
      title={t.titulo}
      className="inline-flex h-10 items-center gap-1.5 rounded-md border px-3 text-sm text-muted-foreground"
    >
      <Lock className="size-3.5" aria-hidden />
      {rotulo}
    </button>
  );
}
