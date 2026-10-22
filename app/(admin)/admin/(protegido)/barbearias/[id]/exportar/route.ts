import { NextResponse, type NextRequest } from "next/server";
import { exigirSuperAdmin } from "@/lib/admin/contexto";
import { paraCsv } from "@/lib/exportacao/csv";
import { TABELAS_DA_BARBEARIA, TABELAS_DO_CLIENTE } from "@/lib/exportacao/tabelas";
import { criarZip } from "@/lib/exportacao/zip";
import { telefoneE164 } from "@/lib/formatacao/telefone";
import { textos } from "@/lib/i18n/pt-PT";
import { obterBarbearia } from "@/lib/repositorios/admin/barbearias";
import { registarAcaoAdmin } from "@/lib/repositorios/admin/auditoria";
import { lerTudo } from "@/lib/repositorios/admin/exportacao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// Exportação dos dados de uma barbearia (ou de um só cliente) em CSV, num ZIP
// (E.1; RGPD, art. 28.º, n.º 3, g). O cliente procura-se pelo telemóvel (?telefone=…). Só o
// super_admin com dois fatores; fica em auditoria.

const UUID = /^[0-9a-f-]{36}$/;

export async function GET(pedido: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await exigirSuperAdmin();
  const { id } = await params;
  const telefone = telefoneE164(pedido.nextUrl.searchParams.get("telefone") ?? "");
  if (!UUID.test(id) || (pedido.nextUrl.searchParams.has("telefone") && !telefone)) {
    return new NextResponse(null, { status: 404 });
  }
  const bd = await criarClienteServidor();
  const barbearia = await obterBarbearia(bd, id);
  if (!barbearia) return new NextResponse(null, { status: 404 });
  const cliente = telefone
    ? ((await lerTudo(bd, "clientes", "telefone", telefone)).find((c) => c.inquilino_id === id)
        ?.id as string | undefined)
    : null;
  if (telefone && !cliente) return new NextResponse(null, { status: 404 });

  const ficheiros: { nome: string; conteudo: string }[] = [];
  if (cliente) {
    const ficha = (await lerTudo(bd, "clientes", "id", cliente)).filter(
      (c) => c.inquilino_id === id,
    );
    ficheiros.push({ nome: "clientes.csv", conteudo: paraCsv(ficha) });
    for (const tabela of TABELAS_DO_CLIENTE) {
      const linhas = (await lerTudo(bd, tabela, "cliente_id", cliente)).filter(
        (l) => l.inquilino_id === id,
      );
      ficheiros.push({ nome: `${tabela}.csv`, conteudo: paraCsv(linhas) });
    }
  } else {
    ficheiros.push({ nome: "barbearia.csv", conteudo: paraCsv([barbearia]) });
    for (const tabela of TABELAS_DA_BARBEARIA) {
      ficheiros.push({
        nome: `${tabela}.csv`,
        conteudo: paraCsv(await lerTudo(bd, tabela, "inquilino_id", id)),
      });
    }
  }
  await registarAcaoAdmin(bd, {
    inquilinoId: id,
    accao: cliente ? "exportacao_cliente" : "exportacao_barbearia",
    entidade: cliente ? "clientes" : "inquilinos",
    entidadeId: cliente ?? id,
  });
  const nome = cliente
    ? textos.admin.exportacao.cliente(cliente)
    : textos.admin.exportacao.ficheiro(barbearia.slug);
  return new NextResponse(new Uint8Array(criarZip(ficheiros)), {
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="${nome}"`,
      "cache-control": "no-store",
    },
  });
}
