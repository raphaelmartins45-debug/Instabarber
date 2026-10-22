import { centimosDeTexto } from "@/lib/formatacao/dinheiro";
import { telefoneE164 } from "@/lib/formatacao/telefone";

// Importação CSV de clientes e serviços (E.1). Pré-visualização com as linhas com erro; só se
// gravam as válidas. Os clientes importados ficam sem consentimento para mensagens (H.1).

/** Lê CSV com vírgula ou ponto e vírgula (o Excel português usa «;»), com aspas. */
export function lerCsv(texto: string): string[][] {
  const limpo = texto.replace(/^\uFEFF/, "");
  const primeira = limpo.split(/\r?\n/, 1)[0] ?? "";
  const sep = (primeira.match(/;/g)?.length ?? 0) > (primeira.match(/,/g)?.length ?? 0) ? ";" : ",";
  const linhas: string[][] = [];
  let linha: string[] = [];
  let campo = "";
  let aspas = false;
  for (let i = 0; i < limpo.length; i++) {
    const c = limpo[i]!;
    if (aspas) {
      if (c === '"' && limpo[i + 1] === '"') {
        campo += '"';
        i++;
      } else if (c === '"') aspas = false;
      else campo += c;
    } else if (c === '"') aspas = true;
    else if (c === sep) {
      linha.push(campo);
      campo = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && limpo[i + 1] === "\n") i++;
      linha.push(campo);
      if (linha.some((x) => x.trim() !== "")) linhas.push(linha);
      linha = [];
      campo = "";
    } else campo += c;
  }
  linha.push(campo);
  if (linha.some((x) => x.trim() !== "")) linhas.push(linha);
  return linhas;
}

/** «Data de nascimento» → «data_nascimento»; «Telemóvel» → «telemovel». */
const normalizar = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/_d[eo]_/g, "_");

export type ErroLinha = { linha: number; motivo: string };
export type ClienteImportado = {
  nome: string;
  telefone: string;
  email: string | null;
  data_nascimento: string | null;
  notas: string | null;
};
export type ServicoImportado = { nome: string; duracao_min: number; preco_centimos: number };

function porCabecalho(linhas: string[][], obrigatorias: string[]) {
  const [cabecalho = [], ...dados] = linhas;
  const indice = new Map(cabecalho.map((c, i) => [normalizar(c), i]));
  const falta = obrigatorias.some((o) => !indice.has(o));
  const valor = (l: string[], nome: string) =>
    indice.has(nome) ? (l[indice.get(nome)!] ?? "").trim() : "";
  return { dados, falta, valor };
}

/** Data AAAA-MM-DD ou DD/MM/AAAA → AAAA-MM-DD; nulo se vazia; «erro» se inválida. */
function dataIso(texto: string): string | null | "erro" {
  if (!texto) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto) ?? /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto);
  if (!m) return "erro";
  const [a, mes, d] = texto.includes("/") ? [m[3]!, m[2]!, m[1]!] : [m[1]!, m[2]!, m[3]!];
  const data = new Date(`${a}-${mes}-${d}T00:00:00Z`);
  return Number.isNaN(data.getTime()) || data.getUTCDate() !== Number(d)
    ? "erro"
    : `${a}-${mes}-${d}`;
}

export function validarClientes(
  linhas: string[][],
  existentes: ReadonlySet<string>,
): { validas: ClienteImportado[]; erros: ErroLinha[] } {
  const { dados, falta, valor } = porCabecalho(linhas, ["nome", "telemovel"]);
  if (falta) return { validas: [], erros: [{ linha: 1, motivo: "colunas" }] };
  const validas: ClienteImportado[] = [];
  const erros: ErroLinha[] = [];
  const vistos = new Set<string>();
  dados.forEach((l, i) => {
    const n = i + 2;
    const nome = valor(l, "nome");
    const telefone = telefoneE164(valor(l, "telemovel"));
    const email = valor(l, "email");
    const nascimento = dataIso(valor(l, "data_nascimento"));
    if (!nome) return erros.push({ linha: n, motivo: "nome" });
    if (!telefone) return erros.push({ linha: n, motivo: "telemovel" });
    if (vistos.has(telefone)) return erros.push({ linha: n, motivo: "duplicado" });
    if (existentes.has(telefone)) return erros.push({ linha: n, motivo: "existente" });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return erros.push({ linha: n, motivo: "email" });
    if (nascimento === "erro") return erros.push({ linha: n, motivo: "data" });
    vistos.add(telefone);
    validas.push({
      nome: nome.slice(0, 120),
      telefone,
      email: email || null,
      data_nascimento: nascimento,
      notas: valor(l, "notas").slice(0, 1000) || null,
    });
  });
  return { validas, erros };
}

export function validarServicos(linhas: string[][]): {
  validas: ServicoImportado[];
  erros: ErroLinha[];
} {
  const { dados, falta, valor } = porCabecalho(linhas, ["nome", "duracao", "preco"]);
  if (falta) return { validas: [], erros: [{ linha: 1, motivo: "colunas" }] };
  const validas: ServicoImportado[] = [];
  const erros: ErroLinha[] = [];
  dados.forEach((l, i) => {
    const n = i + 2;
    const nome = valor(l, "nome");
    const duracao = Number(valor(l, "duracao"));
    const preco = centimosDeTexto(valor(l, "preco"));
    if (!nome) return erros.push({ linha: n, motivo: "nome" });
    if (!Number.isInteger(duracao) || duracao < 5 || duracao > 480)
      return erros.push({ linha: n, motivo: "duracao" });
    if (preco === null) return erros.push({ linha: n, motivo: "preco" });
    validas.push({ nome: nome.slice(0, 80), duracao_min: duracao, preco_centimos: preco });
  });
  return { validas, erros };
}
