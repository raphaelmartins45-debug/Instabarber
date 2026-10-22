import type { NextConfig } from "next";

const config: NextConfig = {
  poweredByHeader: false,
  // A landing (D-34) é lida de landing/index.html pela rota de "/" durante o build.
  outputFileTracingIncludes: { "/": ["./landing/index.html"] },
};

export default config;
