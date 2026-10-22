import { ChamadaUpgrade } from "@/components/nucleo/chamada-upgrade";
import { hojeIso } from "@/lib/formatacao/datas";
import { lerGrelha } from "@/lib/funcionalidades/servidor";
import { filaEsperaDoDia } from "@/lib/painel/filas";
import { listarFilaPresencial } from "@/lib/repositorios/painel/filas";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { FilaEspera } from "./fila-espera";
import { FilaPresencial } from "./fila-presencial";

/**
 * As filas na agenda (F.4.1, F.4.3): a de espera do dia escolhido, ao lado das vagas, e a
 * presencial de hoje. Cada bloco só aparece com a sua funcionalidade ligada.
 */
export async function FilasDoDia({
  inquilinoId,
  barbearia,
  dia,
  qr,
}: {
  inquilinoId: string;
  barbearia: string;
  dia: string;
  qr?: string;
}) {
  const { ativas } = await lerGrelha(inquilinoId);
  const espera = ativas.has("fila_espera");
  const presencial = ativas.has("qr_entrada") && dia === hojeIso();
  if (!espera && !presencial) return null;
  const bd = await criarClienteServidor();
  const [entradas, naLoja] = await Promise.all([
    espera ? filaEsperaDoDia(bd, inquilinoId, barbearia, dia) : [],
    presencial ? listarFilaPresencial(bd, inquilinoId, dia) : [],
  ]);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {presencial ? <FilaPresencial entradas={naLoja} qr={qr} /> : null}
      {espera ? (
        <FilaEspera
          entradas={entradas}
          dia={dia}
          podeAvisar={ativas.has("envio_mensagens")}
          upgrade={<ChamadaUpgrade />}
        />
      ) : null}
    </div>
  );
}
