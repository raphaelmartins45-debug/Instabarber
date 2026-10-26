"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { registarComprovativo } from "@/app/(app)/app/(painel)/plano/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { CampoFicheiro } from "@/components/nucleo/campo-ficheiro";
import { Selecao } from "@/components/nucleo/selecao";
import { Button } from "@/components/ui/button";
import { descreverFicheiro } from "@/lib/formatacao/ficheiros";
import { textos } from "@/lib/i18n/pt-PT";
import { COMPROVATIVO, extensaoComprovativo } from "@/lib/regras/comprovativos";
import { BUCKET_COMPROVATIVOS } from "@/lib/repositorios/comprovativos";
import { criarClienteBrowser } from "@/lib/supabase/browser";

const t = textos.comprovativos;

/**
 * Enviar o comprovativo da mensalidade (D-168): o ficheiro vai direto para o bucket privado, na
 * pasta da barbearia (o RLS do Storage só deixa o dono), e depois a base de dados regista-o.
 */
export function EnviarComprovativo({
  inquilinoId,
  ajuda,
  valorInicial,
  hoje,
}: {
  inquilinoId: string;
  ajuda: string;
  valorInicial: string;
  hoje: string;
}) {
  const router = useRouter();
  const [metodo, setMetodo] = useState("mbway");
  const [ficheiro, setFicheiro] = useState<File>();
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aEnviar, iniciar] = useTransition();
  const erro = (codigo: string) =>
    setAviso({ tipo: "erro", texto: t.erros[codigo] ?? t.erros.generico! });

  const enviar = (form: FormData) =>
    iniciar(async () => {
      const extensao = ficheiro ? extensaoComprovativo(ficheiro) : null;
      if (!ficheiro || !extensao) return erro("ficheiro");
      const caminho = `${inquilinoId}/${crypto.randomUUID()}.${extensao}`;
      const { error } = await criarClienteBrowser()
        .storage.from(BUCKET_COMPROVATIVOS)
        .upload(caminho, ficheiro, { contentType: ficheiro.type, upsert: false });
      if (error) return erro("carregar");
      const r = await registarComprovativo({
        inquilinoId,
        metodo: metodo as "mbway",
        valor: String(form.get("valor") ?? ""),
        pagoEm: String(form.get("pagoEm") ?? ""),
        caminho,
      });
      if (!r.ok) return erro(r.erro);
      setAviso({ tipo: "sucesso", texto: t.enviado });
      router.refresh();
    });

  return (
    <form action={enviar} className="grid gap-3" data-testid="enviar-comprovativo">
      <p className="text-sm text-muted-foreground">{ajuda}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <Selecao
          id="comprovativo-metodo"
          rotulo={t.metodo}
          valor={metodo}
          aoMudar={setMetodo}
          opcoes={Object.entries(t.metodos).map(([id, rotulo]) => ({ id, rotulo }))}
        />
        <Campo
          id="comprovativo-valor"
          name="valor"
          rotulo={t.valor}
          inputMode="decimal"
          defaultValue={valorInicial}
          required
        />
        <Campo
          id="comprovativo-data"
          name="pagoEm"
          type="date"
          rotulo={t.data}
          defaultValue={hoje}
          max={hoje}
          required
        />
      </div>
      <CampoFicheiro
        rotulo={t.ficheiro}
        ajuda={descreverFicheiro({
          formatos: Object.keys(COMPROVATIVO.tipos),
          maxBytes: COMPROVATIVO.maxBytes,
        })}
        accept={Object.keys(COMPROVATIVO.tipos).join(",")}
        aoEscolher={setFicheiro}
        testId="comprovativo-ficheiro"
      />
      {aviso ? <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso> : null}
      <Button type="submit" className="h-11 sm:justify-self-start" disabled={aEnviar}>
        {aEnviar ? t.aEnviar : t.enviar}
      </Button>
    </form>
  );
}
