"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Campo } from "@/components/nucleo/campo";
import { textoErro } from "@/lib/adesao/erros";
import { textos } from "@/lib/i18n/pt-PT";
import { cn } from "@/lib/utils";
import type { DadosPedidoAdesao } from "@/lib/validacao/adesao";

const t = textos.adesao.contactos;

/** Passo 2: contactos e horário (D.8). */
export function PassoContactos() {
  const { register, setValue, control, formState } = useFormContext<DadosPedidoAdesao>();
  const e = formState.errors.contactos;
  const descanso = useWatch({ control, name: "contactos.dias_descanso" }) ?? [];
  const alternar = (dia: number) =>
    setValue(
      "contactos.dias_descanso",
      descanso.includes(dia) ? descanso.filter((d) => d !== dia) : [...descanso, dia].sort(),
    );

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo
          id="telefone"
          rotulo={t.telefone}
          type="tel"
          inputMode="tel"
          erro={textoErro(e?.telefone?.message)}
          {...register("contactos.telefone")}
        />
        <Campo
          id="whatsapp"
          rotulo={t.whatsapp}
          type="tel"
          inputMode="tel"
          erro={textoErro(e?.whatsapp?.message)}
          {...register("contactos.whatsapp")}
        />
      </div>
      <Campo
        id="email-barbearia"
        rotulo={t.email}
        type="email"
        erro={textoErro(e?.email?.message)}
        {...register("contactos.email")}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo
          id="cidade"
          rotulo={t.cidade}
          erro={textoErro(e?.cidade?.message)}
          {...register("contactos.cidade")}
        />
        <Campo
          id="morada"
          rotulo={t.morada}
          erro={textoErro(e?.morada?.message)}
          {...register("contactos.morada")}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Campo id="instagram" rotulo={t.instagram} {...register("contactos.instagram")} />
        <Campo id="facebook" rotulo={t.facebook} {...register("contactos.facebook")} />
        <Campo id="tiktok" rotulo={t.tiktok} {...register("contactos.tiktok")} />
      </div>
      <Campo
        id="maps"
        rotulo={t.maps}
        type="url"
        erro={textoErro(e?.google_maps_url?.message)}
        {...register("contactos.google_maps_url")}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo
          id="abertura"
          rotulo={t.abertura}
          type="time"
          erro={textoErro(e?.hora_abertura?.message)}
          {...register("contactos.hora_abertura")}
        />
        <Campo
          id="fecho"
          rotulo={t.fecho}
          type="time"
          erro={textoErro(e?.hora_fecho?.message)}
          {...register("contactos.hora_fecho")}
        />
        <Campo
          id="almoco-inicio"
          rotulo={t.almocoInicio}
          type="time"
          {...register("contactos.intervalo_almoco_inicio")}
        />
        <Campo
          id="almoco-fim"
          rotulo={t.almocoFim}
          type="time"
          erro={textoErro(e?.intervalo_almoco_fim?.message)}
          {...register("contactos.intervalo_almoco_fim")}
        />
      </div>
      <fieldset className="grid gap-2">
        <legend className="mb-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          {t.descanso}
        </legend>
        <div className="flex flex-wrap gap-2">
          {t.dias.map((dia, i) => (
            <button
              key={dia}
              type="button"
              aria-pressed={descanso.includes(i)}
              onClick={() => alternar(i)}
              className={cn(
                "min-h-11 rounded-md border px-3 text-sm",
                descanso.includes(i)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card",
              )}
            >
              {dia}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
