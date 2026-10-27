import { textos } from "@/lib/i18n/pt-PT";
import { capa } from "./guia-capa";
import { criarGuia, type Imagem } from "./guia-primitivas";

// Guia do barbeiro (D-181): o endereço /barbeiro da barbearia, o primeiro acesso e o dia a dia,
// com a marca da barbearia. O gestor entrega-o a cada barbeiro novo.

const t = textos.documentos.barbeiro;

const curto = (url: string) => url.replace(/^https?:\/\//, "");

export function gerarGuiaBarbeiro(d: { barbearia: string; logo: Imagem | null; barbeiro: string }) {
  const g = criarGuia({ marca: t.marca, seccao: (n) => `${n} · ${t.seccoes[n - 1] ?? ""}` });
  capa(g, {
    logo: d.logo,
    inicial: d.barbearia.slice(0, 1).toUpperCase(),
    sobre: t.capaSobre,
    titulo: d.barbearia,
    texto: t.capaTexto,
    rodape: [textos.documentos.guia.rodapeCapa, textos.documentos.guia.rodapeMarca],
  });

  const p = t.painel;
  g.novaPagina(p.titulo);
  g.intro(p.intro);
  g.cartoes([{ ...p.cartao, url: curto(d.barbeiro) }]);
  g.h3(p.primeiroTitulo);
  g.passos(p.primeiro(curto(d.barbeiro)));
  g.h3(p.appTitulo);
  g.lista([...p.app]);
  g.paragrafo(p.esqueceu);

  const q = t.dia;
  g.novaPagina(q.titulo);
  g.h3(q.menuTitulo);
  g.tabela(q.menu);
  g.paragrafo(q.menuNota);
  g.h3(q.dicasTitulo);
  g.passos([...q.dicas]);
  g.nota(q.ajuda);
  return g.fechar(t.rodape(d.barbearia));
}
