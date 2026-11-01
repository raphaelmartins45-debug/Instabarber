"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { editar } from "@/app/(admin)/admin/(protegido)/equipa/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { formatarTelefone } from "@/lib/formatacao/telefone";
import { textos } from "@/lib/i18n/pt-PT";
import { type DadosEdicaoEquipa, esquemaEdicaoEquipa } from "@/lib/validacao/equipa-plataforma";

const t = textos.gestao.equipa;

/**
 * Editar uma pessoa da equipa InstaBarber (D-186): nome, e-mail de entrada e telefone. O nome é o
 * que assina as propostas, o folheto e os e-mails comerciais. Abre por baixo do botão.
 */
export function EditarMembro(m: {
  perfilId: string;
  nome: string;
  email: string;
  telefone: string | null;
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  const { register, handleSubmit, formState, getValues } = useForm<DadosEdicaoEquipa>({
    resolver: zodResolver(esquemaEdicaoEquipa, undefined, { raw: true }),
    defaultValues: {
      nome: m.nome,
      email: m.email,
      telefone: m.telefone ? formatarTelefone(m.telefone) : "",
    },
  });
  const erro = (c: keyof DadosEdicaoEquipa) => {
    const e = formState.errors[c]?.message;
    return e ? (t.erros[e] ?? t.erros.generico) : undefined;
  };
  const guardar = handleSubmit(() =>
    iniciar(async () => {
      const r = await editar(m.perfilId, getValues());
      setAviso(
        r.ok
          ? { tipo: "sucesso", texto: t.guardado }
          : { tipo: "erro", texto: t.erros[r.erro] ?? t.erros.generico! },
      );
      if (r.ok) {
        setAberto(false);
        router.refresh();
      }
    }),
  );
  if (!aberto)
    return (
      <div className="grid gap-2">
        {aviso ? <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso> : null}
        <Button type="button" variant="outline" className="h-10" onClick={() => setAberto(true)}>
          {t.editar}
        </Button>
      </div>
    );
  return (
    <form onSubmit={guardar} className="grid w-full gap-3" noValidate data-testid="editar-membro">
      <p className="text-sm font-semibold">{t.editarTitulo(m.nome)}</p>
      <p className="text-xs text-muted-foreground">{t.editarAjuda}</p>
      {aviso?.tipo === "erro" ? <Aviso tipo="erro">{aviso.texto}</Aviso> : null}
      <Campo
        id={`nome-${m.perfilId}`}
        rotulo={t.campos.nome}
        erro={erro("nome")}
        {...register("nome")}
      />
      <Campo
        id={`email-${m.perfilId}`}
        type="email"
        rotulo={t.email}
        erro={erro("email")}
        {...register("email")}
      />
      <Campo
        id={`telefone-${m.perfilId}`}
        type="tel"
        rotulo={t.telefone}
        erro={erro("telefone")}
        {...register("telefone")}
      />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" className="h-10" disabled={aGuardar}>
          {t.guardar}
        </Button>
        <Button type="button" variant="ghost" className="h-10" onClick={() => setAberto(false)}>
          {t.cancelar}
        </Button>
      </div>
    </form>
  );
}
