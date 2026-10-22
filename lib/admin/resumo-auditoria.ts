// Resumo legível do detalhe de um registo de auditoria (E.1): só o que mudou, sem carimbos técnicos.

type Valor = string | number | boolean | null | Valor[] | { [k: string]: Valor };
type Objeto = { [k: string]: Valor };

const TECNICOS = /(^id$|_id$|_em$|_por$)/;
const MAX = 160;

const eObjeto = (v: unknown): v is Objeto =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function texto(v: Valor | undefined, vazio: string): string {
  if (v === null || v === undefined || v === "") return vazio;
  return typeof v === "object" ? JSON.stringify(v) : String(v);
}

function cortar(s: string) {
  return s.length > MAX ? `${s.slice(0, MAX - 1)}…` : s;
}

/** «chave · campo: antes → depois», ou os campos simples do registo; `vazio` quando não há nada a mostrar. */
export function resumoAuditoria(detalhes: unknown, vazio: string): string {
  if (!eObjeto(detalhes)) return detalhes == null ? vazio : cortar(String(detalhes));
  const { antes, depois, ...resto } = detalhes;
  const partes = Object.entries(resto)
    .filter(([k, v]) => !TECNICOS.test(k) && !eObjeto(v))
    .map(([k, v]) => (k === "chave" ? texto(v, vazio) : `${k}: ${texto(v, vazio)}`));
  if (eObjeto(depois)) {
    const a = eObjeto(antes) ? antes : {};
    for (const [k, v] of Object.entries(depois)) {
      if (TECNICOS.test(k) || k === "chave" || JSON.stringify(a[k]) === JSON.stringify(v)) continue;
      partes.push(
        eObjeto(antes)
          ? `${k}: ${texto(a[k], vazio)} → ${texto(v, vazio)}`
          : `${k}: ${texto(v, vazio)}`,
      );
    }
  }
  return partes.length ? cortar(partes.join(" · ")) : vazio;
}
