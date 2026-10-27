import { NextResponse, type NextRequest } from "next/server";
import { desvioAdmin, ePapelPlataforma } from "@/lib/admin/acesso";
import {
  caminhoEntradaEquipa,
  encaminhar,
  hostResolvido,
  type Decisao,
} from "@/lib/inquilino/encaminhar";
import { CABECALHO_BASE, CABECALHO_SLUG } from "@/lib/inquilino/cabecalhos";
import { classificarHost } from "@/lib/inquilino/host";
import { papelNaPlataforma } from "@/lib/repositorios/perfis";
import { clienteDoPedido, copiarCookies, slugPorDominio } from "@/lib/supabase/middleware";

// Resolve a barbearia pelo host (L.4), reescreve para a rota interna e renova a sessão.
// Só encaminha: a autorização está no servidor e no RLS (B.6).

export async function middleware(pedido: NextRequest) {
  const host = classificarHost(
    pedido.headers.get("host") ?? "",
    process.env.ROOT_DOMAIN || "instabarber.pt",
  );
  const slugDominio = host.tipo === "dominio" ? await slugPorDominio(host.dominio) : null;
  const resolvido = hostResolvido(host, slugDominio);
  const decisao = encaminhar(resolvido, pedido.nextUrl.pathname);

  // Caminho sem rota: o Next responde 404 com a página «não encontrado».
  if (decisao.acao === "nao_encontrado") {
    return NextResponse.rewrite(new URL("/_nao-encontrado", pedido.url));
  }

  // Os cabeçalhos x-ib-* vêm sempre daqui, nunca do browser.
  const cabecalhos = new Headers(pedido.headers);
  cabecalhos.delete(CABECALHO_SLUG);
  cabecalhos.delete(CABECALHO_BASE);
  if (decisao.slug) cabecalhos.set(CABECALHO_SLUG, decisao.slug);
  cabecalhos.set(CABECALHO_BASE, decisao.base);

  const construir = () => {
    const destino = new URL(decisao.destino + pedido.nextUrl.search, pedido.url);
    return decisao.destino === pedido.nextUrl.pathname
      ? NextResponse.next({ request: { headers: cabecalhos } })
      : NextResponse.rewrite(destino, { request: { headers: cabecalhos } });
  };
  let resposta = construir();

  const temSessao = pedido.cookies.getAll().some((c) => c.name.startsWith("sb-"));
  if (!temSessao && decisao.zona === "publica") return resposta;

  const bd = clienteDoPedido(pedido, (renovados) => {
    cabecalhos.set("cookie", pedido.cookies.toString());
    resposta = construir();
    renovados.forEach(({ name, value, options }) => resposta.cookies.set(name, value, options));
  });
  const {
    data: { user },
  } = await bd.auth.getUser();

  if (!user && decisao.zona !== "publica") {
    return copiarCookies(resposta, NextResponse.redirect(entradaPara(pedido, decisao, resolvido)));
  }
  // Cada papel da equipa InstaBarber só abre o que usa (D-161); o resto volta ao seu início.
  if (user && decisao.zona === "admin") {
    const papel = await papelNaPlataforma(bd, user.id);
    const desvio = papel && ePapelPlataforma(papel) ? desvioAdmin(papel, decisao.destino) : null;
    if (desvio) return copiarCookies(resposta, NextResponse.redirect(new URL(desvio, pedido.url)));
  }
  return resposta;
}

function entradaPara(
  pedido: NextRequest,
  decisao: Extract<Decisao, { acao: "seguir" }>,
  resolvido: ReturnType<typeof hostResolvido>,
): URL {
  const caminho =
    decisao.zona === "cliente"
      ? `${decisao.base}/cliente`
      : caminhoEntradaEquipa(resolvido, pedido.nextUrl.pathname);
  const destino = new URL(caminho, pedido.url);
  if (decisao.zona !== "cliente") destino.searchParams.set("seguinte", pedido.nextUrl.pathname);
  return destino;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|apple-touch-icon|marca/|manifest.webmanifest).*)",
  ],
};
