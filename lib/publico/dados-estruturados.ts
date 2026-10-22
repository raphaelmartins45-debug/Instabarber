// Dados estruturados schema.org `HairSalon` (E.6): morada, horário e serviços com preços.

const DIAS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function dadosHairSalon(b: {
  nome: string;
  url: string;
  descricao: string | null;
  morada: string | null;
  codigoPostal: string | null;
  cidade: string | null;
  telefone: string | null;
  logo: string | null;
  abertura: string;
  fecho: string;
  descanso: number[];
  servicos: { nome: string; precoEuros: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    name: b.nome,
    url: b.url,
    ...(b.descricao ? { description: b.descricao } : {}),
    ...(b.logo ? { image: b.logo, logo: b.logo } : {}),
    ...(b.telefone ? { telephone: b.telefone } : {}),
    address: {
      "@type": "PostalAddress",
      ...(b.morada ? { streetAddress: b.morada } : {}),
      ...(b.codigoPostal ? { postalCode: b.codigoPostal } : {}),
      ...(b.cidade ? { addressLocality: b.cidade } : {}),
      addressCountry: "PT",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: DIAS.filter((_, i) => !b.descanso.includes(i)),
        opens: b.abertura,
        closes: b.fecho,
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Serviços",
      itemListElement: b.servicos.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.nome },
        price: s.precoEuros,
        priceCurrency: "EUR",
      })),
    },
  };
}
