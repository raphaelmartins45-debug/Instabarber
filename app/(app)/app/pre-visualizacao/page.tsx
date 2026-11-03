import { notFound } from "next/navigation";
import { PaginaPublica } from "@/components/publico/pagina-barbearia";
import { exigirGestor } from "@/lib/equipa/contexto";
import { obterBarbeariaDoEndereco } from "@/lib/publico/barbearia";
import { ESTILOS, type Estilo } from "@/lib/publico/estilos";

// Pré-visualização da página pública na Gestão do sistema (D-199): a página verdadeira da própria
// barbearia, com o modelo e a cor ainda por guardar. Só o gestor; abre-se num iframe do próprio
// site (cabeçalho próprio em next.config.ts) e não se indexa (layout de /app).

export default async function PreVisualizacao({
  searchParams,
}: {
  searchParams: Promise<{ modelo?: string; cor?: string }>;
}) {
  const { barbearia } = await exigirGestor();
  const q = await searchParams;
  const b = await obterBarbeariaDoEndereco(barbearia.slug);
  if (!b?.id || !b.nome) notFound();
  const estilo = (ESTILOS as readonly string[]).includes(q.modelo ?? "")
    ? (q.modelo as Estilo)
    : undefined;
  const cor = /^#[0-9A-Fa-f]{6}$/.test(q.cor ?? "") ? q.cor!.toUpperCase() : undefined;
  // Só para ver: as ligações não saem da pré-visualização (a lista da Vitrine continua a mudar).
  return (
    <div className="[&_a]:pointer-events-none">
      <PaginaPublica b={{ ...b, id: b.id, nome: b.nome }} sobrepor={{ estilo, cor }} />
    </div>
  );
}
