// Ligações das redes sociais da barbearia (E.6): aceita o endereço completo ou só o nome.

export function redesSociais(b: {
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
}): { rotulo: string; url: string }[] {
  const url = (valor: string, base: string, arroba: boolean) =>
    valor.startsWith("http") ? valor : `${base}${arroba ? "@" : ""}${valor.replace(/^@/, "")}`;
  return [
    b.instagram
      ? { rotulo: "Instagram", url: url(b.instagram, "https://instagram.com/", false) }
      : null,
    b.facebook
      ? { rotulo: "Facebook", url: url(b.facebook, "https://facebook.com/", false) }
      : null,
    b.tiktok ? { rotulo: "TikTok", url: url(b.tiktok, "https://tiktok.com/", true) } : null,
  ].filter((r) => r !== null);
}
