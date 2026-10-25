import { textos } from "@/lib/i18n/pt-PT";
import { ligacaoWhatsApp } from "@/lib/regras/whatsapp";

const t = textos.gestao.comunicados;

const ligacao = (telefone: string | null, mensagem: string) => {
  try {
    return telefone ? ligacaoWhatsApp(telefone, mensagem) : null;
  } catch {
    return null;
  }
};

/** Quem ainda não leu, com a conversa do WhatsApp pronta a abrir (regra 7: o envio é à mão). */
export function AvisoWhatsapp({
  titulo,
  porLer,
}: {
  titulo: string;
  porLer: { id: string; nome: string; whatsapp: string | null }[];
}) {
  if (porLer.length === 0) return null;
  return (
    <details className="text-sm">
      <summary className="cursor-pointer font-semibold">{t.whatsapp}</summary>
      <p className="mt-1 text-xs text-muted-foreground">{t.whatsappAjuda}</p>
      <ul className="mt-2 grid gap-1">
        {porLer.map((b) => {
          const href = ligacao(b.whatsapp, t.mensagemWhatsapp(b.nome, titulo));
          return (
            <li key={b.id}>
              {href ? (
                <a href={href} target="_blank" rel="noreferrer" className="text-ligacao underline">
                  {b.nome}
                </a>
              ) : (
                <span className="text-muted-foreground">
                  {b.nome} ({t.semWhatsapp})
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </details>
  );
}
