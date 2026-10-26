// Fatura-recibo da Performa LAB à barbearia pelo InvoiceXpress (D-170), programa certificado pela
// AT. A plataforma não emite documentos fiscais (D-01): pede-os ao programa, que os numera, guarda
// e envia por e-mail. Funções puras para montar os pedidos; o envio HTTP recebe o `fetch`.

export type ConfigInvoiceXpress = {
  /** Nome da conta: o «xxx» de https://xxx.app.invoicexpress.com. */
  conta: string;
  chave: string;
  /** Nome da taxa de IVA na conta (por omissão «IVA23»). */
  iva: string;
};

export type DadosFatura = {
  cliente: {
    nome: string;
    nif: string | null;
    email: string | null;
    morada: string | null;
    codigoPostal: string | null;
    cidade: string | null;
    codigo: string;
  };
  /** Nome e descrição da linha («Mensalidade InstaBarber», «Plano Pro · 01/11/2026 – 30/11/2026»). */
  item: string;
  descricao: string;
  /** Assunto e texto do e-mail que o InvoiceXpress envia com o PDF. */
  assunto: (numero: string) => string;
  corpo: string;
  /** Total pago, com IVA, em cêntimos. */
  totalCent: number;
  /** Data do pagamento, AAAA-MM-DD. */
  data: string;
  /** Regime de IVA da Prestadora (D-45, D-85): no isento, taxa 0 e motivo M10. */
  isento: boolean;
};

const dia = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;

/** Preço unitário sem IVA (a 23 %, ou o total no regime isento), em euros com duas casas. */
export function precoSemIva(totalCent: number, isento: boolean): number {
  return Math.round(isento ? totalCent : totalCent / 1.23) / 100;
}

/** O corpo do pedido de criação da fatura-recibo (rascunho). */
export function corpoFaturaRecibo(d: DadosFatura, iva: string) {
  return {
    invoice_receipt: {
      date: dia(d.data),
      due_date: dia(d.data),
      ...(d.isento ? { tax_exemption: "M10" } : {}),
      client: {
        name: d.cliente.nome,
        code: d.cliente.codigo,
        ...(d.cliente.nif ? { fiscal_id: d.cliente.nif } : {}),
        ...(d.cliente.email ? { email: d.cliente.email } : {}),
        ...(d.cliente.morada ? { address: d.cliente.morada } : {}),
        ...(d.cliente.codigoPostal ? { postal_code: d.cliente.codigoPostal } : {}),
        ...(d.cliente.cidade ? { city: d.cliente.cidade } : {}),
        country: "Portugal",
      },
      items: [
        {
          name: d.item,
          description: d.descricao,
          unit_price: precoSemIva(d.totalCent, d.isento).toFixed(2),
          quantity: "1",
          tax: { name: d.isento ? "Isento" : iva },
        },
      ],
    },
  };
}

type Fetch = typeof fetch;
export type ResultadoEmissao = { ok: true; numero: string } | { ok: false; erro: string };

/**
 * Cria a fatura-recibo, finaliza-a (a partir daqui tem número e não se altera) e pede ao
 * InvoiceXpress que a envie por e-mail ao cliente. Qualquer falha devolve o passo que falhou.
 */
export async function emitirFaturaRecibo(
  c: ConfigInvoiceXpress,
  d: DadosFatura,
  pedir: Fetch = fetch,
): Promise<ResultadoEmissao> {
  const base = `https://${c.conta}.app.invoicexpress.com`;
  const chave = `api_key=${encodeURIComponent(c.chave)}`;
  const json = { "Content-Type": "application/json", Accept: "application/json" };
  try {
    const criada = await pedir(`${base}/invoice_receipts.json?${chave}`, {
      method: "POST",
      headers: json,
      body: JSON.stringify(corpoFaturaRecibo(d, c.iva)),
    });
    if (!criada.ok) return { ok: false, erro: `criar_${criada.status}` };
    const id = (await criada.json())?.invoice_receipt?.id;
    if (!id) return { ok: false, erro: "criar_sem_id" };

    const final = await pedir(`${base}/invoice_receipts/${id}/change-state.json?${chave}`, {
      method: "PUT",
      headers: json,
      body: JSON.stringify({ invoice_receipt: { state: "finalized" } }),
    });
    if (!final.ok) return { ok: false, erro: `finalizar_${final.status}` };
    const doc = (await final.json())?.invoice_receipt ?? {};
    const numero = String(doc.inverted_sequence_number ?? doc.sequence_number ?? `FR ${id}`);

    if (d.cliente.email) {
      const email = await pedir(`${base}/invoice_receipts/${id}/email-document.json?${chave}`, {
        method: "PUT",
        headers: json,
        body: JSON.stringify({
          message: {
            client: { email: d.cliente.email, save: "0" },
            subject: d.assunto(numero),
            body: d.corpo,
          },
        }),
      });
      // A fatura já existe e tem número: um e-mail falhado não a desfaz.
      if (!email.ok) return { ok: true, numero };
    }
    return { ok: true, numero };
  } catch {
    return { ok: false, erro: "rede" };
  }
}
