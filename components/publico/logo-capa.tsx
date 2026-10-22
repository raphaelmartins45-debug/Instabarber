/** O logótipo em círculo, com o nome e a localidade, sobre dois anéis e um halo da cor da marca (E.6). */
export function LogoCapa({
  nome,
  cidade,
  logo,
  cor,
  texto,
}: {
  nome: string;
  cidade: string | null;
  logo: string | null;
  cor: string;
  texto: string;
}) {
  const iniciais = nome
    .split(/\s+/)
    .filter((p) => p.length > 2)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
  return (
    <div className="relative grid size-56 place-items-center md:size-72">
      <div
        aria-hidden
        className="absolute inset-0 rounded-full opacity-60 blur-2xl"
        style={{ backgroundColor: texto, opacity: 0.15 }}
      />
      <div aria-hidden className="absolute inset-0 rounded-full border border-current/20" />
      <div aria-hidden className="absolute inset-4 rounded-full border border-current/30" />
      <div className="relative grid size-40 place-items-center overflow-hidden rounded-full bg-white shadow-xl md:size-52">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element -- imagem pública do Storage, tamanho fixo
          <img src={logo} alt={nome} className="size-full object-contain p-5" />
        ) : (
          <div className="grid place-items-center text-center" style={{ color: cor }}>
            <span className="text-4xl font-black">{iniciais}</span>
            {cidade ? (
              <span className="text-[10px] font-bold tracking-widest uppercase">{cidade}</span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
