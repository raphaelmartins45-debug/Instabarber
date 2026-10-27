import { textos } from "@/lib/i18n/pt-PT";
import type { EnderecosBarbearia } from "@/lib/inquilino/encaminhar";
import { assinatura, capa } from "./guia-capa";
import { criarGuia, type Imagem } from "./guia-primitivas";

// Guia de arranque personalizado (D-181): o guia de acesso (D-180) com o nome, o logótipo e os
// endereços da barbearia, uma página de boas-vindas e a assinatura de quem o gerou. Vai em anexo
// nas boas-vindas da aprovação e descarrega-se ou reenvia-se no Gerador de documentos.

const t = textos.documentos.guia;

export type DadosGuia = {
  barbearia: string;
  responsavel: string;
  logo: Imagem | null;
  enderecos: EnderecosBarbearia;
  assinatura: { nome: string; funcao: string };
};

/** Endereço sem o protocolo, como se escreve e se lê. */
const curto = (url: string) => url.replace(/^https?:\/\//, "");

export function gerarGuiaBarbearia(d: DadosGuia) {
  const g = criarGuia({ marca: t.marca, seccao: (n) => `${n} · ${t.seccoes[n - 1] ?? ""}` });
  const e = d.enderecos;

  capa(g, {
    logo: d.logo,
    inicial: d.barbearia.slice(0, 1).toUpperCase(),
    sobre: t.capaSobre,
    titulo: d.barbearia,
    texto: t.capaTexto,
    rodape: [t.rodapeCapa, t.rodapeMarca],
  });

  // 1 · Boas-vindas e primeiros passos
  const b = t.boasVindas;
  g.novaPagina(b.titulo(d.responsavel));
  b.paragrafos(d.barbearia).forEach((p) => g.paragrafo(p));
  g.h3(b.primeirosPassos);
  g.passos([...b.passos]);
  g.h3(b.impressoesTitulo);
  g.lista([...b.impressoes]);
  g.nota(b.notaArranque);

  // 2 · Os acessos, com os endereços desta barbearia
  const a = t.acessos;
  g.novaPagina(a.titulo);
  g.intro(a.intro);
  g.cartoes([
    { ...a.cartoes.gestor, url: curto(e.gestor) },
    { ...a.cartoes.barbeiro, url: curto(e.barbeiro) },
    { ...a.cartoes.pagina, url: curto(e.pagina) },
    { ...a.cartoes.cliente, url: curto(e.cliente) },
  ]);
  g.h3(a.resumoTitulo);
  g.tabela(a.resumo);
  g.nota(a.nota);

  // 3 · Painel de gestão
  const p = t.gestor;
  g.novaPagina(p.titulo);
  g.intro(p.intro);
  g.h3(p.entrarTitulo);
  g.paragrafo(p.entrar(curto(e.gestor)));
  g.h3(p.esqueceuTitulo);
  g.paragrafo(p.esqueceu);
  g.h3(p.appTitulo);
  g.lista([...p.app]);
  g.h3(p.menuTitulo);
  g.tabela(p.menu);
  g.paragrafo(p.menuNota);

  // 4 · Barbeiros, clientes, ajuda e a assinatura
  const q = t.equipa;
  g.novaPagina(q.titulo);
  g.h3(q.barbeiroTitulo);
  g.passos(q.barbeiro(curto(e.barbeiro)));
  g.h3(q.clienteTitulo);
  g.passos([...q.cliente]);
  g.h3(q.ajudaTitulo);
  g.tabela(q.ajuda);
  assinatura(g, { despedida: q.despedida, ...d.assinatura });

  return g.fechar(t.rodape(d.barbearia));
}
