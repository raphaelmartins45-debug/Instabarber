import { PaginaIndisponivel } from "@/components/nucleo/pagina-indisponivel";
import { telefoneApoio } from "@/lib/apoio/contacto";
import { textos } from "@/lib/i18n/pt-PT";
import { origemPrincipal } from "@/lib/inquilino/endereco";

const t = textos.paineis.indisponivel;
export const metadata = { title: `${t.titulo404} · ${textos.marca.nome}` };

/** Página não encontrada (D-197): por onde seguir, para quem é e quem ainda não é cliente. */
export default async function NaoEncontrado() {
  return (
    <PaginaIndisponivel
      titulo={t.titulo404}
      texto={t.texto404}
      origem={await origemPrincipal()}
      telefoneTexto={telefoneApoio()?.texto}
    />
  );
}
