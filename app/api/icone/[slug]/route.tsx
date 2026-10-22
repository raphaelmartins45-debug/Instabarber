import { ImageResponse } from "next/og";
import { logoParaIcone, tamanhoIcone } from "@/lib/inquilino/icones";
import { slugValido } from "@/lib/inquilino/host";
import { obterBarbeariaPublica } from "@/lib/repositorios/barbearias-publicas";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// Ícone da barbearia (painéis e, na Fase 5, página pública): o logótipo sobre a cor da capa,
// ou o «IB» da marca. Só dados públicos (vista publico_inquilinos).

const PRETO = "#12100E";
const DOURADO = "#F5A623";

export async function GET(pedido: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = tamanhoIcone(new URL(pedido.url).searchParams.get("t"));
  const b = slugValido(slug)
    ? await obterBarbeariaPublica(await criarClienteServidor(), slug)
    : null;
  const logo = logoParaIcone(b?.logo_url ?? null);
  const fundo = logo ? (b?.capa_cor ?? PRETO) : PRETO;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: fundo,
        }}
      >
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element -- desenho do ImageResponse, não do browser
          <img
            src={logo}
            alt=""
            width={Math.round(t * 0.78)}
            height={Math.round(t * 0.78)}
            style={{ objectFit: "contain" }}
          />
        ) : (
          <span
            style={{
              color: DOURADO,
              fontSize: Math.round(t * 0.46),
              fontWeight: 900,
              letterSpacing: -2,
            }}
          >
            IB
          </span>
        )}
      </div>
    ),
    { width: t, height: t, headers: { "Cache-Control": "public, max-age=86400" } },
  );
}
