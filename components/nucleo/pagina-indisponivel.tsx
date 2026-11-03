import { ArrowRight, MessageCircle, Phone, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { LogotipoMarca } from "@/components/nucleo/logotipo-marca";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.paineis.indisponivel;

/**
 * Página não encontrada ou com erro (D-197): o logótipo, o que aconteceu e por onde seguir. Quem
 * ainda não é cliente vai ao formulário da landing; quem é cliente entra no painel; os dois têm o
 * apoio por WhatsApp e por chamada (os atalhos do servidor leem o número da configuração).
 */
export function PaginaIndisponivel({
  titulo,
  texto,
  origem = "",
  telefoneTexto,
  aoTentar,
}: {
  titulo: string;
  texto: string;
  /** O domínio principal quando a página abre num subdomínio («» no domínio principal). */
  origem?: string;
  /** O número para mostrar no botão «Ligar», se for conhecido. */
  telefoneTexto?: string;
  /** Na página de erro: tentar abrir outra vez. */
  aoTentar?: () => void;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <div className="grid w-full max-w-2xl gap-8" data-testid="pagina-indisponivel">
        <header className="grid justify-items-center gap-5 text-center">
          <a href={`${origem}/`} aria-label={t.inicio}>
            <LogotipoMarca className="h-9" priority />
          </a>
          <div className="grid gap-2">
            <h1 className="text-2xl font-extrabold text-balance sm:text-3xl">{titulo}</h1>
            <p className="mx-auto max-w-md text-sm text-pretty text-muted-foreground sm:text-base">
              {texto}
            </p>
          </div>
          {aoTentar ? (
            <Button size="lg" onClick={aoTentar}>
              <RotateCcw aria-hidden />
              {t.tentarOutraVez}
            </Button>
          ) : null}
        </header>
        <div className="grid gap-4 sm:grid-cols-2">
          <Cartao titulo={t.novoTitulo} texto={t.novoTexto}>
            {/* Na página de erro, o destaque é «Tentar outra vez». */}
            <Button asChild size="lg" variant={aoTentar ? "outline" : "default"} className="w-full">
              <a href={`${origem}/#contacto`}>
                {t.novoBotao}
                <ArrowRight aria-hidden />
              </a>
            </Button>
          </Cartao>
          <Cartao titulo={t.clienteTitulo} texto={t.clienteTexto}>
            <Button asChild size="lg" variant="outline" className="w-full">
              <a href={`${origem}/entrar`}>{t.clienteBotao}</a>
            </Button>
          </Cartao>
        </div>
        <section className="grid justify-items-center gap-3" aria-labelledby="ajuda-titulo">
          <h2 id="ajuda-titulo" className="text-sm font-bold">
            {t.ajudaTitulo}
          </h2>
          <div className="grid w-full gap-3 sm:flex sm:w-auto sm:justify-center">
            <Button asChild variant="secondary" size="lg">
              <a href={`${origem}/api/apoio/whatsapp`} target="_blank" rel="noopener noreferrer">
                <MessageCircle aria-hidden />
                {t.whatsapp}
              </a>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a href={`${origem}/api/apoio/ligar`}>
                <Phone aria-hidden />
                {t.ligar(telefoneTexto)}
              </a>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}

function Cartao({
  titulo,
  texto,
  children,
}: {
  titulo: string;
  texto: string;
  children: ReactNode;
}) {
  return (
    <div className="cartao grid content-between gap-4 rounded-2xl p-5">
      <div className="grid gap-1">
        <h2 className="font-bold">{titulo}</h2>
        <p className="text-sm text-muted-foreground">{texto}</p>
      </div>
      {children}
    </div>
  );
}
