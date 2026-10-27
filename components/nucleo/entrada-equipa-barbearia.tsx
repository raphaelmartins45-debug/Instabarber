import { CartaoAcesso } from "@/components/nucleo/cartao-acesso";
import { FormularioEntrada } from "@/components/nucleo/formulario-entrada";
import { textos } from "@/lib/i18n/pt-PT";
import { lerEndereco } from "@/lib/inquilino/endereco";
import { marcaAcesso } from "@/lib/publico/marca-acesso";

const t = textos.acesso.equipa;

/**
 * A página de entrada do gestor ou do barbeiro no endereço da barbearia (D-180): o mesmo
 * formulário da equipa, com a marca da barbearia e o título de cada papel. O papel da conta
 * decide o painel que abre depois de entrar.
 */
export async function EntradaEquipaBarbearia({
  slug,
  papel,
  seguinte,
  erro,
}: {
  slug: string;
  papel: "gestor" | "barbeiro";
  seguinte?: string;
  erro?: string;
}) {
  const { base } = await lerEndereco();
  // No subdomínio, a recuperação vive debaixo de /app; em instabarber.pt/<slug>, na raiz.
  const recuperarHref = base ? "/entrar/recuperar" : "/app/entrar/recuperar";
  return (
    <CartaoAcesso
      titulo={papel === "gestor" ? t.gestorTitulo : t.barbeiroTitulo}
      descricao={papel === "gestor" ? t.gestorSubtitulo : t.barbeiroSubtitulo}
      barbearia={await marcaAcesso(slug)}
    >
      <FormularioEntrada seguinte={seguinte} erroInicial={erro} recuperarHref={recuperarHref} />
    </CartaoAcesso>
  );
}
