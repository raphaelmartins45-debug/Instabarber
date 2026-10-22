"use client";

import { useState, useTransition } from "react";
import {
  concluir,
  dadosConclusao,
  type DadosConclusao,
} from "@/app/(app)/app/(painel)/agenda/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { textoDeCentimos } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.agenda.concluir;
const erros = textos.agenda.erros;
type Modo = "normal" | "credito_clube" | "premio";

/** Concluir com o valor editável e, quando se aplica, clube, prémio de selos ou cartão oferta. */
export function DialogoConcluir({ id }: { id: string }) {
  const [aberto, setAberto] = useState(false);
  const [dados, setDados] = useState<DadosConclusao | null>(null);
  const [modo, setModo] = useState<Modo>("normal");
  const [valor, setValor] = useState("");
  const [cartao, setCartao] = useState({ usar: false, codigo: "", valor: "" });
  const [erro, setErro] = useState<string>();
  const [aGuardar, iniciar] = useTransition();

  const abrir = () =>
    iniciar(async () => {
      const d = await dadosConclusao(id);
      setDados(d);
      setValor(d ? textoDeCentimos(d.valorCent) : "");
      setModo("normal");
      setErro(undefined);
      setAberto(true);
    });

  const enviar = () =>
    iniciar(async () => {
      const r = await concluir({
        id,
        modo,
        valor: modo === "normal" ? valor : undefined,
        cartaoCodigo: cartao.usar ? cartao.codigo : undefined,
        cartaoValor: cartao.usar ? cartao.valor : undefined,
      });
      if (r.ok) setAberto(false);
      else setErro(erros[r.erro] ?? erros.erro);
    });

  const opcao = (m: Modo, rotulo: string) => (
    <label className="flex min-h-11 items-center gap-2 text-sm">
      <input type="radio" name={`modo-${id}`} checked={modo === m} onChange={() => setModo(m)} />
      {rotulo}
    </label>
  );

  return (
    <>
      <Button size="sm" className="h-10" onClick={abrir} disabled={aGuardar}>
        {textos.agenda.acoes.concluir}
      </Button>
      <AlertDialog open={aberto} onOpenChange={setAberto}>
        <AlertDialogContent>
          <AlertDialogTitle>{t.titulo}</AlertDialogTitle>
          <AlertDialogDescription>{dados ? t.selos(dados.selos) : null}</AlertDialogDescription>
          <form className="grid gap-3" onSubmit={(e) => (e.preventDefault(), enviar())}>
            <fieldset className="grid gap-1">
              <legend className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                {t.modo}
              </legend>
              {opcao("normal", t.normal)}
              {dados?.clube ? opcao("credito_clube", t.clube) : null}
              {dados?.premio ? opcao("premio", t.premio(dados.selosNecessarios)) : null}
            </fieldset>
            {modo === "normal" ? (
              <Campo
                id={`valor-${id}`}
                rotulo={t.valor}
                ajuda={t.valorAjuda}
                inputMode="decimal"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />
            ) : null}
            {dados?.cartoes && modo === "normal" ? (
              <label className="flex min-h-11 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={cartao.usar}
                  onChange={(e) => setCartao({ ...cartao, usar: e.target.checked })}
                />
                {t.cartao}
              </label>
            ) : null}
            {cartao.usar && modo === "normal" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Campo
                  id={`cartao-${id}`}
                  rotulo={t.codigo}
                  autoCapitalize="characters"
                  value={cartao.codigo}
                  onChange={(e) => setCartao({ ...cartao, codigo: e.target.value })}
                />
                <Campo
                  id={`cartao-valor-${id}`}
                  rotulo={t.valorCartao}
                  inputMode="decimal"
                  value={cartao.valor}
                  onChange={(e) => setCartao({ ...cartao, valor: e.target.value })}
                />
              </div>
            ) : null}
            {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <AlertDialogCancel className="h-11">{textos.comum.cancelar}</AlertDialogCancel>
              <Button type="submit" className="h-11" disabled={aGuardar}>
                {t.confirmar}
              </Button>
            </div>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
