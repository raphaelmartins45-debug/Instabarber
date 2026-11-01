import { observadorTexto } from "./estilo";

// Para os testes (D-184): com a Inter embutida, o texto vai codificado dentro do PDF e já não se
// encontra no ficheiro. Isto regista tudo o que os geradores escrevem, para se verificar.

export function registarTextoEscrito(): { texto: () => string; parar: () => void } {
  const escrito: string[] = [];
  observadorTexto.registar = (t) => escrito.push(...(Array.isArray(t) ? t : [t]));
  return {
    texto: () => escrito.join("\n"),
    parar: () => {
      observadorTexto.registar = undefined;
    },
  };
}
