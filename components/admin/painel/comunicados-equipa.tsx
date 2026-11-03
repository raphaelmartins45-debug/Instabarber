import { lerComunicadoEquipa } from "@/app/(admin)/admin/(protegido)/comunicados/acoes";
import { ComunicadosInicio } from "@/components/barbearia/inicio/comunicados-inicio";
import { meusComunicadosEquipa } from "@/lib/repositorios/painel/comunicados";
import { criarClienteServidor } from "@/lib/supabase/servidor";

/** Os comunicados à equipa InstaBarber de quem está no Admin (D-191), até carregar em «Li». */
export async function ComunicadosEquipa() {
  const comunicados = await meusComunicadosEquipa(await criarClienteServidor());
  return <ComunicadosInicio comunicados={comunicados} ler={lerComunicadoEquipa} />;
}
