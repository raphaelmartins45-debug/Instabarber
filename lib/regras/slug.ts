import { slugValido } from "@/lib/inquilino/host";

// Endereço (slug) de uma barbearia nova a partir do nome (L.3): minúsculas, sem acentos,
// hífenes; nunca um caminho reservado; com sufixo se já estiver usado.

export function slugDoNome(nome: string): string {
  const base = nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " e ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
  if (slugValido(base)) return base;
  const alternativa = `barbearia-${base}`.slice(0, 40).replace(/-+$/g, "");
  return slugValido(alternativa) ? alternativa : "barbearia";
}

/** O primeiro slug livre: o próprio, ou com -2, -3… */
export function slugLivre(desejado: string, usados: ReadonlySet<string>): string {
  if (!usados.has(desejado)) return desejado;
  for (let n = 2; ; n++) {
    const sufixo = `-${n}`;
    const candidato = `${desejado.slice(0, 40 - sufixo.length)}${sufixo}`;
    if (!usados.has(candidato)) return candidato;
  }
}
