// Comunicados aos gestores (D-160): o estado pelo prazo e as barbearias a que se destinam.
// A base de dados decide o que o gestor vê (meus_comunicados); isto serve só o ecrã do admin.

export type ComunicadoAlvo = {
  destino: string;
  plano: string | null;
  inquilinoId: string | null;
  inicio: string;
  fim: string | null;
};
export type BarbeariaAlvo = { id: string; plano: string; estado: string };

export function estadoComunicado(c: ComunicadoAlvo, agora: Date) {
  if (new Date(c.inicio) > agora) return "agendado" as const;
  if (c.fim && new Date(c.fim) <= agora) return "terminado" as const;
  return "ativo" as const;
}

/** As barbearias ativas a que o comunicado se destina. */
export function alvosDoComunicado<B extends BarbeariaAlvo>(
  c: ComunicadoAlvo,
  barbearias: B[],
): B[] {
  return barbearias.filter(
    (b) =>
      b.estado === "ativo" &&
      (c.destino === "todas" ||
        (c.destino === "plano" && b.plano === c.plano) ||
        (c.destino === "barbearia" && b.id === c.inquilinoId)),
  );
}
