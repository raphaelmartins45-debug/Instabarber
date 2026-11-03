import type { NextConfig } from "next";

const config: NextConfig = {
  poweredByHeader: false,
  // A landing (D-34) é lida de landing/index.html pela rota de "/" durante o build.
  outputFileTracingIncludes: {
    "/": ["./landing/index.html"],
    // Rascunhos base dos modelos do Comercial (N.8, D-152).
    "/admin/comercial/modelos": ["./docs/comercial/*.md"],
  },
  // Fotografias da ficha técnica e do portfólio (até 3 MB) passam por Server Actions.
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  // Cabeçalhos de segurança em todas as respostas (D-187). Nenhuma página se abre dentro de um
  // iframe de outro site; o navegador não adivinha tipos; a origem só segue para outros sites
  // sem o caminho; câmara, microfone e localização desligados. A política de conteúdo limita-se
  // ao enquadramento para não partir os scripts da landing e do Next.
  async headers() {
    return [
      {
        source: "/:caminho*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
        ],
      },
      {
        // A pré-visualização da página pública na Gestão do sistema (D-199) abre-se num iframe do
        // próprio site; só ela, e só dentro do próprio site.
        source: "/app/pre-visualizacao",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'",
          },
        ],
      },
    ];
  },
};

export default config;
