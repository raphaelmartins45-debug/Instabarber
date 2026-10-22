// Cabeçalhos que o middleware põe em cada pedido (e apaga se vierem do browser).

/** Slug da barbearia do endereço (subdomínio, domínio próprio ou /<slug>). */
export const CABECALHO_SLUG = "x-ib-slug";
/** Prefixo das ligações públicas: "" no endereço da barbearia, "/<slug>" no domínio principal. */
export const CABECALHO_BASE = "x-ib-base";
