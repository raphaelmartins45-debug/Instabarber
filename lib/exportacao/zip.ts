import { crc32, deflateRawSync } from "node:zlib";

// Ficheiro ZIP mínimo (método deflate), para entregar os dados de uma barbearia num só ficheiro
// comprimido (E.1, RGPD art. 28.º, n.º 3, g). Sem dependências: zlib do Node.

export function criarZip(ficheiros: { nome: string; conteudo: string }[]): Buffer {
  const locais: Buffer[] = [];
  const centrais: Buffer[] = [];
  let posicao = 0;
  for (const f of ficheiros) {
    const nome = Buffer.from(f.nome, "utf8");
    const dados = Buffer.from(f.conteudo, "utf8");
    const comprimido = deflateRawSync(dados);
    const crc = crc32(dados);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // versão necessária
    local.writeUInt16LE(0x0800, 6); // nomes em UTF-8
    local.writeUInt16LE(8, 8); // deflate
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(comprimido.length, 18);
    local.writeUInt32LE(dados.length, 22);
    local.writeUInt16LE(nome.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(comprimido.length, 20);
    central.writeUInt32LE(dados.length, 24);
    central.writeUInt16LE(nome.length, 28);
    central.writeUInt32LE(posicao, 42);
    locais.push(local, nome, comprimido);
    centrais.push(central, nome);
    posicao += local.length + nome.length + comprimido.length;
  }
  const diretorio = Buffer.concat(centrais);
  const fim = Buffer.alloc(22);
  fim.writeUInt32LE(0x06054b50, 0);
  fim.writeUInt16LE(ficheiros.length, 8);
  fim.writeUInt16LE(ficheiros.length, 10);
  fim.writeUInt32LE(diretorio.length, 12);
  fim.writeUInt32LE(posicao, 16);
  return Buffer.concat([...locais, diretorio, fim]);
}
