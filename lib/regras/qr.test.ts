import { describe, expect, it } from "vitest";
import { codigoQr } from "./qr";

// A leitura dos códigos gerados foi confirmada com um leitor externo (OpenCV) nas versões 1, 3, 4,
// 8 e 10 (D-126); estes testes guardam a forma.

const localizador = (m: boolean[][], x0: number, y0: number) =>
  [0, 1, 2, 3, 4, 5, 6].every((d) => m[y0]![x0 + d] && m[y0 + 6]![x0 + d] && m[y0 + d]![x0]) &&
  !m[y0 + 1]![x0 + 1] &&
  m[y0 + 3]![x0 + 3];

describe("codigoQr (F.4.3)", () => {
  it("escolhe a versão pelo tamanho do texto", () => {
    expect(codigoQr("A")!.length).toBe(21);
    expect(codigoQr("https://instabarber.pt/barbearia-do-joao/fila")!.length).toBe(33);
    expect(codigoQr(`https://instabarber.pt/${"y".repeat(185)}`)!.length).toBe(57);
  });
  it("tem os três padrões de localização nos cantos", () => {
    const m = codigoQr("https://instabarber.pt/barbearia-a/fila")!;
    const n = m.length;
    expect(localizador(m, 0, 0)).toBe(true);
    expect(localizador(m, n - 7, 0)).toBe(true);
    expect(localizador(m, 0, n - 7)).toBe(true);
  });
  it("tem o módulo escuro fixo e as linhas de temporização", () => {
    const m = codigoQr("https://instabarber.pt/barbearia-a/fila")!;
    const n = m.length;
    expect(m[n - 8]![8]).toBe(true);
    for (let i = 8; i < n - 8; i++) expect(m[6]![i]).toBe(i % 2 === 0);
  });
  it("é igual para o mesmo texto e recusa o que não cabe na versão 10", () => {
    expect(codigoQr("abc")).toEqual(codigoQr("abc"));
    expect(codigoQr("x".repeat(300))).toBeNull();
  });
});
