// Aparência dos painéis (D-134): modo (escuro, claro, sistema) e destaque (ouro, neon, marca).
// Guarda-se no dispositivo e aplica-se antes da primeira pintura, sem piscar.

export type Modo = "escuro" | "claro" | "sistema";
export type Destaque = "ouro" | "neon" | "marca";
export type Aparencia = { modo: Modo; destaque: Destaque };

export const CHAVE_APARENCIA = "ib_aparencia";
export const MODOS: readonly Modo[] = ["escuro", "claro", "sistema"];
export const DESTAQUES: readonly Destaque[] = ["ouro", "neon", "marca"];
export const APARENCIA_OMISSAO: Aparencia = { modo: "sistema", destaque: "ouro" };

/** Lê o valor guardado; qualquer coisa estranha volta ao omisso (Sistema e Ouro). */
export function lerAparencia(guardado: string | null | undefined): Aparencia {
  try {
    const v = JSON.parse(guardado ?? "null") as Partial<Aparencia> | null;
    return {
      modo: MODOS.includes(v?.modo as Modo) ? (v!.modo as Modo) : APARENCIA_OMISSAO.modo,
      destaque: DESTAQUES.includes(v?.destaque as Destaque)
        ? (v!.destaque as Destaque)
        : APARENCIA_OMISSAO.destaque,
    };
  } catch {
    return APARENCIA_OMISSAO;
  }
}

/** O modo efetivo: «sistema» segue a preferência do aparelho. */
export const modoEfetivo = (modo: Modo, prefereClaro: boolean): "escuro" | "claro" =>
  modo === "sistema" ? (prefereClaro ? "claro" : "escuro") : modo;

/**
 * Script mínimo para o <head>: aplica a aparência guardada antes da primeira pintura e segue a
 * mudança do modo do aparelho. Repete a regra de lerAparencia em JavaScript simples (sem módulos).
 */
export const SCRIPT_APARENCIA = `(function(){try{var d=document.documentElement,a={};try{a=JSON.parse(localStorage.getItem("${CHAVE_APARENCIA}")||"{}")||{}}catch(e){}var m=["escuro","claro","sistema"].indexOf(a.modo)>=0?a.modo:"sistema",t=["ouro","neon","marca"].indexOf(a.destaque)>=0?a.destaque:"ouro",q=window.matchMedia("(prefers-color-scheme: light)");function p(){d.dataset.modo=m==="sistema"?(q.matches?"claro":"escuro"):m}d.dataset.destaque=t;d.dataset.modoEscolhido=m;p();q.addEventListener("change",function(){if(d.dataset.modoEscolhido==="sistema")p()})}catch(e){}})();`;

/** Aplica uma aparência já escolhida (seletor «Aparência») e guarda-a no dispositivo. */
export function aplicarAparencia(a: Aparencia): void {
  const d = document.documentElement;
  const claro = window.matchMedia("(prefers-color-scheme: light)").matches;
  d.dataset.modo = modoEfetivo(a.modo, claro);
  d.dataset.modoEscolhido = a.modo;
  d.dataset.destaque = a.destaque;
  try {
    localStorage.setItem(CHAVE_APARENCIA, JSON.stringify(a));
  } catch {
    // Sem armazenamento (janela privada): fica só nesta página.
  }
}
