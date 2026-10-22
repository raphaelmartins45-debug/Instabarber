// «Adicionar ao calendário» (E.4): um ficheiro .ics com a marcação, em UTC.

const carimbo = (d: Date) =>
  d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
const escapar = (t: string) => t.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");

export function ficheiroCalendario(e: {
  id: string;
  titulo: string;
  inicio: string;
  fim: string;
  local: string;
  descricao: string;
  agora?: Date;
}): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//InstaBarber//Marcacao//PT",
    "BEGIN:VEVENT",
    `UID:${e.id}@instabarber.pt`,
    `DTSTAMP:${carimbo(e.agora ?? new Date())}`,
    `DTSTART:${carimbo(new Date(e.inicio))}`,
    `DTEND:${carimbo(new Date(e.fim))}`,
    `SUMMARY:${escapar(e.titulo)}`,
    `LOCATION:${escapar(e.local)}`,
    `DESCRIPTION:${escapar(e.descricao)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
