import type { NextConfig } from "next";

const config: NextConfig = {
  poweredByHeader: false,
  // A landing (D-34) é lida de landing/index.html pela rota de "/" durante o build.
  outputFileTracingIncludes: {
    "/": ["./landing/index.html"],
    // Rascunhos base dos modelos do Comercial (N.8, D-148).
    "/admin/comercial/modelos": ["./docs/comercial/*.md"],
  },
  // Fotografias da ficha técnica e do portfólio (até 3 MB) passam por Server Actions.
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
};

export default config;
