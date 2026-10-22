import type { pt } from "./pt";

// A forma dos textos públicos: a mesma árvore do português, com textos livres. O inglês e o
// francês têm de a cumprir por inteiro (o TypeScript recusa uma chave em falta).

type Ampliar<T> = T extends string
  ? string
  : T extends (...args: infer A) => string
    ? (...args: A) => string
    : T extends readonly string[]
      ? readonly string[]
      : { readonly [K in keyof T]: Ampliar<T[K]> };

export type TextosPublicos = Ampliar<typeof pt>;
