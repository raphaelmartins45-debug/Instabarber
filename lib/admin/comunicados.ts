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

export type PessoaAlvo = { userId: string; papel: string; ativo: boolean };
const PAPEL_DO_DESTINO: Record<string, string> = {
  comerciais: "comercial",
  gestores: "gestor_plataforma",
};

/** É um comunicado à equipa InstaBarber (D-191)? */
export const paraEquipa = (c: { destino: string }) => c.destino in PAPEL_DO_DESTINO;

/** As pessoas ativas da equipa a que o comunicado se destina (D-191): o grupo ou uma pessoa. */
export function pessoasDoComunicado<P extends PessoaAlvo>(
  c: { destino: string; destinatarioId: string | null },
  equipa: P[],
): P[] {
  const papel = PAPEL_DO_DESTINO[c.destino];
  return equipa.filter(
    (p) =>
      p.ativo && p.papel === papel && (c.destinatarioId === null || p.userId === c.destinatarioId),
  );
}
