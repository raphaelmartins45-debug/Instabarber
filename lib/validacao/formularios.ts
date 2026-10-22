import { ESQUEMAS_SEPARADOR } from "./ficha-barbearia";
import { ESQUEMAS_SISTEMA } from "./sistema";

// Os esquemas dos blocos de campos da barbearia (FormularioFicha): separadores da ficha no
// Admin e secções da Gestão do sistema. O cliente e o servidor usam o mesmo.

export const ESQUEMAS_FORMULARIO = { ...ESQUEMAS_SEPARADOR, ...ESQUEMAS_SISTEMA } as const;

export type EsquemaFormulario = keyof typeof ESQUEMAS_FORMULARIO;

export type ResultadoFicha = { ok: true } | { ok: false; erro: string; campo?: string };
