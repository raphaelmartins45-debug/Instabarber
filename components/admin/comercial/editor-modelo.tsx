"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { guardarModelo } from "@/app/(admin)/admin/(protegido)/comercial/acoes-contratos";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { substituirMarcadores } from "@/lib/comercial/contrato";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.comercial.modelos;

/**
 * Editar um rascunho de modelo (N.8) com pré-visualização ao lado: os marcadores trocam-se
 * pelos dados de exemplo e um marcador desconhecido aparece logo.
 */
export function EditorModelo({
  id,
  titulo: tituloInicial,
  corpo: corpoInicial,
  editavel,
}: {
  id: string;
  titulo: string;
  corpo: string;
  editavel: boolean;
}) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(tituloInicial);
  const [corpo, setCorpo] = useState(corpoInicial);
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  const previa = substituirMarcadores(corpo, t.exemplo, textos.comercial.naoAplicavel);
  const guardar = () =>
    iniciar(async () => {
      const r = await guardarModelo(id, titulo, corpo);
      setAviso(
        r.ok
          ? { tipo: "sucesso", texto: t.guardado }
          : { tipo: "erro", texto: textos.comercial.contratos.erros.generico! },
      );
      if (r.ok) router.refresh();
    });
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="grid content-start gap-4">
        {!editavel ? <Aviso tipo="erro">{t.soLeitura}</Aviso> : null}
        {aviso ? <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso> : null}
        <Campo
          id="modelo-titulo"
          rotulo={t.tituloCampo}
          value={titulo}
          readOnly={!editavel}
          onChange={(e) => setTitulo(e.target.value)}
        />
        <div className="grid gap-1.5">
          <Label htmlFor="modelo-corpo" className="rotulo">
            {t.corpo}
          </Label>
          <textarea
            id="modelo-corpo"
            value={corpo}
            readOnly={!editavel}
            onChange={(e) => setCorpo(e.target.value)}
            className="min-h-[60dvh] rounded-md border bg-transparent p-3 font-mono text-xs"
          />
        </div>
        {editavel ? (
          <Button onClick={guardar} disabled={aGuardar} className="justify-self-start">
            {t.guardar}
          </Button>
        ) : null}
      </div>
      <div className="grid content-start gap-2">
        <p className="rotulo">{t.preVisualizar}</p>
        {!previa.ok && previa.desconhecidos.length ? (
          <Aviso tipo="erro">{t.marcadoresDesconhecidos(previa.desconhecidos.join(", "))}</Aviso>
        ) : null}
        <pre className="cartao max-h-[70dvh] overflow-auto rounded-2xl p-4 text-xs whitespace-pre-wrap">
          {previa.ok ? previa.texto : corpo}
        </pre>
      </div>
    </div>
  );
}
