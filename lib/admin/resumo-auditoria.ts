// Resumo legível do detalhe de um registo de auditoria (E.1): só o que mudou, sem carimbos técnicos.

type Valor = string | number | boolean | null | Valor[] | { [k: string]: Valor };
type Objeto = { [k: string]: Valor };

const TECNICOS = /(^id$|_id$|_em$|_por$)/;
const MAX = 160;

const eObjeto = (v: unknown): v is Objeto =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Para mostrar o resumo em linguagem corrente (D-183): as palavras de verdadeiro e falso, os
 * nomes dos campos e os nomes das chaves (por exemplo, as funcionalidades do catálogo).
 */
export type Legenda = {
  sim: string;
  nao: string;
  campos?: Record<string, string>;
  chaves?: Record<string, string>;
};

function texto(v: Valor | undefined, vazio: string, legenda?: Legenda): string {
  if (v === null || v === undefined || v === "") return vazio;
  if (typeof v === "boolean" && legenda) return v ? legenda.sim : legenda.nao;
  return typeof v === "object" ? JSON.stringify(v) : String(v);
}

function cortar(s: string) {
  return s.length > MAX ? `${s.slice(0, MAX - 1)}…` : s;
}

/** «chave · campo: antes → depois», ou os campos simples do registo; `vazio` quando não há nada a mostrar. */
export function resumoAuditoria(detalhes: unknown, vazio: string, legenda?: Legenda): string {
  const campo = (k: string) => legenda?.campos?.[k] ?? k;
  if (!eObjeto(detalhes)) return detalhes == null ? vazio : cortar(String(detalhes));
  const { antes, depois, ...resto } = detalhes;
  const partes = Object.entries(resto)
    .filter(([k, v]) => !TECNICOS.test(k) && !eObjeto(v))
    .map(([k, v]) =>
      k === "chave"
        ? (legenda?.chaves?.[String(v)] ?? texto(v, vazio))
        : `${campo(k)}: ${texto(v, vazio, legenda)}`,
    );
  if (eObjeto(depois)) {
    const a = eObjeto(antes) ? antes : {};
    for (const [k, v] of Object.entries(depois)) {
      if (TECNICOS.test(k) || k === "chave" || JSON.stringify(a[k]) === JSON.stringify(v)) continue;
      partes.push(
        eObjeto(antes)
          ? `${campo(k)}: ${texto(a[k], vazio, legenda)} → ${texto(v, vazio, legenda)}`
          : `${campo(k)}: ${texto(v, vazio, legenda)}`,
      );
    }
  }
  return partes.length ? cortar(partes.join(" · ")) : vazio;
}

/**
 * O nome de uma ação de auditoria em português corrente (D-183). Um código sem nome no
 * dicionário mostra-se legível: sem sublinhados e com maiúscula inicial.
 */
export function rotuloAcao(accao: string, nomes: Record<string, string>): string {
  const nome = nomes[accao];
  if (nome) return nome;
  const frase = accao.replace(/_+/g, " ").trim();
  return frase ? frase[0]!.toUpperCase() + frase.slice(1) : accao;
}
