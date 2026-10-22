import { obterConfiguracao } from "@/lib/repositorios/painel/barbearia";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { FormularioMarca } from "./formulario-marca";
import { ImagensMarcaGestor } from "./imagens-marca-gestor";

/** Marca (E.2): cor da capa com paleta do logótipo e pré-visualização, imagens e história. */
export async function SeccaoMarca({ inquilinoId }: { inquilinoId: string }) {
  const b = await obterConfiguracao(await criarClienteServidor(), inquilinoId);
  return (
    <div className="grid gap-6">
      <FormularioMarca
        nome={b.nome}
        logo={b.logo_url}
        inicial={{
          capa_cor: b.capa_cor,
          historia: b.historia ?? "",
          mostrar_mapa: b.mostrar_mapa,
          mostrar_historia: b.mostrar_historia,
        }}
      />
      <ImagensMarcaGestor logo={b.logo_url} capa={b.capa_foto_url} galeria={b.galeria_urls} />
    </div>
  );
}
