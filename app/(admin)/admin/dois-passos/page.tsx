import { redirect } from "next/navigation";
import { FormularioDoisPassos } from "@/components/admin/formulario-dois-passos";
import { CartaoAcesso } from "@/components/nucleo/cartao-acesso";
import { inicioDoPapel } from "@/lib/admin/acesso";
import { lerSuperAdmin } from "@/lib/admin/contexto";
import { textos } from "@/lib/i18n/pt-PT";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export const metadata = { title: `${textos.acesso.doisPassos.titulo} · ${textos.marca.nome}` };

export default async function PaginaDoisPassos() {
  const estado = await lerSuperAdmin();
  if (estado.aal2) redirect(inicioDoPapel(estado.papel));
  const bd = await criarClienteServidor();
  const { data } = await bd.auth.mfa.listFactors();
  const verificado = data?.totp.find((f) => f.status === "verified")?.id ?? null;
  return (
    <CartaoAcesso titulo={textos.acesso.doisPassos.titulo}>
      <FormularioDoisPassos fatorVerificado={verificado} />
    </CartaoAcesso>
  );
}
