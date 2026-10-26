export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: { extensions?: Json; operationName?: string; query?: string; variables?: Json };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      acertos: {
        Row: {
          criado_em: string;
          estado: string;
          id: string;
          inquilino_id: string;
          liquidado_em: string | null;
          mes_referencia: string;
          metodo: string | null;
          modelo: string;
          nota: string | null;
          parte_barbearia: number;
          parte_barbeiro: number;
          profissional_id: string;
          receita: number;
          sentido: string;
          tipo: string;
          valor_liquidado: number | null;
        };
        ComputedFields: never;
        Insert: {
          criado_em?: string;
          estado?: string;
          id?: string;
          inquilino_id: string;
          liquidado_em?: string | null;
          mes_referencia: string;
          metodo?: string | null;
          modelo: string;
          nota?: string | null;
          parte_barbearia?: number;
          parte_barbeiro?: number;
          profissional_id: string;
          receita?: number;
          sentido: string;
          tipo?: string;
          valor_liquidado?: number | null;
        };
        Update: {
          criado_em?: string;
          estado?: string;
          id?: string;
          inquilino_id?: string;
          liquidado_em?: string | null;
          mes_referencia?: string;
          metodo?: string | null;
          modelo?: string;
          nota?: string | null;
          parte_barbearia?: number;
          parte_barbeiro?: number;
          profissional_id?: string;
          receita?: number;
          sentido?: string;
          tipo?: string;
          valor_liquidado?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "acertos_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "acertos_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "acertos_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
          {
            foreignKeyName: "acertos_inquilino_id_profissional_id_fkey";
            columns: ["inquilino_id", "profissional_id"];
            isOneToOne: false;
            referencedRelation: "profissionais";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "acertos_inquilino_id_profissional_id_fkey";
            columns: ["inquilino_id", "profissional_id"];
            isOneToOne: false;
            referencedRelation: "publico_profissionais";
            referencedColumns: ["inquilino_id", "id"];
          },
        ];
      };
      apoio_registos: {
        Row: {
          assunto: string;
          criado_em: string;
          criado_por: string | null;
          estado: string;
          id: string;
          inquilino_id: string;
          resolvido_em: string | null;
          texto: string | null;
          tipo: string;
        };
        ComputedFields: never;
        Insert: {
          assunto: string;
          criado_em?: string;
          criado_por?: string | null;
          estado?: string;
          id?: string;
          inquilino_id: string;
          resolvido_em?: string | null;
          texto?: string | null;
          tipo: string;
        };
        Update: {
          assunto?: string;
          criado_em?: string;
          criado_por?: string | null;
          estado?: string;
          id?: string;
          inquilino_id?: string;
          resolvido_em?: string | null;
          texto?: string | null;
          tipo?: string;
        };
        Relationships: [
          {
            foreignKeyName: "apoio_registos_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "apoio_registos_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "apoio_registos_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
        ];
      };
      auditoria: {
        Row: {
          accao: string;
          criado_em: string;
          detalhes: Json | null;
          entidade: string | null;
          entidade_id: string | null;
          id: number;
          inquilino_id: string | null;
          user_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          accao: string;
          criado_em?: string;
          detalhes?: Json | null;
          entidade?: string | null;
          entidade_id?: string | null;
          id?: never;
          inquilino_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          accao?: string;
          criado_em?: string;
          detalhes?: Json | null;
          entidade?: string | null;
          entidade_id?: string | null;
          id?: never;
          inquilino_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "auditoria_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "auditoria_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "auditoria_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
        ];
      };
      ausencias: {
        Row: {
          criado_em: string;
          criado_por: string | null;
          fim: string;
          id: string;
          inicio: string;
          inquilino_id: string;
          motivo: string | null;
          profissional_id: string | null;
          tipo: string;
        };
        ComputedFields: never;
        Insert: {
          criado_em?: string;
          criado_por?: string | null;
          fim: string;
          id?: string;
          inicio: string;
          inquilino_id: string;
          motivo?: string | null;
          profissional_id?: string | null;
          tipo?: string;
        };
        Update: {
          criado_em?: string;
          criado_por?: string | null;
          fim?: string;
          id?: string;
          inicio?: string;
          inquilino_id?: string;
          motivo?: string | null;
          profissional_id?: string | null;
          tipo?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ausencias_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ausencias_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ausencias_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
          {
            foreignKeyName: "ausencias_inquilino_id_profissional_id_fkey";
            columns: ["inquilino_id", "profissional_id"];
            isOneToOne: false;
            referencedRelation: "profissionais";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "ausencias_inquilino_id_profissional_id_fkey";
            columns: ["inquilino_id", "profissional_id"];
            isOneToOne: false;
            referencedRelation: "publico_profissionais";
            referencedColumns: ["inquilino_id", "id"];
          },
        ];
      };
      briefings: {
        Row: {
          atualizado_em: string;
          atualizado_por: string | null;
          dados: NonNullable<Json>;
          lead_id: string;
        };
        ComputedFields: never;
        Insert: {
          atualizado_em?: string;
          atualizado_por?: string | null;
          dados?: NonNullable<Json>;
          lead_id: string;
        };
        Update: {
          atualizado_em?: string;
          atualizado_por?: string | null;
          dados?: NonNullable<Json>;
          lead_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "briefings_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: true;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      cartoes_oferta: {
        Row: {
          anulado_em: string | null;
          beneficiario_nome: string | null;
          codigo: string;
          comprador_cliente_id: string | null;
          comprador_nome: string;
          id: string;
          inquilino_id: string;
          metodo: string | null;
          valido_ate: string;
          valor_inicial: number;
          vendido_em: string;
          vendido_por: string | null;
        };
        ComputedFields: never;
        Insert: {
          anulado_em?: string | null;
          beneficiario_nome?: string | null;
          codigo: string;
          comprador_cliente_id?: string | null;
          comprador_nome: string;
          id?: string;
          inquilino_id: string;
          metodo?: string | null;
          valido_ate: string;
          valor_inicial: number;
          vendido_em?: string;
          vendido_por?: string | null;
        };
        Update: {
          anulado_em?: string | null;
          beneficiario_nome?: string | null;
          codigo?: string;
          comprador_cliente_id?: string | null;
          comprador_nome?: string;
          id?: string;
          inquilino_id?: string;
          metodo?: string | null;
          valido_ate?: string;
          valor_inicial?: number;
          vendido_em?: string;
          vendido_por?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "cartoes_oferta_inquilino_id_comprador_cliente_id_fkey";
            columns: ["inquilino_id", "comprador_cliente_id"];
            isOneToOne: false;
            referencedRelation: "clientes";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "cartoes_oferta_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cartoes_oferta_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cartoes_oferta_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
        ];
      };
      ciclos_clube: {
        Row: {
          fim: string;
          id: string;
          inicio: string;
          inquilino_id: string;
          metodo: string | null;
          pago_em: string | null;
          subscricao_id: string;
          valor: number;
        };
        ComputedFields: never;
        Insert: {
          fim: string;
          id?: string;
          inicio: string;
          inquilino_id: string;
          metodo?: string | null;
          pago_em?: string | null;
          subscricao_id: string;
          valor: number;
        };
        Update: {
          fim?: string;
          id?: string;
          inicio?: string;
          inquilino_id?: string;
          metodo?: string | null;
          pago_em?: string | null;
          subscricao_id?: string;
          valor?: number;
        };
        Relationships: [
          {
            foreignKeyName: "ciclos_clube_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ciclos_clube_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ciclos_clube_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
          {
            foreignKeyName: "ciclos_clube_inquilino_id_subscricao_id_fkey";
            columns: ["inquilino_id", "subscricao_id"];
            isOneToOne: false;
            referencedRelation: "subscricoes";
            referencedColumns: ["inquilino_id", "id"];
          },
        ];
      };
      clientes: {
        Row: {
          anonimizado_em: string | null;
          auth_user_id: string | null;
          codigo_convite: string | null;
          consentimento_em: string | null;
          consentimento_mensagens: boolean;
          convidado_por: string | null;
          criado_em: string;
          criado_por: string | null;
          data_nascimento: string | null;
          email: string | null;
          faltas_perdoadas_em: string | null;
          id: string;
          inquilino_id: string;
          nao_contactar: boolean;
          nif: string | null;
          nome: string;
          notas: string | null;
          origem: string;
          telefone: string | null;
        };
        ComputedFields: never;
        Insert: {
          anonimizado_em?: string | null;
          auth_user_id?: string | null;
          codigo_convite?: string | null;
          consentimento_em?: string | null;
          consentimento_mensagens?: boolean;
          convidado_por?: string | null;
          criado_em?: string;
          criado_por?: string | null;
          data_nascimento?: string | null;
          email?: string | null;
          faltas_perdoadas_em?: string | null;
          id?: string;
          inquilino_id: string;
          nao_contactar?: boolean;
          nif?: string | null;
          nome: string;
          notas?: string | null;
          origem?: string;
          telefone?: string | null;
        };
        Update: {
          anonimizado_em?: string | null;
          auth_user_id?: string | null;
          codigo_convite?: string | null;
          consentimento_em?: string | null;
          consentimento_mensagens?: boolean;
          convidado_por?: string | null;
          criado_em?: string;
          criado_por?: string | null;
          data_nascimento?: string | null;
          email?: string | null;
          faltas_perdoadas_em?: string | null;
          id?: string;
          inquilino_id?: string;
          nao_contactar?: boolean;
          nif?: string | null;
          nome?: string;
          notas?: string | null;
          origem?: string;
          telefone?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "clientes_inquilino_id_convidado_por_fkey";
            columns: ["inquilino_id", "convidado_por"];
            isOneToOne: false;
            referencedRelation: "clientes";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "clientes_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clientes_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clientes_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
        ];
      };
      clube_servicos: {
        Row: {
          clube_id: string;
          id: string;
          inquilino_id: string;
          quantidade_mes: number;
          servico_id: string;
        };
        ComputedFields: never;
        Insert: {
          clube_id: string;
          id?: string;
          inquilino_id: string;
          quantidade_mes: number;
          servico_id: string;
        };
        Update: {
          clube_id?: string;
          id?: string;
          inquilino_id?: string;
          quantidade_mes?: number;
          servico_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clube_servicos_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clube_servicos_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clube_servicos_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
          {
            foreignKeyName: "clube_servicos_inquilino_id_clube_id_fkey";
            columns: ["inquilino_id", "clube_id"];
            isOneToOne: false;
            referencedRelation: "clubes";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "clube_servicos_inquilino_id_clube_id_fkey";
            columns: ["inquilino_id", "clube_id"];
            isOneToOne: false;
            referencedRelation: "publico_clubes";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "clube_servicos_inquilino_id_servico_id_fkey";
            columns: ["inquilino_id", "servico_id"];
            isOneToOne: false;
            referencedRelation: "publico_servicos";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "clube_servicos_inquilino_id_servico_id_fkey";
            columns: ["inquilino_id", "servico_id"];
            isOneToOne: false;
            referencedRelation: "servicos";
            referencedColumns: ["inquilino_id", "id"];
          },
        ];
      };
      clubes: {
        Row: {
          ativo: boolean;
          criado_em: string;
          id: string;
          inquilino_id: string;
          nome: string;
          preco_mensal: number;
          renovacao_auto: boolean;
          transita_credito: boolean;
          validade_dias: number;
        };
        ComputedFields: never;
        Insert: {
          ativo?: boolean;
          criado_em?: string;
          id?: string;
          inquilino_id: string;
          nome: string;
          preco_mensal: number;
          renovacao_auto?: boolean;
          transita_credito?: boolean;
          validade_dias?: number;
        };
        Update: {
          ativo?: boolean;
          criado_em?: string;
          id?: string;
          inquilino_id?: string;
          nome?: string;
          preco_mensal?: number;
          renovacao_auto?: boolean;
          transita_credito?: boolean;
          validade_dias?: number;
        };
        Relationships: [
          {
            foreignKeyName: "clubes_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clubes_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clubes_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
        ];
      };
      codigos_acesso: {
        Row: {
          cliente_id: string;
          codigo: string;
          criado_em: string;
          enviado_em: string | null;
          expira_em: string;
          id: string;
          inquilino_id: string;
          tentativas: number;
          usado_em: string | null;
        };
        ComputedFields: never;
        Insert: {
          cliente_id: string;
          codigo: string;
          criado_em?: string;
          enviado_em?: string | null;
          expira_em: string;
          id?: string;
          inquilino_id: string;
          tentativas?: number;
          usado_em?: string | null;
        };
        Update: {
          cliente_id?: string;
          codigo?: string;
          criado_em?: string;
          enviado_em?: string | null;
          expira_em?: string;
          id?: string;
          inquilino_id?: string;
          tentativas?: number;
          usado_em?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "codigos_acesso_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "codigos_acesso_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "codigos_acesso_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
          {
            foreignKeyName: "codigos_acesso_inquilino_id_cliente_id_fkey";
            columns: ["inquilino_id", "cliente_id"];
            isOneToOne: false;
            referencedRelation: "clientes";
            referencedColumns: ["inquilino_id", "id"];
          },
        ];
      };
      comissoes_comerciais: {
        Row: {
          comercial_id: string | null;
          contrato_id: string;
          criado_em: string;
          estado: string;
          id: string;
          paga_em: string | null;
          taxa_paga_em: string | null;
          valor: number;
          vence_em: string | null;
        };
        ComputedFields: never;
        Insert: {
          comercial_id?: string | null;
          contrato_id: string;
          criado_em?: string;
          estado?: string;
          id?: string;
          paga_em?: string | null;
          taxa_paga_em?: string | null;
          valor: number;
          vence_em?: string | null;
        };
        Update: {
          comercial_id?: string | null;
          contrato_id?: string;
          criado_em?: string;
          estado?: string;
          id?: string;
          paga_em?: string | null;
          taxa_paga_em?: string | null;
          valor?: number;
          vence_em?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "comissoes_comerciais_contrato_id_fkey";
            columns: ["contrato_id"];
            isOneToOne: true;
            referencedRelation: "contratos";
            referencedColumns: ["id"];
          },
        ];
      };
      comissoes_servico: {
        Row: {
          criado_em: string;
          id: string;
          inquilino_id: string;
          percentagem: number;
          profissional_id: string;
          servico_id: string;
        };
        ComputedFields: never;
        Insert: {
          criado_em?: string;
          id?: string;
          inquilino_id: string;
          percentagem: number;
          profissional_id: string;
          servico_id: string;
        };
        Update: {
          criado_em?: string;
          id?: string;
          inquilino_id?: string;
          percentagem?: number;
          profissional_id?: string;
          servico_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comissoes_servico_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comissoes_servico_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comissoes_servico_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
          {
            foreignKeyName: "comissoes_servico_inquilino_id_profissional_id_fkey";
            columns: ["inquilino_id", "profissional_id"];
            isOneToOne: false;
            referencedRelation: "profissionais";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "comissoes_servico_inquilino_id_profissional_id_fkey";
            columns: ["inquilino_id", "profissional_id"];
            isOneToOne: false;
            referencedRelation: "publico_profissionais";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "comissoes_servico_inquilino_id_servico_id_fkey";
            columns: ["inquilino_id", "servico_id"];
            isOneToOne: false;
            referencedRelation: "publico_servicos";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "comissoes_servico_inquilino_id_servico_id_fkey";
            columns: ["inquilino_id", "servico_id"];
            isOneToOne: false;
            referencedRelation: "servicos";
            referencedColumns: ["inquilino_id", "id"];
          },
        ];
      };
      comprovativos_pagamento: {
        Row: {
          caminho: string;
          decidido_em: string | null;
          decidido_por: string | null;
          enviado_em: string;
          enviado_por: string | null;
          estado: string;
          fatura_id: string | null;
          id: string;
          inquilino_id: string;
          metodo: string;
          motivo: string | null;
          pago_em: string;
          periodo_fim: string;
          periodo_inicio: string;
          recebimento_id: string | null;
          valor: number;
        };
        ComputedFields: never;
        Insert: {
          caminho: string;
          decidido_em?: string | null;
          decidido_por?: string | null;
          enviado_em?: string;
          enviado_por?: string | null;
          estado?: string;
          fatura_id?: string | null;
          id?: string;
          inquilino_id: string;
          metodo: string;
          motivo?: string | null;
          pago_em: string;
          periodo_fim: string;
          periodo_inicio: string;
          recebimento_id?: string | null;
          valor: number;
        };
        Update: {
          caminho?: string;
          decidido_em?: string | null;
          decidido_por?: string | null;
          enviado_em?: string;
          enviado_por?: string | null;
          estado?: string;
          fatura_id?: string | null;
          id?: string;
          inquilino_id?: string;
          metodo?: string;
          motivo?: string | null;
          pago_em?: string;
          periodo_fim?: string;
          periodo_inicio?: string;
          recebimento_id?: string | null;
          valor?: number;
        };
        Relationships: [
          {
            foreignKeyName: "comprovativos_pagamento_fatura_id_fkey";
            columns: ["fatura_id"];
            isOneToOne: false;
            referencedRelation: "faturas_plataforma";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comprovativos_pagamento_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comprovativos_pagamento_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comprovativos_pagamento_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
          {
            foreignKeyName: "comprovativos_pagamento_recebimento_id_fkey";
            columns: ["recebimento_id"];
            isOneToOne: false;
            referencedRelation: "recebimentos";
            referencedColumns: ["id"];
          },
        ];
      };
      comunicado_leituras: {
        Row: {
          comunicado_id: string;
          inquilino_id: string;
          lido_em: string;
          lido_por: string | null;
        };
        ComputedFields: never;
        Insert: {
          comunicado_id: string;
          inquilino_id: string;
          lido_em?: string;
          lido_por?: string | null;
        };
        Update: {
          comunicado_id?: string;
          inquilino_id?: string;
          lido_em?: string;
          lido_por?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "comunicado_leituras_comunicado_id_fkey";
            columns: ["comunicado_id"];
            isOneToOne: false;
            referencedRelation: "comunicados";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comunicado_leituras_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comunicado_leituras_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comunicado_leituras_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
        ];
      };
      comunicados: {
        Row: {
          criado_em: string;
          criado_por: string | null;
          destino: string;
          fim: string | null;
          id: string;
          inicio: string;
          inquilino_id: string | null;
          plano: string | null;
          texto: string;
          titulo: string;
        };
        ComputedFields: never;
        Insert: {
          criado_em?: string;
          criado_por?: string | null;
          destino: string;
          fim?: string | null;
          id?: string;
          inicio?: string;
          inquilino_id?: string | null;
          plano?: string | null;
          texto: string;
          titulo: string;
        };
        Update: {
          criado_em?: string;
          criado_por?: string | null;
          destino?: string;
          fim?: string | null;
          id?: string;
          inicio?: string;
          inquilino_id?: string | null;
          plano?: string | null;
          texto?: string;
          titulo?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comunicados_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comunicados_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comunicados_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
        ];
      };
      configuracao_comercial: {
        Row: {
          atualizado_em: string;
          atualizado_por: string | null;
          desconto_max_mensalidade_pct: number;
          desconto_max_taxa_pct: number;
          descontos_ativos: boolean;
          id: boolean;
          taxa_migracao_ativa: boolean;
          taxa_migracao_sem_iva: number;
        };
        ComputedFields: never;
        Insert: {
          atualizado_em?: string;
          atualizado_por?: string | null;
          desconto_max_mensalidade_pct?: number;
          desconto_max_taxa_pct?: number;
          descontos_ativos?: boolean;
          id?: boolean;
          taxa_migracao_ativa?: boolean;
          taxa_migracao_sem_iva?: number;
        };
        Update: {
          atualizado_em?: string;
          atualizado_por?: string | null;
          desconto_max_mensalidade_pct?: number;
          desconto_max_taxa_pct?: number;
          descontos_ativos?: boolean;
          id?: boolean;
          taxa_migracao_ativa?: boolean;
          taxa_migracao_sem_iva?: number;
        };
        Relationships: [];
      };
      contas_pagar: {
        Row: {
          criado_em: string;
          custo_id: string | null;
          descricao: string | null;
          fornecedor: string;
          id: string;
          nota: string | null;
          pago_em: string | null;
          valor_com_iva: number;
          valor_sem_iva: number;
          vencimento: string;
        };
        ComputedFields: never;
        Insert: {
          criado_em?: string;
          custo_id?: string | null;
          descricao?: string | null;
          fornecedor: string;
          id?: string;
          nota?: string | null;
          pago_em?: string | null;
          valor_com_iva: number;
          valor_sem_iva: number;
          vencimento: string;
        };
        Update: {
          criado_em?: string;
          custo_id?: string | null;
          descricao?: string | null;
          fornecedor?: string;
          id?: string;
          nota?: string | null;
          pago_em?: string | null;
          valor_com_iva?: number;
          valor_sem_iva?: number;
          vencimento?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contas_pagar_custo_id_fkey";
            columns: ["custo_id"];
            isOneToOne: false;
            referencedRelation: "custos_plataforma";
            referencedColumns: ["id"];
          },
        ];
      };
      contratos: {
        Row: {
          assinado_em: string | null;
          criado_em: string;
          criado_por: string | null;
          dados: NonNullable<Json>;
          data_inicio: string | null;
          estado: string;
          id: string;
          inquilino_id: string | null;
          lead_id: string;
          modelo_id: string;
          numero: string;
          pdf_assinado_path: string | null;
          pdf_path: string | null;
          proposta_id: string;
          texto: string;
        };
        ComputedFields: never;
        Insert: {
          assinado_em?: string | null;
          criado_em?: string;
          criado_por?: string | null;
          dados: NonNullable<Json>;
          data_inicio?: string | null;
          estado?: string;
          id?: string;
          inquilino_id?: string | null;
          lead_id: string;
          modelo_id: string;
          numero: string;
          pdf_assinado_path?: string | null;
          pdf_path?: string | null;
          proposta_id: string;
          texto: string;
        };
        Update: {
          assinado_em?: string | null;
          criado_em?: string;
          criado_por?: string | null;
          dados?: NonNullable<Json>;
          data_inicio?: string | null;
          estado?: string;
          id?: string;
          inquilino_id?: string | null;
          lead_id?: string;
          modelo_id?: string;
          numero?: string;
          pdf_assinado_path?: string | null;
          pdf_path?: string | null;
          proposta_id?: string;
          texto?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contratos_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contratos_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contratos_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
          {
            foreignKeyName: "contratos_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contratos_modelo_id_fkey";
            columns: ["modelo_id"];
            isOneToOne: false;
            referencedRelation: "modelos_documento";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contratos_proposta_id_fkey";
            columns: ["proposta_id"];
            isOneToOne: false;
            referencedRelation: "propostas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contratos_proposta_id_fkey";
            columns: ["proposta_id"];
            isOneToOne: false;
            referencedRelation: "propostas_com_estado";
            referencedColumns: ["id"];
          },
        ];
      };
      convites_adesao: {
        Row: {
          contrato_id: string;
          criado_em: string;
          dados: NonNullable<Json>;
          expira_em: string;
          id: string;
          token_hash: string;
          usado_em: string | null;
        };
        ComputedFields: never;
        Insert: {
          contrato_id: string;
          criado_em?: string;
          dados: NonNullable<Json>;
          expira_em: string;
          id?: string;
          token_hash: string;
          usado_em?: string | null;
        };
        Update: {
          contrato_id?: string;
          criado_em?: string;
          dados?: NonNullable<Json>;
          expira_em?: string;
          id?: string;
          token_hash?: string;
          usado_em?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "convites_adesao_contrato_id_fkey";
            columns: ["contrato_id"];
            isOneToOne: false;
            referencedRelation: "contratos";
            referencedColumns: ["id"];
          },
        ];
      };
      creditos_clube: {
        Row: {
          ciclo_id: string;
          id: string;
          inquilino_id: string;
          quantidade: number;
          servico_id: string;
          usados: number;
        };
        ComputedFields: never;
        Insert: {
          ciclo_id: string;
          id?: string;
          inquilino_id: string;
          quantidade: number;
          servico_id: string;
          usados?: number;
        };
        Update: {
          ciclo_id?: string;
          id?: string;
          inquilino_id?: string;
          quantidade?: number;
          servico_id?: string;
          usados?: number;
        };
        Relationships: [
          {
            foreignKeyName: "creditos_clube_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "creditos_clube_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "creditos_clube_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
          {
            foreignKeyName: "creditos_clube_inquilino_id_ciclo_id_fkey";
            columns: ["inquilino_id", "ciclo_id"];
            isOneToOne: false;
            referencedRelation: "ciclos_clube";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "creditos_clube_inquilino_id_servico_id_fkey";
            columns: ["inquilino_id", "servico_id"];
            isOneToOne: false;
            referencedRelation: "publico_servicos";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "creditos_clube_inquilino_id_servico_id_fkey";
            columns: ["inquilino_id", "servico_id"];
            isOneToOne: false;
            referencedRelation: "servicos";
            referencedColumns: ["inquilino_id", "id"];
          },
        ];
      };
      custos_fixos: {
        Row: {
          descricao: string;
          id: string;
          inquilino_id: string;
          pago: boolean;
          pago_em: string | null;
          recorrente: boolean;
          valor: number;
          vencimento: string;
        };
        ComputedFields: never;
        Insert: {
          descricao: string;
          id?: string;
          inquilino_id: string;
          pago?: boolean;
          pago_em?: string | null;
          recorrente?: boolean;
          valor: number;
          vencimento: string;
        };
        Update: {
          descricao?: string;
          id?: string;
          inquilino_id?: string;
          pago?: boolean;
          pago_em?: string | null;
          recorrente?: boolean;
          valor?: number;
          vencimento?: string;
        };
        Relationships: [
          {
            foreignKeyName: "custos_fixos_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "custos_fixos_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "custos_fixos_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
        ];
      };
      custos_plataforma: {
        Row: {
          ativo: boolean;
          categoria: string;
          criado_em: string;
          data_fim: string | null;
          data_inicio: string;
          descricao: string;
          id: string;
          nota: string | null;
          periodicidade: string;
          tipo: string;
          valor_sem_iva: number;
        };
        ComputedFields: never;
        Insert: {
          ativo?: boolean;
          categoria: string;
          criado_em?: string;
          data_fim?: string | null;
          data_inicio: string;
          descricao: string;
          id?: string;
          nota?: string | null;
          periodicidade?: string;
          tipo?: string;
          valor_sem_iva: number;
        };
        Update: {
          ativo?: boolean;
          categoria?: string;
          criado_em?: string;
          data_fim?: string | null;
          data_inicio?: string;
          descricao?: string;
          id?: string;
          nota?: string | null;
          periodicidade?: string;
          tipo?: string;
          valor_sem_iva?: number;
        };
        Relationships: [];
      };
      despesas: {
        Row: {
          categoria: string | null;
          data: string;
          descricao: string;
          id: string;
          inquilino_id: string;
          pago: boolean;
          pago_em: string | null;
          valor: number;
        };
        ComputedFields: never;
        Insert: {
          categoria?: string | null;
          data: string;
          descricao: string;
          id?: string;
          inquilino_id: string;
          pago?: boolean;
          pago_em?: string | null;
          valor: number;
        };
        Update: {
          categoria?: string | null;
          data?: string;
          descricao?: string;
          id?: string;
          inquilino_id?: string;
          pago?: boolean;
          pago_em?: string | null;
          valor?: number;
        };
        Relationships: [
          {
            foreignKeyName: "despesas_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "despesas_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "despesas_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
        ];
      };
      documentos_fiscais: {
        Row: {
          criado_em: string;
          emitente: string;
          emitido_em: string | null;
          estado: string;
          id: string;
          inquilino_id: string;
          modo: string;
          numero: string | null;
          profissional_id: string | null;
          tipo: string;
          valor: number;
          visita_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          criado_em?: string;
          emitente: string;
          emitido_em?: string | null;
          estado?: string;
          id?: string;
          inquilino_id: string;
          modo: string;
          numero?: string | null;
          profissional_id?: string | null;
          tipo?: string;
          valor: number;
          visita_id?: string | null;
        };
        Update: {
          criado_em?: string;
          emitente?: string;
          emitido_em?: string | null;
          estado?: string;
          id?: string;
          inquilino_id?: string;
          modo?: string;
          numero?: string | null;
          profissional_id?: string | null;
          tipo?: string;
          valor?: number;
          visita_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "documentos_fiscais_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documentos_fiscais_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documentos_fiscais_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
          {
            foreignKeyName: "documentos_fiscais_inquilino_id_profissional_id_fkey";
            columns: ["inquilino_id", "profissional_id"];
            isOneToOne: false;
            referencedRelation: "profissionais";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "documentos_fiscais_inquilino_id_profissional_id_fkey";
            columns: ["inquilino_id", "profissional_id"];
            isOneToOne: false;
            referencedRelation: "publico_profissionais";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "documentos_fiscais_inquilino_id_visita_id_fkey";
            columns: ["inquilino_id", "visita_id"];
            isOneToOne: false;
            referencedRelation: "visitas";
            referencedColumns: ["inquilino_id", "id"];
          },
        ];
      };
      faturas_plataforma: {
        Row: {
          emitida_em: string;
          id: string;
          inquilino_id: string;
          numero: string;
          paga_em: string | null;
          periodo_fim: string;
          periodo_inicio: string;
          valor: number;
        };
        ComputedFields: never;
        Insert: {
          emitida_em: string;
          id?: string;
          inquilino_id: string;
          numero: string;
          paga_em?: string | null;
          periodo_fim: string;
          periodo_inicio: string;
          valor: number;
        };
        Update: {
          emitida_em?: string;
          id?: string;
          inquilino_id?: string;
          numero?: string;
          paga_em?: string | null;
          periodo_fim?: string;
          periodo_inicio?: string;
          valor?: number;
        };
        Relationships: [
          {
            foreignKeyName: "faturas_plataforma_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "faturas_plataforma_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "faturas_plataforma_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
        ];
      };
      feriados: {
        Row: {
          data: string;
          id: string;
          inquilino_id: string | null;
          nome: string;
        };
        ComputedFields: never;
        Insert: {
          data: string;
          id?: string;
          inquilino_id?: string | null;
          nome: string;
        };
        Update: {
          data?: string;
          id?: string;
          inquilino_id?: string | null;
          nome?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feriados_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "feriados_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "feriados_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
        ];
      };
      fichas_tecnicas: {
        Row: {
          cliente_id: string;
          criado_em: string;
          criado_por: string | null;
          foto_path: string | null;
          id: string;
          inquilino_id: string;
          nota: string | null;
          profissional_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          cliente_id: string;
          criado_em?: string;
          criado_por?: string | null;
          foto_path?: string | null;
          id?: string;
          inquilino_id: string;
          nota?: string | null;
          profissional_id?: string | null;
        };
        Update: {
          cliente_id?: string;
          criado_em?: string;
          criado_por?: string | null;
          foto_path?: string | null;
          id?: string;
          inquilino_id?: string;
          nota?: string | null;
          profissional_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fichas_tecnicas_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fichas_tecnicas_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fichas_tecnicas_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
          {
            foreignKeyName: "fichas_tecnicas_inquilino_id_cliente_id_fkey";
            columns: ["inquilino_id", "cliente_id"];
            isOneToOne: false;
            referencedRelation: "clientes";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "fichas_tecnicas_inquilino_id_profissional_id_fkey";
            columns: ["inquilino_id", "profissional_id"];
            isOneToOne: false;
            referencedRelation: "profissionais";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "fichas_tecnicas_inquilino_id_profissional_id_fkey";
            columns: ["inquilino_id", "profissional_id"];
            isOneToOne: false;
            referencedRelation: "publico_profissionais";
            referencedColumns: ["inquilino_id", "id"];
          },
        ];
      };
      fila_espera: {
        Row: {
          avisado_em: string | null;
          cliente_id: string;
          criado_em: string;
          dia: string;
          estado: string;
          expira_em: string | null;
          id: string;
          inquilino_id: string;
          marcacao_id: string | null;
          servico_id: string;
        };
        ComputedFields: never;
        Insert: {
          avisado_em?: string | null;
          cliente_id: string;
          criado_em?: string;
          dia: string;
          estado?: string;
          expira_em?: string | null;
          id?: string;
          inquilino_id: string;
          marcacao_id?: string | null;
          servico_id: string;
        };
        Update: {
          avisado_em?: string | null;
          cliente_id?: string;
          criado_em?: string;
          dia?: string;
          estado?: string;
          expira_em?: string | null;
          id?: string;
          inquilino_id?: string;
          marcacao_id?: string | null;
          servico_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fila_espera_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fila_espera_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fila_espera_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
          {
            foreignKeyName: "fila_espera_inquilino_id_cliente_id_fkey";
            columns: ["inquilino_id", "cliente_id"];
            isOneToOne: false;
            referencedRelation: "clientes";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "fila_espera_inquilino_id_marcacao_id_fkey";
            columns: ["inquilino_id", "marcacao_id"];
            isOneToOne: false;
            referencedRelation: "marcacoes";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "fila_espera_inquilino_id_servico_id_fkey";
            columns: ["inquilino_id", "servico_id"];
            isOneToOne: false;
            referencedRelation: "publico_servicos";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "fila_espera_inquilino_id_servico_id_fkey";
            columns: ["inquilino_id", "servico_id"];
            isOneToOne: false;
            referencedRelation: "servicos";
            referencedColumns: ["inquilino_id", "id"];
          },
        ];
      };
      fila_presencial: {
        Row: {
          chamado_em: string | null;
          cliente_id: string;
          dia: string;
          entrou_em: string;
          estado: string;
          id: string;
          inquilino_id: string;
          profissional_id: string | null;
          servico_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          chamado_em?: string | null;
          cliente_id: string;
          dia: string;
          entrou_em?: string;
          estado?: string;
          id?: string;
          inquilino_id: string;
          profissional_id?: string | null;
          servico_id?: string | null;
        };
        Update: {
          chamado_em?: string | null;
          cliente_id?: string;
          dia?: string;
          entrou_em?: string;
          estado?: string;
          id?: string;
          inquilino_id?: string;
          profissional_id?: string | null;
          servico_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fila_presencial_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fila_presencial_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fila_presencial_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
          {
            foreignKeyName: "fila_presencial_inquilino_id_cliente_id_fkey";
            columns: ["inquilino_id", "cliente_id"];
            isOneToOne: false;
            referencedRelation: "clientes";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "fila_presencial_inquilino_id_profissional_id_fkey";
            columns: ["inquilino_id", "profissional_id"];
            isOneToOne: false;
            referencedRelation: "profissionais";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "fila_presencial_inquilino_id_profissional_id_fkey";
            columns: ["inquilino_id", "profissional_id"];
            isOneToOne: false;
            referencedRelation: "publico_profissionais";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "fila_presencial_inquilino_id_servico_id_fkey";
            columns: ["inquilino_id", "servico_id"];
            isOneToOne: false;
            referencedRelation: "publico_servicos";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "fila_presencial_inquilino_id_servico_id_fkey";
            columns: ["inquilino_id", "servico_id"];
            isOneToOne: false;
            referencedRelation: "servicos";
            referencedColumns: ["inquilino_id", "id"];
          },
        ];
      };
      funcionalidades: {
        Row: {
          chave: string;
          descricao: string | null;
          grupo: string;
          mostra_upgrade: boolean;
          nome: string;
          ordem: number;
        };
        ComputedFields: never;
        Insert: {
          chave: string;
          descricao?: string | null;
          grupo: string;
          mostra_upgrade?: boolean;
          nome: string;
          ordem?: number;
        };
        Update: {
          chave?: string;
          descricao?: string | null;
          grupo?: string;
          mostra_upgrade?: boolean;
          nome?: string;
          ordem?: number;
        };
        Relationships: [];
      };
      horarios_profissional: {
        Row: {
          dia_semana: number;
          fim: string;
          id: string;
          inicio: string;
          inquilino_id: string;
          profissional_id: string;
        };
        ComputedFields: never;
        Insert: {
          dia_semana: number;
          fim: string;
          id?: string;
          inicio: string;
          inquilino_id: string;
          profissional_id: string;
        };
        Update: {
          dia_semana?: number;
          fim?: string;
          id?: string;
          inicio?: string;
          inquilino_id?: string;
          profissional_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "horarios_profissional_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "horarios_profissional_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "horarios_profissional_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
          {
            foreignKeyName: "horarios_profissional_inquilino_id_profissional_id_fkey";
            columns: ["inquilino_id", "profissional_id"];
            isOneToOne: false;
            referencedRelation: "profissionais";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "horarios_profissional_inquilino_id_profissional_id_fkey";
            columns: ["inquilino_id", "profissional_id"];
            isOneToOne: false;
            referencedRelation: "publico_profissionais";
            referencedColumns: ["inquilino_id", "id"];
          },
        ];
      };
      inquilino_funcionalidades: {
        Row: {
          alterado_em: string;
          alterado_por: string | null;
          ativa: boolean;
          bonus: boolean;
          chave: string;
          inquilino_id: string;
        };
        ComputedFields: never;
        Insert: {
          alterado_em?: string;
          alterado_por?: string | null;
          ativa?: boolean;
          bonus?: boolean;
          chave: string;
          inquilino_id: string;
        };
        Update: {
          alterado_em?: string;
          alterado_por?: string | null;
          ativa?: boolean;
          bonus?: boolean;
          chave?: string;
          inquilino_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inquilino_funcionalidades_chave_fkey";
            columns: ["chave"];
            isOneToOne: false;
            referencedRelation: "funcionalidades";
            referencedColumns: ["chave"];
          },
          {
            foreignKeyName: "inquilino_funcionalidades_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inquilino_funcionalidades_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inquilino_funcionalidades_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
        ];
      };
      inquilino_modulos: {
        Row: {
          alterado_em: string;
          alterado_por: string | null;
          ativo: boolean;
          chave: string;
          inquilino_id: string;
        };
        ComputedFields: never;
        Insert: {
          alterado_em?: string;
          alterado_por?: string | null;
          ativo?: boolean;
          chave: string;
          inquilino_id: string;
        };
        Update: {
          alterado_em?: string;
          alterado_por?: string | null;
          ativo?: boolean;
          chave?: string;
          inquilino_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inquilino_modulos_chave_fkey";
            columns: ["chave"];
            isOneToOne: false;
            referencedRelation: "modulos_plataforma";
            referencedColumns: ["chave"];
          },
          {
            foreignKeyName: "inquilino_modulos_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inquilino_modulos_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inquilino_modulos_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
        ];
      };
      inquilinos: {
        Row: {
          aberto: boolean;
          ano_abertura: number | null;
          antecedencia_cancelamento_min: number;
          antecedencia_minima_min: number;
          aprovado_em: string | null;
          capa_cor: string;
          capa_foto_url: string | null;
          cidade: string | null;
          codigo_postal: string | null;
          criado_em: string;
          demonstracao: boolean;
          desconto_aniversario_ativo: boolean;
          desconto_aniversario_percent: number | null;
          desconto_mensalidade_pct: number;
          descricao: string | null;
          dias_descanso: number[];
          dominio_proprio: string | null;
          email: string | null;
          estado: string;
          estado_pagamento: string;
          facebook: string | null;
          fecha_feriados: boolean;
          fuso: string;
          galeria_urls: string[];
          google_avaliacao_url: string | null;
          google_maps_url: string | null;
          granularidade_min: number;
          historia: string | null;
          hora_abertura: string;
          hora_fecho: string;
          id: string;
          idioma: string;
          instagram: string | null;
          intervalo_almoco_fim: string | null;
          intervalo_almoco_inicio: string | null;
          intervalo_marcacoes_min: number;
          janela_marcacao_dias: number;
          limite_faltas: number;
          livro_reclamacoes_url: string | null;
          logo_url: string | null;
          modelo_caixa_omissao: string;
          moeda: string;
          morada: string | null;
          mostrar_historia: boolean;
          mostrar_mapa: boolean;
          nif: string | null;
          nome: string;
          pais: string;
          periodicidade: string;
          plano: string;
          premio_ativo: boolean;
          premio_servico_id: string | null;
          profissionais_contratados: number;
          proximo_vencimento: string | null;
          responsavel: string | null;
          selos_necessarios: number;
          slug: string;
          telefone: string | null;
          tiktok: string | null;
          vertical: string;
          whatsapp: string | null;
        };
        ComputedFields: never;
        Insert: {
          aberto?: boolean;
          ano_abertura?: number | null;
          antecedencia_cancelamento_min?: number;
          antecedencia_minima_min?: number;
          aprovado_em?: string | null;
          capa_cor?: string;
          capa_foto_url?: string | null;
          cidade?: string | null;
          codigo_postal?: string | null;
          criado_em?: string;
          demonstracao?: boolean;
          desconto_aniversario_ativo?: boolean;
          desconto_aniversario_percent?: number | null;
          desconto_mensalidade_pct?: number;
          descricao?: string | null;
          dias_descanso?: number[];
          dominio_proprio?: string | null;
          email?: string | null;
          estado?: string;
          estado_pagamento?: string;
          facebook?: string | null;
          fecha_feriados?: boolean;
          fuso?: string;
          galeria_urls?: string[];
          google_avaliacao_url?: string | null;
          google_maps_url?: string | null;
          granularidade_min?: number;
          historia?: string | null;
          hora_abertura?: string;
          hora_fecho?: string;
          id?: string;
          idioma?: string;
          instagram?: string | null;
          intervalo_almoco_fim?: string | null;
          intervalo_almoco_inicio?: string | null;
          intervalo_marcacoes_min?: number;
          janela_marcacao_dias?: number;
          limite_faltas?: number;
          livro_reclamacoes_url?: string | null;
          logo_url?: string | null;
          modelo_caixa_omissao?: string;
          moeda?: string;
          morada?: string | null;
          mostrar_historia?: boolean;
          mostrar_mapa?: boolean;
          nif?: string | null;
          nome: string;
          pais?: string;
          periodicidade?: string;
          plano?: string;
          premio_ativo?: boolean;
          premio_servico_id?: string | null;
          profissionais_contratados?: number;
          proximo_vencimento?: string | null;
          responsavel?: string | null;
          selos_necessarios?: number;
          slug: string;
          telefone?: string | null;
          tiktok?: string | null;
          vertical?: string;
          whatsapp?: string | null;
        };
        Update: {
          aberto?: boolean;
          ano_abertura?: number | null;
          antecedencia_cancelamento_min?: number;
          antecedencia_minima_min?: number;
          aprovado_em?: string | null;
          capa_cor?: string;
          capa_foto_url?: string | null;
          cidade?: string | null;
          codigo_postal?: string | null;
          criado_em?: string;
          demonstracao?: boolean;
          desconto_aniversario_ativo?: boolean;
          desconto_aniversario_percent?: number | null;
          desconto_mensalidade_pct?: number;
          descricao?: string | null;
          dias_descanso?: number[];
          dominio_proprio?: string | null;
          email?: string | null;
          estado?: string;
          estado_pagamento?: string;
          facebook?: string | null;
          fecha_feriados?: boolean;
          fuso?: string;
          galeria_urls?: string[];
          google_avaliacao_url?: string | null;
          google_maps_url?: string | null;
          granularidade_min?: number;
          historia?: string | null;
          hora_abertura?: string;
          hora_fecho?: string;
          id?: string;
          idioma?: string;
          instagram?: string | null;
          intervalo_almoco_fim?: string | null;
          intervalo_almoco_inicio?: string | null;
          intervalo_marcacoes_min?: number;
          janela_marcacao_dias?: number;
          limite_faltas?: number;
          livro_reclamacoes_url?: string | null;
          logo_url?: string | null;
          modelo_caixa_omissao?: string;
          moeda?: string;
          morada?: string | null;
          mostrar_historia?: boolean;
          mostrar_mapa?: boolean;
          nif?: string | null;
          nome?: string;
          pais?: string;
          periodicidade?: string;
          plano?: string;
          premio_ativo?: boolean;
          premio_servico_id?: string | null;
          profissionais_contratados?: number;
          proximo_vencimento?: string | null;
          responsavel?: string | null;
          selos_necessarios?: number;
          slug?: string;
          telefone?: string | null;
          tiktok?: string | null;
          vertical?: string;
          whatsapp?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "inquilinos_premio_fk";
            columns: ["id", "premio_servico_id"];
            isOneToOne: false;
            referencedRelation: "publico_servicos";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "inquilinos_premio_fk";
            columns: ["id", "premio_servico_id"];
            isOneToOne: false;
            referencedRelation: "servicos";
            referencedColumns: ["inquilino_id", "id"];
          },
        ];
      };
      lead_eventos: {
        Row: {
          criado_em: string;
          criado_por: string | null;
          detalhes: Json | null;
          id: number;
          lead_id: string;
          texto: string | null;
          tipo: string;
        };
        ComputedFields: never;
        Insert: {
          criado_em?: string;
          criado_por?: string | null;
          detalhes?: Json | null;
          id?: never;
          lead_id: string;
          texto?: string | null;
          tipo: string;
        };
        Update: {
          criado_em?: string;
          criado_por?: string | null;
          detalhes?: Json | null;
          id?: never;
          lead_id?: string;
          texto?: string | null;
          tipo?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lead_eventos_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      leads: {
        Row: {
          atualizado_em: string;
          cidade: string | null;
          criado_em: string;
          criado_por: string | null;
          email: string | null;
          estado: string;
          id: string;
          inquilino_id: string | null;
          motivo_perda: string | null;
          n_barbeiros: string | null;
          nome_barbearia: string | null;
          nome_contacto: string;
          origem: string;
          proxima_acao: string | null;
          proxima_acao_em: string | null;
          responsavel_id: string | null;
          telefone: string | null;
          ultimo_contacto_em: string;
        };
        ComputedFields: never;
        Insert: {
          atualizado_em?: string;
          cidade?: string | null;
          criado_em?: string;
          criado_por?: string | null;
          email?: string | null;
          estado?: string;
          id?: string;
          inquilino_id?: string | null;
          motivo_perda?: string | null;
          n_barbeiros?: string | null;
          nome_barbearia?: string | null;
          nome_contacto: string;
          origem?: string;
          proxima_acao?: string | null;
          proxima_acao_em?: string | null;
          responsavel_id?: string | null;
          telefone?: string | null;
          ultimo_contacto_em?: string;
        };
        Update: {
          atualizado_em?: string;
          cidade?: string | null;
          criado_em?: string;
          criado_por?: string | null;
          email?: string | null;
          estado?: string;
          id?: string;
          inquilino_id?: string | null;
          motivo_perda?: string | null;
          n_barbeiros?: string | null;
          nome_barbearia?: string | null;
          nome_contacto?: string;
          origem?: string;
          proxima_acao?: string | null;
          proxima_acao_em?: string | null;
          responsavel_id?: string | null;
          telefone?: string | null;
          ultimo_contacto_em?: string;
        };
        Relationships: [
          {
            foreignKeyName: "leads_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leads_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leads_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
        ];
      };
      lembretes_vencimento: {
        Row: {
          aberta_em: string | null;
          canal: string;
          conteudo: string;
          criado_em: string;
          criado_por: string | null;
          estado: string;
          fatura_id: string | null;
          id: string;
          inquilino_id: string;
          vencimento: string;
        };
        ComputedFields: never;
        Insert: {
          aberta_em?: string | null;
          canal: string;
          conteudo: string;
          criado_em?: string;
          criado_por?: string | null;
          estado?: string;
          fatura_id?: string | null;
          id?: string;
          inquilino_id: string;
          vencimento: string;
        };
        Update: {
          aberta_em?: string | null;
          canal?: string;
          conteudo?: string;
          criado_em?: string;
          criado_por?: string | null;
          estado?: string;
          fatura_id?: string | null;
          id?: string;
          inquilino_id?: string;
          vencimento?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lembretes_vencimento_fatura_id_fkey";
            columns: ["fatura_id"];
            isOneToOne: false;
            referencedRelation: "faturas_plataforma";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lembretes_vencimento_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lembretes_vencimento_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lembretes_vencimento_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
        ];
      };
      ligacoes_externas: {
        Row: {
          criado_em: string;
          estado: string;
          fornecedor: string;
          id: string;
          inquilino_id: string;
          profissional_id: string | null;
          segredo_ref: string | null;
          tipo: string;
        };
        ComputedFields: never;
        Insert: {
          criado_em?: string;
          estado?: string;
          fornecedor: string;
          id?: string;
          inquilino_id: string;
          profissional_id?: string | null;
          segredo_ref?: string | null;
          tipo: string;
        };
        Update: {
          criado_em?: string;
          estado?: string;
          fornecedor?: string;
          id?: string;
          inquilino_id?: string;
          profissional_id?: string | null;
          segredo_ref?: string | null;
          tipo?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ligacoes_externas_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ligacoes_externas_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ligacoes_externas_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
          {
            foreignKeyName: "ligacoes_externas_inquilino_id_profissional_id_fkey";
            columns: ["inquilino_id", "profissional_id"];
            isOneToOne: false;
            referencedRelation: "profissionais";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "ligacoes_externas_inquilino_id_profissional_id_fkey";
            columns: ["inquilino_id", "profissional_id"];
            isOneToOne: false;
            referencedRelation: "publico_profissionais";
            referencedColumns: ["inquilino_id", "id"];
          },
        ];
      };
      limites_pedidos: {
        Row: {
          chave: string;
          contagem: number;
          janela_inicio: string;
        };
        ComputedFields: never;
        Insert: {
          chave: string;
          contagem?: number;
          janela_inicio: string;
        };
        Update: {
          chave?: string;
          contagem?: number;
          janela_inicio?: string;
        };
        Relationships: [];
      };
      marcacoes: {
        Row: {
          cancelada_em: string | null;
          cancelada_por: string | null;
          cartao_oferta_id: string | null;
          cliente_id: string | null;
          concluida_em: string | null;
          confirmacao_email_em: string | null;
          credito_id: string | null;
          criado_em: string;
          criado_por: string | null;
          desconto_percent: number;
          estado: string;
          fim: string;
          fim_bloqueio: string;
          id: string;
          inicio: string;
          inquilino_id: string;
          lembrete_aberto_em: string | null;
          lembrete_email_em: string | null;
          motivo_cancelamento: string | null;
          notas: string | null;
          origem: string;
          periodo: unknown;
          profissional_id: string | null;
          reservada_ate: string | null;
          servico_id: string;
          token_reserva_hash: string | null;
          valor_cobrado: number;
          valor_tabela: number;
        };
        ComputedFields: never;
        Insert: {
          cancelada_em?: string | null;
          cancelada_por?: string | null;
          cartao_oferta_id?: string | null;
          cliente_id?: string | null;
          concluida_em?: string | null;
          confirmacao_email_em?: string | null;
          credito_id?: string | null;
          criado_em?: string;
          criado_por?: string | null;
          desconto_percent?: number;
          estado?: string;
          fim: string;
          fim_bloqueio: string;
          id?: string;
          inicio: string;
          inquilino_id: string;
          lembrete_aberto_em?: string | null;
          lembrete_email_em?: string | null;
          motivo_cancelamento?: string | null;
          notas?: string | null;
          origem?: string;
          periodo?: never;
          profissional_id?: string | null;
          reservada_ate?: string | null;
          servico_id: string;
          token_reserva_hash?: string | null;
          valor_cobrado: number;
          valor_tabela: number;
        };
        Update: {
          cancelada_em?: string | null;
          cancelada_por?: string | null;
          cartao_oferta_id?: string | null;
          cliente_id?: string | null;
          concluida_em?: string | null;
          confirmacao_email_em?: string | null;
          credito_id?: string | null;
          criado_em?: string;
          criado_por?: string | null;
          desconto_percent?: number;
          estado?: string;
          fim?: string;
          fim_bloqueio?: string;
          id?: string;
          inicio?: string;
          inquilino_id?: string;
          lembrete_aberto_em?: string | null;
          lembrete_email_em?: string | null;
          motivo_cancelamento?: string | null;
          notas?: string | null;
          origem?: string;
          periodo?: never;
          profissional_id?: string | null;
          reservada_ate?: string | null;
          servico_id?: string;
          token_reserva_hash?: string | null;
          valor_cobrado?: number;
          valor_tabela?: number;
        };
        Relationships: [
          {
            foreignKeyName: "marcacoes_inquilino_id_cartao_oferta_id_fkey";
            columns: ["inquilino_id", "cartao_oferta_id"];
            isOneToOne: false;
            referencedRelation: "cartoes_oferta";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "marcacoes_inquilino_id_cartao_oferta_id_fkey";
            columns: ["inquilino_id", "cartao_oferta_id"];
            isOneToOne: false;
            referencedRelation: "saldo_cartoes";
            referencedColumns: ["inquilino_id", "cartao_id"];
          },
          {
            foreignKeyName: "marcacoes_inquilino_id_cliente_id_fkey";
            columns: ["inquilino_id", "cliente_id"];
            isOneToOne: false;
            referencedRelation: "clientes";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "marcacoes_inquilino_id_credito_id_fkey";
            columns: ["inquilino_id", "credito_id"];
            isOneToOne: false;
            referencedRelation: "creditos_clube";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "marcacoes_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "marcacoes_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "marcacoes_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
          {
            foreignKeyName: "marcacoes_inquilino_id_profissional_id_fkey";
            columns: ["inquilino_id", "profissional_id"];
            isOneToOne: false;
            referencedRelation: "profissionais";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "marcacoes_inquilino_id_profissional_id_fkey";
            columns: ["inquilino_id", "profissional_id"];
            isOneToOne: false;
            referencedRelation: "publico_profissionais";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "marcacoes_inquilino_id_servico_id_fkey";
            columns: ["inquilino_id", "servico_id"];
            isOneToOne: false;
            referencedRelation: "publico_servicos";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "marcacoes_inquilino_id_servico_id_fkey";
            columns: ["inquilino_id", "servico_id"];
            isOneToOne: false;
            referencedRelation: "servicos";
            referencedColumns: ["inquilino_id", "id"];
          },
        ];
      };
      mensagens: {
        Row: {
          aberta_em: string | null;
          canal: string;
          cliente_id: string | null;
          conteudo: string | null;
          criado_em: string;
          criado_por: string | null;
          estado: string;
          id: string;
          inquilino_id: string;
          profissional_id: string | null;
          referencia_id: string | null;
          tipo: string;
        };
        ComputedFields: never;
        Insert: {
          aberta_em?: string | null;
          canal?: string;
          cliente_id?: string | null;
          conteudo?: string | null;
          criado_em?: string;
          criado_por?: string | null;
          estado?: string;
          id?: string;
          inquilino_id: string;
          profissional_id?: string | null;
          referencia_id?: string | null;
          tipo: string;
        };
        Update: {
          aberta_em?: string | null;
          canal?: string;
          cliente_id?: string | null;
          conteudo?: string | null;
          criado_em?: string;
          criado_por?: string | null;
          estado?: string;
          id?: string;
          inquilino_id?: string;
          profissional_id?: string | null;
          referencia_id?: string | null;
          tipo?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mensagens_inquilino_id_cliente_id_fkey";
            columns: ["inquilino_id", "cliente_id"];
            isOneToOne: false;
            referencedRelation: "clientes";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "mensagens_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mensagens_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mensagens_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
          {
            foreignKeyName: "mensagens_inquilino_id_profissional_id_fkey";
            columns: ["inquilino_id", "profissional_id"];
            isOneToOne: false;
            referencedRelation: "profissionais";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "mensagens_inquilino_id_profissional_id_fkey";
            columns: ["inquilino_id", "profissional_id"];
            isOneToOne: false;
            referencedRelation: "publico_profissionais";
            referencedColumns: ["inquilino_id", "id"];
          },
        ];
      };
      metas_comerciais: {
        Row: {
          criado_em: string;
          ganhos: number;
          id: string;
          leads_novos: number;
          mes: string;
          propostas: number;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          criado_em?: string;
          ganhos?: number;
          id?: string;
          leads_novos?: number;
          mes: string;
          propostas?: number;
          user_id: string;
        };
        Update: {
          criado_em?: string;
          ganhos?: number;
          id?: string;
          leads_novos?: number;
          mes?: string;
          propostas?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      metas_faturacao: {
        Row: {
          base: string;
          criado_em: string;
          id: string;
          mes: string;
          nota: string | null;
          valor_sem_iva: number;
        };
        ComputedFields: never;
        Insert: {
          base?: string;
          criado_em?: string;
          id?: string;
          mes: string;
          nota?: string | null;
          valor_sem_iva: number;
        };
        Update: {
          base?: string;
          criado_em?: string;
          id?: string;
          mes?: string;
          nota?: string | null;
          valor_sem_iva?: number;
        };
        Relationships: [];
      };
      modelos_documento: {
        Row: {
          aprovado_em: string | null;
          aprovado_por: string | null;
          corpo: string;
          criado_em: string;
          estado: string;
          id: string;
          tipo: string;
          titulo: string;
          versao: number;
        };
        ComputedFields: never;
        Insert: {
          aprovado_em?: string | null;
          aprovado_por?: string | null;
          corpo: string;
          criado_em?: string;
          estado?: string;
          id?: string;
          tipo: string;
          titulo: string;
          versao: number;
        };
        Update: {
          aprovado_em?: string | null;
          aprovado_por?: string | null;
          corpo?: string;
          criado_em?: string;
          estado?: string;
          id?: string;
          tipo?: string;
          titulo?: string;
          versao?: number;
        };
        Relationships: [];
      };
      modulos_plataforma: {
        Row: {
          alterado_em: string;
          alterado_por: string | null;
          ativo: boolean;
          chave: string;
        };
        ComputedFields: never;
        Insert: {
          alterado_em?: string;
          alterado_por?: string | null;
          ativo?: boolean;
          chave: string;
        };
        Update: {
          alterado_em?: string;
          alterado_por?: string | null;
          ativo?: boolean;
          chave?: string;
        };
        Relationships: [];
      };
      movimentos_cartao: {
        Row: {
          cartao_id: string;
          criado_em: string;
          id: string;
          inquilino_id: string;
          marcacao_id: string | null;
          registado_por: string | null;
          valor: number;
        };
        ComputedFields: never;
        Insert: {
          cartao_id: string;
          criado_em?: string;
          id?: string;
          inquilino_id: string;
          marcacao_id?: string | null;
          registado_por?: string | null;
          valor: number;
        };
        Update: {
          cartao_id?: string;
          criado_em?: string;
          id?: string;
          inquilino_id?: string;
          marcacao_id?: string | null;
          registado_por?: string | null;
          valor?: number;
        };
        Relationships: [
          {
            foreignKeyName: "movimentos_cartao_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "movimentos_cartao_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "movimentos_cartao_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
          {
            foreignKeyName: "movimentos_cartao_inquilino_id_cartao_id_fkey";
            columns: ["inquilino_id", "cartao_id"];
            isOneToOne: false;
            referencedRelation: "cartoes_oferta";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "movimentos_cartao_inquilino_id_cartao_id_fkey";
            columns: ["inquilino_id", "cartao_id"];
            isOneToOne: false;
            referencedRelation: "saldo_cartoes";
            referencedColumns: ["inquilino_id", "cartao_id"];
          },
          {
            foreignKeyName: "movimentos_cartao_inquilino_id_marcacao_id_fkey";
            columns: ["inquilino_id", "marcacao_id"];
            isOneToOne: false;
            referencedRelation: "marcacoes";
            referencedColumns: ["inquilino_id", "id"];
          },
        ];
      };
      movimentos_selos: {
        Row: {
          cliente_id: string;
          criado_em: string;
          criado_por: string | null;
          id: string;
          inquilino_id: string;
          quantidade: number;
          servico_id: string | null;
          tipo: string;
          valor_tabela: number | null;
          visita_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          cliente_id: string;
          criado_em?: string;
          criado_por?: string | null;
          id?: string;
          inquilino_id: string;
          quantidade: number;
          servico_id?: string | null;
          tipo: string;
          valor_tabela?: number | null;
          visita_id?: string | null;
        };
        Update: {
          cliente_id?: string;
          criado_em?: string;
          criado_por?: string | null;
          id?: string;
          inquilino_id?: string;
          quantidade?: number;
          servico_id?: string | null;
          tipo?: string;
          valor_tabela?: number | null;
          visita_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "movimentos_selos_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "movimentos_selos_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "movimentos_selos_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
          {
            foreignKeyName: "movimentos_selos_inquilino_id_cliente_id_fkey";
            columns: ["inquilino_id", "cliente_id"];
            isOneToOne: false;
            referencedRelation: "clientes";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "movimentos_selos_inquilino_id_servico_id_fkey";
            columns: ["inquilino_id", "servico_id"];
            isOneToOne: false;
            referencedRelation: "publico_servicos";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "movimentos_selos_inquilino_id_servico_id_fkey";
            columns: ["inquilino_id", "servico_id"];
            isOneToOne: false;
            referencedRelation: "servicos";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "movimentos_selos_inquilino_id_visita_id_fkey";
            columns: ["inquilino_id", "visita_id"];
            isOneToOne: false;
            referencedRelation: "visitas";
            referencedColumns: ["inquilino_id", "id"];
          },
        ];
      };
      numeracao_comercial: {
        Row: {
          ano: number;
          serie: string;
          ultimo: number;
        };
        ComputedFields: never;
        Insert: {
          ano: number;
          serie: string;
          ultimo?: number;
        };
        Update: {
          ano?: number;
          serie?: string;
          ultimo?: number;
        };
        Relationships: [];
      };
      objetivos: {
        Row: {
          id: string;
          inquilino_id: string;
          mes: string;
          profissional_id: string | null;
          valor: number;
        };
        ComputedFields: never;
        Insert: {
          id?: string;
          inquilino_id: string;
          mes: string;
          profissional_id?: string | null;
          valor: number;
        };
        Update: {
          id?: string;
          inquilino_id?: string;
          mes?: string;
          profissional_id?: string | null;
          valor?: number;
        };
        Relationships: [
          {
            foreignKeyName: "objetivos_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "objetivos_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "objetivos_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
          {
            foreignKeyName: "objetivos_inquilino_id_profissional_id_fkey";
            columns: ["inquilino_id", "profissional_id"];
            isOneToOne: false;
            referencedRelation: "profissionais";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "objetivos_inquilino_id_profissional_id_fkey";
            columns: ["inquilino_id", "profissional_id"];
            isOneToOne: false;
            referencedRelation: "publico_profissionais";
            referencedColumns: ["inquilino_id", "id"];
          },
        ];
      };
      pacote_funcionalidades: {
        Row: {
          chave: string;
          plano: string;
        };
        ComputedFields: never;
        Insert: {
          chave: string;
          plano: string;
        };
        Update: {
          chave?: string;
          plano?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pacote_funcionalidades_chave_fkey";
            columns: ["chave"];
            isOneToOne: false;
            referencedRelation: "funcionalidades";
            referencedColumns: ["chave"];
          },
        ];
      };
      pagamentos: {
        Row: {
          atualizado_em: string;
          criado_em: string;
          dados: Json | null;
          estado: string;
          finalidade: string;
          fornecedor: string;
          id: string;
          id_externo: string | null;
          inquilino_id: string;
          metodo: string;
          profissional_id: string | null;
          recebedor: string;
          referencia_id: string;
          valor: number;
        };
        ComputedFields: never;
        Insert: {
          atualizado_em?: string;
          criado_em?: string;
          dados?: Json | null;
          estado?: string;
          finalidade: string;
          fornecedor: string;
          id?: string;
          id_externo?: string | null;
          inquilino_id: string;
          metodo?: string;
          profissional_id?: string | null;
          recebedor: string;
          referencia_id: string;
          valor: number;
        };
        Update: {
          atualizado_em?: string;
          criado_em?: string;
          dados?: Json | null;
          estado?: string;
          finalidade?: string;
          fornecedor?: string;
          id?: string;
          id_externo?: string | null;
          inquilino_id?: string;
          metodo?: string;
          profissional_id?: string | null;
          recebedor?: string;
          referencia_id?: string;
          valor?: number;
        };
        Relationships: [
          {
            foreignKeyName: "pagamentos_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pagamentos_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pagamentos_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
          {
            foreignKeyName: "pagamentos_inquilino_id_profissional_id_fkey";
            columns: ["inquilino_id", "profissional_id"];
            isOneToOne: false;
            referencedRelation: "profissionais";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "pagamentos_inquilino_id_profissional_id_fkey";
            columns: ["inquilino_id", "profissional_id"];
            isOneToOne: false;
            referencedRelation: "publico_profissionais";
            referencedColumns: ["inquilino_id", "id"];
          },
        ];
      };
      pedido_linhas: {
        Row: {
          custo_unitario: number;
          id: string;
          inquilino_id: string;
          iva_percent: number;
          pedido_id: string;
          preco_unitario: number;
          produto_id: string;
          quantidade: number;
        };
        ComputedFields: never;
        Insert: {
          custo_unitario: number;
          id?: string;
          inquilino_id: string;
          iva_percent: number;
          pedido_id: string;
          preco_unitario: number;
          produto_id: string;
          quantidade: number;
        };
        Update: {
          custo_unitario?: number;
          id?: string;
          inquilino_id?: string;
          iva_percent?: number;
          pedido_id?: string;
          preco_unitario?: number;
          produto_id?: string;
          quantidade?: number;
        };
        Relationships: [
          {
            foreignKeyName: "pedido_linhas_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pedido_linhas_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pedido_linhas_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
          {
            foreignKeyName: "pedido_linhas_inquilino_id_pedido_id_fkey";
            columns: ["inquilino_id", "pedido_id"];
            isOneToOne: false;
            referencedRelation: "pedidos_loja";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "pedido_linhas_inquilino_id_produto_id_fkey";
            columns: ["inquilino_id", "produto_id"];
            isOneToOne: false;
            referencedRelation: "produtos";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "pedido_linhas_inquilino_id_produto_id_fkey";
            columns: ["inquilino_id", "produto_id"];
            isOneToOne: false;
            referencedRelation: "publico_produtos";
            referencedColumns: ["inquilino_id", "id"];
          },
        ];
      };
      pedidos_adesao: {
        Row: {
          aceitou_termos_em: string;
          ano_abertura: number | null;
          capa_path: string | null;
          cidade: string | null;
          contrato_id: string | null;
          decidido_em: string | null;
          descricao: string | null;
          dias_descanso: number[] | null;
          email: string | null;
          email_acesso: string;
          equipa: NonNullable<Json>;
          estado: string;
          facebook: string | null;
          galeria_paths: string[];
          google_maps_url: string | null;
          hora_abertura: string | null;
          hora_fecho: string | null;
          id: string;
          inquilino_id: string | null;
          instagram: string | null;
          intervalo_almoco_fim: string | null;
          intervalo_almoco_inicio: string | null;
          logo_path: string | null;
          mensalidade_calculada: number;
          modelo_caixa: string;
          morada: string | null;
          motivo_rejeicao: string | null;
          nif: string | null;
          nome: string;
          observacoes: string | null;
          periodicidade: string;
          plano: string;
          preferencia_pagamento: string | null;
          profissionais: number;
          publico_alvo: string | null;
          responsavel: string | null;
          revisto_por: string | null;
          servicos: NonNullable<Json>;
          submetido_em: string;
          telefone: string | null;
          tiktok: string | null;
          tom_comunicacao: string | null;
          vertical: string;
          whatsapp: string | null;
        };
        ComputedFields: never;
        Insert: {
          aceitou_termos_em: string;
          ano_abertura?: number | null;
          capa_path?: string | null;
          cidade?: string | null;
          contrato_id?: string | null;
          decidido_em?: string | null;
          descricao?: string | null;
          dias_descanso?: number[] | null;
          email?: string | null;
          email_acesso: string;
          equipa?: NonNullable<Json>;
          estado?: string;
          facebook?: string | null;
          galeria_paths?: string[];
          google_maps_url?: string | null;
          hora_abertura?: string | null;
          hora_fecho?: string | null;
          id?: string;
          inquilino_id?: string | null;
          instagram?: string | null;
          intervalo_almoco_fim?: string | null;
          intervalo_almoco_inicio?: string | null;
          logo_path?: string | null;
          mensalidade_calculada: number;
          modelo_caixa?: string;
          morada?: string | null;
          motivo_rejeicao?: string | null;
          nif?: string | null;
          nome: string;
          observacoes?: string | null;
          periodicidade?: string;
          plano?: string;
          preferencia_pagamento?: string | null;
          profissionais?: number;
          publico_alvo?: string | null;
          responsavel?: string | null;
          revisto_por?: string | null;
          servicos?: NonNullable<Json>;
          submetido_em?: string;
          telefone?: string | null;
          tiktok?: string | null;
          tom_comunicacao?: string | null;
          vertical?: string;
          whatsapp?: string | null;
        };
        Update: {
          aceitou_termos_em?: string;
          ano_abertura?: number | null;
          capa_path?: string | null;
          cidade?: string | null;
          contrato_id?: string | null;
          decidido_em?: string | null;
          descricao?: string | null;
          dias_descanso?: number[] | null;
          email?: string | null;
          email_acesso?: string;
          equipa?: NonNullable<Json>;
          estado?: string;
          facebook?: string | null;
          galeria_paths?: string[];
          google_maps_url?: string | null;
          hora_abertura?: string | null;
          hora_fecho?: string | null;
          id?: string;
          inquilino_id?: string | null;
          instagram?: string | null;
          intervalo_almoco_fim?: string | null;
          intervalo_almoco_inicio?: string | null;
          logo_path?: string | null;
          mensalidade_calculada?: number;
          modelo_caixa?: string;
          morada?: string | null;
          motivo_rejeicao?: string | null;
          nif?: string | null;
          nome?: string;
          observacoes?: string | null;
          periodicidade?: string;
          plano?: string;
          preferencia_pagamento?: string | null;
          profissionais?: number;
          publico_alvo?: string | null;
          responsavel?: string | null;
          revisto_por?: string | null;
          servicos?: NonNullable<Json>;
          submetido_em?: string;
          telefone?: string | null;
          tiktok?: string | null;
          tom_comunicacao?: string | null;
          vertical?: string;
          whatsapp?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "pedidos_adesao_contrato_id_fkey";
            columns: ["contrato_id"];
            isOneToOne: false;
            referencedRelation: "contratos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pedidos_adesao_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pedidos_adesao_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pedidos_adesao_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
        ];
      };
      pedidos_loja: {
        Row: {
          cancelado_em: string | null;
          cliente_id: string;
          criado_em: string;
          estado: string;
          id: string;
          inquilino_id: string;
          levantado_em: string | null;
          numero: number;
          pronto_em: string | null;
          total: number;
        };
        ComputedFields: never;
        Insert: {
          cancelado_em?: string | null;
          cliente_id: string;
          criado_em?: string;
          estado?: string;
          id?: string;
          inquilino_id: string;
          levantado_em?: string | null;
          numero?: never;
          pronto_em?: string | null;
          total: number;
        };
        Update: {
          cancelado_em?: string | null;
          cliente_id?: string;
          criado_em?: string;
          estado?: string;
          id?: string;
          inquilino_id?: string;
          levantado_em?: string | null;
          numero?: never;
          pronto_em?: string | null;
          total?: number;
        };
        Relationships: [
          {
            foreignKeyName: "pedidos_loja_inquilino_id_cliente_id_fkey";
            columns: ["inquilino_id", "cliente_id"];
            isOneToOne: false;
            referencedRelation: "clientes";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "pedidos_loja_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pedidos_loja_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pedidos_loja_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
        ];
      };
      perfis: {
        Row: {
          ativo: boolean;
          criado_em: string;
          email: string | null;
          id: string;
          inquilino_id: string | null;
          nome: string | null;
          papel: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          ativo?: boolean;
          criado_em?: string;
          email?: string | null;
          id?: string;
          inquilino_id?: string | null;
          nome?: string | null;
          papel: string;
          user_id: string;
        };
        Update: {
          ativo?: boolean;
          criado_em?: string;
          email?: string | null;
          id?: string;
          inquilino_id?: string | null;
          nome?: string | null;
          papel?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "perfis_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "perfis_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "perfis_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
        ];
      };
      periodos_desconto: {
        Row: {
          ativo: boolean;
          criado_em: string;
          dia_semana: number;
          hora_fim: string;
          hora_inicio: string;
          id: string;
          inquilino_id: string;
          percentagem: number;
        };
        ComputedFields: never;
        Insert: {
          ativo?: boolean;
          criado_em?: string;
          dia_semana: number;
          hora_fim: string;
          hora_inicio: string;
          id?: string;
          inquilino_id: string;
          percentagem: number;
        };
        Update: {
          ativo?: boolean;
          criado_em?: string;
          dia_semana?: number;
          hora_fim?: string;
          hora_inicio?: string;
          id?: string;
          inquilino_id?: string;
          percentagem?: number;
        };
        Relationships: [
          {
            foreignKeyName: "periodos_desconto_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "periodos_desconto_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "periodos_desconto_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
        ];
      };
      portfolio_fotos: {
        Row: {
          criado_em: string;
          foto_url: string;
          id: string;
          inquilino_id: string;
          legenda: string | null;
          ordem: number;
          profissional_id: string;
          visivel: boolean;
        };
        ComputedFields: never;
        Insert: {
          criado_em?: string;
          foto_url: string;
          id?: string;
          inquilino_id: string;
          legenda?: string | null;
          ordem?: number;
          profissional_id: string;
          visivel?: boolean;
        };
        Update: {
          criado_em?: string;
          foto_url?: string;
          id?: string;
          inquilino_id?: string;
          legenda?: string | null;
          ordem?: number;
          profissional_id?: string;
          visivel?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "portfolio_fotos_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "portfolio_fotos_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "portfolio_fotos_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
          {
            foreignKeyName: "portfolio_fotos_inquilino_id_profissional_id_fkey";
            columns: ["inquilino_id", "profissional_id"];
            isOneToOne: false;
            referencedRelation: "profissionais";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "portfolio_fotos_inquilino_id_profissional_id_fkey";
            columns: ["inquilino_id", "profissional_id"];
            isOneToOne: false;
            referencedRelation: "publico_profissionais";
            referencedColumns: ["inquilino_id", "id"];
          },
        ];
      };
      produtos: {
        Row: {
          ativo: boolean;
          criado_em: string;
          custo: number;
          descricao: string | null;
          foto_url: string | null;
          id: string;
          inquilino_id: string;
          iva_percent: number;
          mostrar_esgotado: boolean;
          nome: string;
          preco_venda: number;
          stock: number;
          stock_minimo: number;
        };
        ComputedFields: never;
        Insert: {
          ativo?: boolean;
          criado_em?: string;
          custo: number;
          descricao?: string | null;
          foto_url?: string | null;
          id?: string;
          inquilino_id: string;
          iva_percent?: number;
          mostrar_esgotado?: boolean;
          nome: string;
          preco_venda: number;
          stock?: number;
          stock_minimo?: number;
        };
        Update: {
          ativo?: boolean;
          criado_em?: string;
          custo?: number;
          descricao?: string | null;
          foto_url?: string | null;
          id?: string;
          inquilino_id?: string;
          iva_percent?: number;
          mostrar_esgotado?: boolean;
          nome?: string;
          preco_venda?: number;
          stock?: number;
          stock_minimo?: number;
        };
        Relationships: [
          {
            foreignKeyName: "produtos_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "produtos_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "produtos_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
        ];
      };
      profissionais: {
        Row: {
          ativo: boolean;
          comissao_percent: number;
          criado_em: string;
          desativado_em: string | null;
          email: string | null;
          especialidades: string[];
          foto_url: string | null;
          id: string;
          inquilino_id: string;
          modelo_caixa: string;
          modo_emissao: string;
          nif: string | null;
          nome: string;
          nome_apresentado: string;
          ordem: number;
          perfil_id: string | null;
          portfolio_visivel: boolean;
          regime_iva: string | null;
          renda_dia_vencimento: number | null;
          renda_valor: number | null;
        };
        ComputedFields: never;
        Insert: {
          ativo?: boolean;
          comissao_percent?: number;
          criado_em?: string;
          desativado_em?: string | null;
          email?: string | null;
          especialidades?: string[];
          foto_url?: string | null;
          id?: string;
          inquilino_id: string;
          modelo_caixa?: string;
          modo_emissao?: string;
          nif?: string | null;
          nome: string;
          nome_apresentado: string;
          ordem?: number;
          perfil_id?: string | null;
          portfolio_visivel?: boolean;
          regime_iva?: string | null;
          renda_dia_vencimento?: number | null;
          renda_valor?: number | null;
        };
        Update: {
          ativo?: boolean;
          comissao_percent?: number;
          criado_em?: string;
          desativado_em?: string | null;
          email?: string | null;
          especialidades?: string[];
          foto_url?: string | null;
          id?: string;
          inquilino_id?: string;
          modelo_caixa?: string;
          modo_emissao?: string;
          nif?: string | null;
          nome?: string;
          nome_apresentado?: string;
          ordem?: number;
          perfil_id?: string | null;
          portfolio_visivel?: boolean;
          regime_iva?: string | null;
          renda_dia_vencimento?: number | null;
          renda_valor?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "profissionais_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profissionais_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profissionais_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
          {
            foreignKeyName: "profissionais_perfil_id_fkey";
            columns: ["perfil_id"];
            isOneToOne: true;
            referencedRelation: "perfis";
            referencedColumns: ["id"];
          },
        ];
      };
      promocoes: {
        Row: {
          ativa: boolean;
          criado_em: string;
          descricao: string | null;
          fim: string | null;
          id: string;
          inicio: string | null;
          inquilino_id: string;
          titulo: string;
        };
        ComputedFields: never;
        Insert: {
          ativa?: boolean;
          criado_em?: string;
          descricao?: string | null;
          fim?: string | null;
          id?: string;
          inicio?: string | null;
          inquilino_id: string;
          titulo: string;
        };
        Update: {
          ativa?: boolean;
          criado_em?: string;
          descricao?: string | null;
          fim?: string | null;
          id?: string;
          inicio?: string | null;
          inquilino_id?: string;
          titulo?: string;
        };
        Relationships: [
          {
            foreignKeyName: "promocoes_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "promocoes_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "promocoes_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
        ];
      };
      propostas: {
        Row: {
          condicoes_lancamento: string | null;
          criado_em: string;
          criado_por: string | null;
          dados: NonNullable<Json>;
          decidida_em: string | null;
          desafio_90: boolean;
          desconto_mensalidade_pct: number;
          desconto_taxa_pct: number;
          dominio_proprio: boolean;
          enviada_em: string | null;
          estado: string;
          id: string;
          iva_taxa: number;
          lead_id: string;
          mensalidade_sem_iva: number;
          motivo_recusa: string | null;
          numero: string;
          pdf_path: string | null;
          periodicidade: string;
          plano: string;
          profissionais: number;
          taxa_migracao_sem_iva: number;
          valida_ate: string | null;
          validade_dias: number;
          valor_periodo_com_iva: number;
          valor_periodo_sem_iva: number;
          versao: number;
        };
        ComputedFields: never;
        Insert: {
          condicoes_lancamento?: string | null;
          criado_em?: string;
          criado_por?: string | null;
          dados?: NonNullable<Json>;
          decidida_em?: string | null;
          desafio_90?: boolean;
          desconto_mensalidade_pct?: number;
          desconto_taxa_pct?: number;
          dominio_proprio?: boolean;
          enviada_em?: string | null;
          estado?: string;
          id?: string;
          iva_taxa?: number;
          lead_id: string;
          mensalidade_sem_iva: number;
          motivo_recusa?: string | null;
          numero: string;
          pdf_path?: string | null;
          periodicidade?: string;
          plano: string;
          profissionais: number;
          taxa_migracao_sem_iva?: number;
          valida_ate?: string | null;
          validade_dias?: number;
          valor_periodo_com_iva: number;
          valor_periodo_sem_iva: number;
          versao: number;
        };
        Update: {
          condicoes_lancamento?: string | null;
          criado_em?: string;
          criado_por?: string | null;
          dados?: NonNullable<Json>;
          decidida_em?: string | null;
          desafio_90?: boolean;
          desconto_mensalidade_pct?: number;
          desconto_taxa_pct?: number;
          dominio_proprio?: boolean;
          enviada_em?: string | null;
          estado?: string;
          id?: string;
          iva_taxa?: number;
          lead_id?: string;
          mensalidade_sem_iva?: number;
          motivo_recusa?: string | null;
          numero?: string;
          pdf_path?: string | null;
          periodicidade?: string;
          plano?: string;
          profissionais?: number;
          taxa_migracao_sem_iva?: number;
          valida_ate?: string | null;
          validade_dias?: number;
          valor_periodo_com_iva?: number;
          valor_periodo_sem_iva?: number;
          versao?: number;
        };
        Relationships: [
          {
            foreignKeyName: "propostas_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      recebimentos: {
        Row: {
          criado_em: string;
          data: string;
          fatura_id: string | null;
          id: string;
          inquilino_id: string;
          metodo: string;
          nota: string | null;
          registado_por: string | null;
          valor: number;
        };
        ComputedFields: never;
        Insert: {
          criado_em?: string;
          data: string;
          fatura_id?: string | null;
          id?: string;
          inquilino_id: string;
          metodo: string;
          nota?: string | null;
          registado_por?: string | null;
          valor: number;
        };
        Update: {
          criado_em?: string;
          data?: string;
          fatura_id?: string | null;
          id?: string;
          inquilino_id?: string;
          metodo?: string;
          nota?: string | null;
          registado_por?: string | null;
          valor?: number;
        };
        Relationships: [
          {
            foreignKeyName: "recebimentos_fatura_id_fkey";
            columns: ["fatura_id"];
            isOneToOne: false;
            referencedRelation: "faturas_plataforma";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recebimentos_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recebimentos_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recebimentos_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
        ];
      };
      servicos: {
        Row: {
          ativo: boolean;
          categoria: string | null;
          criado_em: string;
          descricao: string | null;
          descricao_en: string | null;
          descricao_fr: string | null;
          duracao_min: number;
          id: string;
          inquilino_id: string;
          nome: string;
          nome_en: string | null;
          nome_fr: string | null;
          ordem: number;
          preco: number;
        };
        ComputedFields: never;
        Insert: {
          ativo?: boolean;
          categoria?: string | null;
          criado_em?: string;
          descricao?: string | null;
          descricao_en?: string | null;
          descricao_fr?: string | null;
          duracao_min: number;
          id?: string;
          inquilino_id: string;
          nome: string;
          nome_en?: string | null;
          nome_fr?: string | null;
          ordem?: number;
          preco: number;
        };
        Update: {
          ativo?: boolean;
          categoria?: string | null;
          criado_em?: string;
          descricao?: string | null;
          descricao_en?: string | null;
          descricao_fr?: string | null;
          duracao_min?: number;
          id?: string;
          inquilino_id?: string;
          nome?: string;
          nome_en?: string | null;
          nome_fr?: string | null;
          ordem?: number;
          preco?: number;
        };
        Relationships: [
          {
            foreignKeyName: "servicos_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "servicos_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "servicos_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
        ];
      };
      subscricoes: {
        Row: {
          cancelada_em: string | null;
          cliente_id: string;
          clube_id: string;
          criado_em: string;
          estado: string;
          id: string;
          inicio: string;
          inquilino_id: string;
          proxima_renovacao: string;
        };
        ComputedFields: never;
        Insert: {
          cancelada_em?: string | null;
          cliente_id: string;
          clube_id: string;
          criado_em?: string;
          estado?: string;
          id?: string;
          inicio: string;
          inquilino_id: string;
          proxima_renovacao: string;
        };
        Update: {
          cancelada_em?: string | null;
          cliente_id?: string;
          clube_id?: string;
          criado_em?: string;
          estado?: string;
          id?: string;
          inicio?: string;
          inquilino_id?: string;
          proxima_renovacao?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscricoes_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "subscricoes_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "subscricoes_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
          {
            foreignKeyName: "subscricoes_inquilino_id_cliente_id_fkey";
            columns: ["inquilino_id", "cliente_id"];
            isOneToOne: false;
            referencedRelation: "clientes";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "subscricoes_inquilino_id_clube_id_fkey";
            columns: ["inquilino_id", "clube_id"];
            isOneToOne: false;
            referencedRelation: "clubes";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "subscricoes_inquilino_id_clube_id_fkey";
            columns: ["inquilino_id", "clube_id"];
            isOneToOne: false;
            referencedRelation: "publico_clubes";
            referencedColumns: ["inquilino_id", "id"];
          },
        ];
      };
      visitas: {
        Row: {
          base_comissao: number;
          cliente_id: string;
          comissao_percent: number;
          comissao_valor: number;
          criado_em: string;
          data: string;
          emitente: string | null;
          id: string;
          inquilino_id: string;
          marcacao_id: string;
          modelo_caixa: string;
          profissional_id: string | null;
          servico_id: string;
          valor_cobrado: number;
          valor_tabela: number;
        };
        ComputedFields: never;
        Insert: {
          base_comissao: number;
          cliente_id: string;
          comissao_percent: number;
          comissao_valor: number;
          criado_em?: string;
          data: string;
          emitente?: string | null;
          id?: string;
          inquilino_id: string;
          marcacao_id: string;
          modelo_caixa: string;
          profissional_id?: string | null;
          servico_id: string;
          valor_cobrado: number;
          valor_tabela: number;
        };
        Update: {
          base_comissao?: number;
          cliente_id?: string;
          comissao_percent?: number;
          comissao_valor?: number;
          criado_em?: string;
          data?: string;
          emitente?: string | null;
          id?: string;
          inquilino_id?: string;
          marcacao_id?: string;
          modelo_caixa?: string;
          profissional_id?: string | null;
          servico_id?: string;
          valor_cobrado?: number;
          valor_tabela?: number;
        };
        Relationships: [
          {
            foreignKeyName: "visitas_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "visitas_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "visitas_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
          {
            foreignKeyName: "visitas_inquilino_id_cliente_id_fkey";
            columns: ["inquilino_id", "cliente_id"];
            isOneToOne: false;
            referencedRelation: "clientes";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "visitas_inquilino_id_marcacao_id_fkey";
            columns: ["inquilino_id", "marcacao_id"];
            isOneToOne: false;
            referencedRelation: "marcacoes";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "visitas_inquilino_id_profissional_id_fkey";
            columns: ["inquilino_id", "profissional_id"];
            isOneToOne: false;
            referencedRelation: "profissionais";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "visitas_inquilino_id_profissional_id_fkey";
            columns: ["inquilino_id", "profissional_id"];
            isOneToOne: false;
            referencedRelation: "publico_profissionais";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "visitas_inquilino_id_servico_id_fkey";
            columns: ["inquilino_id", "servico_id"];
            isOneToOne: false;
            referencedRelation: "publico_servicos";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "visitas_inquilino_id_servico_id_fkey";
            columns: ["inquilino_id", "servico_id"];
            isOneToOne: false;
            referencedRelation: "servicos";
            referencedColumns: ["inquilino_id", "id"];
          },
        ];
      };
    };
    Views: {
      cliente_por_profissional: {
        Row: {
          cliente_id: string | null;
          inquilino_id: string | null;
          profissional_id: string | null;
          ticket_medio: number | null;
          ultima_visita: string | null;
          visitas: number | null;
        };
        ComputedFields: never;
        Relationships: [
          {
            foreignKeyName: "visitas_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "visitas_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "visitas_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
          {
            foreignKeyName: "visitas_inquilino_id_cliente_id_fkey";
            columns: ["inquilino_id", "cliente_id"];
            isOneToOne: false;
            referencedRelation: "clientes";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "visitas_inquilino_id_profissional_id_fkey";
            columns: ["inquilino_id", "profissional_id"];
            isOneToOne: false;
            referencedRelation: "profissionais";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "visitas_inquilino_id_profissional_id_fkey";
            columns: ["inquilino_id", "profissional_id"];
            isOneToOne: false;
            referencedRelation: "publico_profissionais";
            referencedColumns: ["inquilino_id", "id"];
          },
        ];
      };
      contas_pagar_com_estado: {
        Row: {
          criado_em: string | null;
          custo_id: string | null;
          descricao: string | null;
          estado_efetivo: string | null;
          fornecedor: string | null;
          id: string | null;
          nota: string | null;
          pago_em: string | null;
          valor_com_iva: number | null;
          valor_sem_iva: number | null;
          vencimento: string | null;
        };
        ComputedFields: never;
        Insert: {
          criado_em?: string | null;
          custo_id?: string | null;
          descricao?: string | null;
          estado_efetivo?: never;
          fornecedor?: string | null;
          id?: string | null;
          nota?: string | null;
          pago_em?: string | null;
          valor_com_iva?: number | null;
          valor_sem_iva?: number | null;
          vencimento?: string | null;
        };
        Update: {
          criado_em?: string | null;
          custo_id?: string | null;
          descricao?: string | null;
          estado_efetivo?: never;
          fornecedor?: string | null;
          id?: string | null;
          nota?: string | null;
          pago_em?: string | null;
          valor_com_iva?: number | null;
          valor_sem_iva?: number | null;
          vencimento?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "contas_pagar_custo_id_fkey";
            columns: ["custo_id"];
            isOneToOne: false;
            referencedRelation: "custos_plataforma";
            referencedColumns: ["id"];
          },
        ];
      };
      propostas_com_estado: {
        Row: {
          condicoes_lancamento: string | null;
          criado_em: string | null;
          criado_por: string | null;
          dados: Json | null;
          decidida_em: string | null;
          desafio_90: boolean | null;
          desconto_mensalidade_pct: number | null;
          desconto_taxa_pct: number | null;
          dominio_proprio: boolean | null;
          enviada_em: string | null;
          estado: string | null;
          estado_efetivo: string | null;
          id: string | null;
          iva_taxa: number | null;
          lead_id: string | null;
          mensalidade_sem_iva: number | null;
          motivo_recusa: string | null;
          numero: string | null;
          pdf_path: string | null;
          periodicidade: string | null;
          plano: string | null;
          profissionais: number | null;
          taxa_migracao_sem_iva: number | null;
          valida_ate: string | null;
          validade_dias: number | null;
          valor_periodo_com_iva: number | null;
          valor_periodo_sem_iva: number | null;
          versao: number | null;
        };
        ComputedFields: never;
        Insert: {
          condicoes_lancamento?: string | null;
          criado_em?: string | null;
          criado_por?: string | null;
          dados?: Json | null;
          decidida_em?: string | null;
          desafio_90?: boolean | null;
          desconto_mensalidade_pct?: number | null;
          desconto_taxa_pct?: number | null;
          dominio_proprio?: boolean | null;
          enviada_em?: string | null;
          estado?: string | null;
          estado_efetivo?: never;
          id?: string | null;
          iva_taxa?: number | null;
          lead_id?: string | null;
          mensalidade_sem_iva?: number | null;
          motivo_recusa?: string | null;
          numero?: string | null;
          pdf_path?: string | null;
          periodicidade?: string | null;
          plano?: string | null;
          profissionais?: number | null;
          taxa_migracao_sem_iva?: number | null;
          valida_ate?: string | null;
          validade_dias?: number | null;
          valor_periodo_com_iva?: number | null;
          valor_periodo_sem_iva?: number | null;
          versao?: number | null;
        };
        Update: {
          condicoes_lancamento?: string | null;
          criado_em?: string | null;
          criado_por?: string | null;
          dados?: Json | null;
          decidida_em?: string | null;
          desafio_90?: boolean | null;
          desconto_mensalidade_pct?: number | null;
          desconto_taxa_pct?: number | null;
          dominio_proprio?: boolean | null;
          enviada_em?: string | null;
          estado?: string | null;
          estado_efetivo?: never;
          id?: string | null;
          iva_taxa?: number | null;
          lead_id?: string | null;
          mensalidade_sem_iva?: number | null;
          motivo_recusa?: string | null;
          numero?: string | null;
          pdf_path?: string | null;
          periodicidade?: string | null;
          plano?: string | null;
          profissionais?: number | null;
          taxa_migracao_sem_iva?: number | null;
          valida_ate?: string | null;
          validade_dias?: number | null;
          valor_periodo_com_iva?: number | null;
          valor_periodo_sem_iva?: number | null;
          versao?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "propostas_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      publico_clubes: {
        Row: {
          id: string | null;
          inquilino_id: string | null;
          nome: string | null;
          preco_mensal: number | null;
          servicos: Json | null;
          validade_dias: number | null;
        };
        ComputedFields: never;
        Relationships: [
          {
            foreignKeyName: "clubes_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clubes_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clubes_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
        ];
      };
      publico_inquilinos: {
        Row: {
          aberto: boolean | null;
          antecedencia_cancelamento_min: number | null;
          capa_cor: string | null;
          capa_foto_url: string | null;
          cidade: string | null;
          codigo_postal: string | null;
          descricao: string | null;
          dias_descanso: number[] | null;
          dominio_proprio: string | null;
          facebook: string | null;
          galeria_urls: string[] | null;
          google_avaliacao_url: string | null;
          google_maps_url: string | null;
          historia: string | null;
          hora_abertura: string | null;
          hora_fecho: string | null;
          id: string | null;
          instagram: string | null;
          intervalo_almoco_fim: string | null;
          intervalo_almoco_inicio: string | null;
          janela_marcacao_dias: number | null;
          livro_reclamacoes_url: string | null;
          logo_url: string | null;
          morada: string | null;
          multilinguagem_ativa: boolean | null;
          nome: string | null;
          selos_necessarios: number | null;
          slug: string | null;
          telefone: string | null;
          tiktok: string | null;
          vertical: string | null;
          whatsapp: string | null;
        };
        ComputedFields: never;
        Insert: {
          aberto?: boolean | null;
          antecedencia_cancelamento_min?: number | null;
          capa_cor?: string | null;
          capa_foto_url?: string | null;
          cidade?: string | null;
          codigo_postal?: string | null;
          descricao?: string | null;
          dias_descanso?: number[] | null;
          dominio_proprio?: string | null;
          facebook?: string | null;
          galeria_urls?: string[] | null;
          google_avaliacao_url?: string | null;
          google_maps_url?: never;
          historia?: never;
          hora_abertura?: string | null;
          hora_fecho?: string | null;
          id?: string | null;
          instagram?: string | null;
          intervalo_almoco_fim?: string | null;
          intervalo_almoco_inicio?: string | null;
          janela_marcacao_dias?: number | null;
          livro_reclamacoes_url?: string | null;
          logo_url?: string | null;
          morada?: string | null;
          multilinguagem_ativa?: never;
          nome?: string | null;
          selos_necessarios?: number | null;
          slug?: string | null;
          telefone?: string | null;
          tiktok?: string | null;
          vertical?: string | null;
          whatsapp?: string | null;
        };
        Update: {
          aberto?: boolean | null;
          antecedencia_cancelamento_min?: number | null;
          capa_cor?: string | null;
          capa_foto_url?: string | null;
          cidade?: string | null;
          codigo_postal?: string | null;
          descricao?: string | null;
          dias_descanso?: number[] | null;
          dominio_proprio?: string | null;
          facebook?: string | null;
          galeria_urls?: string[] | null;
          google_avaliacao_url?: string | null;
          google_maps_url?: never;
          historia?: never;
          hora_abertura?: string | null;
          hora_fecho?: string | null;
          id?: string | null;
          instagram?: string | null;
          intervalo_almoco_fim?: string | null;
          intervalo_almoco_inicio?: string | null;
          janela_marcacao_dias?: number | null;
          livro_reclamacoes_url?: string | null;
          logo_url?: string | null;
          morada?: string | null;
          multilinguagem_ativa?: never;
          nome?: string | null;
          selos_necessarios?: number | null;
          slug?: string | null;
          telefone?: string | null;
          tiktok?: string | null;
          vertical?: string | null;
          whatsapp?: string | null;
        };
        Relationships: [];
      };
      publico_periodos_desconto: {
        Row: {
          dia_semana: number | null;
          hora_fim: string | null;
          hora_inicio: string | null;
          id: string | null;
          inquilino_id: string | null;
          percentagem: number | null;
        };
        ComputedFields: never;
        Relationships: [
          {
            foreignKeyName: "periodos_desconto_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "periodos_desconto_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "periodos_desconto_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
        ];
      };
      publico_portfolio: {
        Row: {
          foto_url: string | null;
          id: string | null;
          inquilino_id: string | null;
          legenda: string | null;
          ordem: number | null;
          profissional_id: string | null;
        };
        ComputedFields: never;
        Relationships: [
          {
            foreignKeyName: "portfolio_fotos_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "portfolio_fotos_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "portfolio_fotos_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
          {
            foreignKeyName: "portfolio_fotos_inquilino_id_profissional_id_fkey";
            columns: ["inquilino_id", "profissional_id"];
            isOneToOne: false;
            referencedRelation: "profissionais";
            referencedColumns: ["inquilino_id", "id"];
          },
          {
            foreignKeyName: "portfolio_fotos_inquilino_id_profissional_id_fkey";
            columns: ["inquilino_id", "profissional_id"];
            isOneToOne: false;
            referencedRelation: "publico_profissionais";
            referencedColumns: ["inquilino_id", "id"];
          },
        ];
      };
      publico_produtos: {
        Row: {
          descricao: string | null;
          esgotado: boolean | null;
          foto_url: string | null;
          id: string | null;
          inquilino_id: string | null;
          nome: string | null;
          preco_venda: number | null;
        };
        ComputedFields: never;
        Relationships: [
          {
            foreignKeyName: "produtos_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "produtos_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "produtos_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
        ];
      };
      publico_profissionais: {
        Row: {
          foto_url: string | null;
          id: string | null;
          inquilino_id: string | null;
          nome_apresentado: string | null;
          ordem: number | null;
          portfolio_visivel: boolean | null;
        };
        ComputedFields: never;
        Relationships: [
          {
            foreignKeyName: "profissionais_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profissionais_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profissionais_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
        ];
      };
      publico_promocoes: {
        Row: {
          descricao: string | null;
          fim: string | null;
          id: string | null;
          inicio: string | null;
          inquilino_id: string | null;
          titulo: string | null;
        };
        ComputedFields: never;
        Relationships: [
          {
            foreignKeyName: "promocoes_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "promocoes_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "promocoes_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
        ];
      };
      publico_servicos: {
        Row: {
          categoria: string | null;
          descricao: string | null;
          descricao_en: string | null;
          descricao_fr: string | null;
          duracao_min: number | null;
          id: string | null;
          inquilino_id: string | null;
          nome: string | null;
          nome_en: string | null;
          nome_fr: string | null;
          ordem: number | null;
          preco: number | null;
        };
        ComputedFields: never;
        Relationships: [
          {
            foreignKeyName: "servicos_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "servicos_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "servicos_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
        ];
      };
      saldo_cartoes: {
        Row: {
          anulado_em: string | null;
          cartao_id: string | null;
          codigo: string | null;
          inquilino_id: string | null;
          saldo: number | null;
          valido_ate: string | null;
        };
        ComputedFields: never;
        Insert: {
          anulado_em?: string | null;
          cartao_id?: string | null;
          codigo?: string | null;
          inquilino_id?: string | null;
          saldo?: never;
          valido_ate?: string | null;
        };
        Update: {
          anulado_em?: string | null;
          cartao_id?: string | null;
          codigo?: string | null;
          inquilino_id?: string | null;
          saldo?: never;
          valido_ate?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "cartoes_oferta_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cartoes_oferta_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cartoes_oferta_inquilino_id_fkey";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
        ];
      };
      saldo_selos: {
        Row: {
          cliente_id: string | null;
          inquilino_id: string | null;
          selos: number | null;
        };
        ComputedFields: never;
        Relationships: [
          {
            foreignKeyName: "movimentos_selos_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "movimentos_selos_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "publico_inquilinos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "movimentos_selos_inquilino_fk";
            columns: ["inquilino_id"];
            isOneToOne: false;
            referencedRelation: "vencimentos_proximos";
            referencedColumns: ["inquilino_id"];
          },
          {
            foreignKeyName: "movimentos_selos_inquilino_id_cliente_id_fkey";
            columns: ["inquilino_id", "cliente_id"];
            isOneToOne: false;
            referencedRelation: "clientes";
            referencedColumns: ["inquilino_id", "id"];
          },
        ];
      };
      vencimentos_proximos: {
        Row: {
          dias: number | null;
          email: string | null;
          estado: string | null;
          estado_pagamento: string | null;
          inquilino_id: string | null;
          nome: string | null;
          periodicidade: string | null;
          plano: string | null;
          proximo_vencimento: string | null;
          slug: string | null;
          ultimo_lembrete_em: string | null;
          whatsapp: string | null;
        };
        ComputedFields: never;
        Insert: {
          dias?: never;
          email?: string | null;
          estado?: string | null;
          estado_pagamento?: string | null;
          inquilino_id?: string | null;
          nome?: string | null;
          periodicidade?: string | null;
          plano?: string | null;
          proximo_vencimento?: string | null;
          slug?: string | null;
          ultimo_lembrete_em?: never;
          whatsapp?: string | null;
        };
        Update: {
          dias?: never;
          email?: string | null;
          estado?: string | null;
          estado_pagamento?: string | null;
          inquilino_id?: string | null;
          nome?: string | null;
          periodicidade?: string | null;
          plano?: string | null;
          proximo_vencimento?: string | null;
          slug?: string | null;
          ultimo_lembrete_em?: never;
          whatsapp?: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      abrir_ciclo_clube: { Args: { p_inicio: string; p_subscricao: string }; Returns: string };
      abrir_lembrete_vencimento: { Args: { p_id: string }; Returns: undefined };
      anonimizar_cliente: { Args: { p_cliente: string }; Returns: undefined };
      apagar_auditoria_antiga: { Args: { p_meses?: number }; Returns: number };
      apagar_leads_inativos: { Args: { p_meses?: number }; Returns: number };
      aplicar_pacote: { Args: { p_inquilino: string }; Returns: undefined };
      aprovar_comprovativo: { Args: { p_id: string }; Returns: string };
      assinar_contrato: {
        Args: { p_contrato: string; p_data: string; p_inicio?: string; p_pdf_assinado: string };
        Returns: undefined;
      };
      avisar_fila_espera: { Args: { p_entrada: string }; Returns: string };
      barbearia_suspensa: { Args: { p_slug: string }; Returns: boolean };
      calcular_preco: {
        Args: { p_inicio: string; p_inquilino: string; p_servico: string };
        Returns: {
          desconto_percent: number;
          valor_cobrado: number;
          valor_tabela: number;
        }[];
      };
      campos_alterados: { Args: { p_antes: Json; p_depois: Json }; Returns: string[] };
      cancelar_lembrete_vencimento: { Args: { p_id: string }; Returns: undefined };
      cancelar_minha_marcacao: {
        Args: { p_marcacao: string; p_motivo?: string };
        Returns: undefined;
      };
      carteira_comercial: {
        Args: { p_user?: string };
        Returns: {
          aprovado_em: string;
          estado: string;
          estado_pagamento: string;
          inquilino_id: string;
          lead_id: string;
          nome: string;
          plano: string;
        }[];
      };
      cliente_por_telefone: {
        Args: {
          p_consentimento?: boolean;
          p_data_nascimento?: string;
          p_email?: string;
          p_inquilino: string;
          p_nome: string;
          p_origem: string;
          p_telefone: string;
        };
        Returns: string;
      };
      clientes_do_profissional: { Args: Record<PropertyKey, never>; Returns: string[] };
      comunicado_para: { Args: { p_comunicado: string; p_inquilino: string }; Returns: boolean };
      concluir_marcacao: {
        Args: { p_marcacao: string; p_modo?: string; p_valor_cobrado?: number };
        Returns: string;
      };
      confirmar_lembrete_vencimento: { Args: { p_id: string }; Returns: undefined };
      confirmar_reserva: {
        Args: {
          p_codigo_convite?: string;
          p_consentimento?: boolean;
          p_data_nascimento?: string;
          p_email?: string;
          p_marcacao: string;
          p_nome: string;
          p_telefone: string;
          p_token: string;
        };
        Returns: string;
      };
      consumir_limite: {
        Args: { p_chave: string; p_janela: string; p_max: number };
        Returns: boolean;
      };
      criar_convite_adesao: {
        Args: { p_contrato: string; p_dados: Json; p_dias?: number; p_token: string };
        Returns: string;
      };
      criar_pedido_loja: {
        Args: {
          p_consentimento?: boolean;
          p_inquilino: string;
          p_linhas: Json;
          p_nome: string;
          p_telefone: string;
        };
        Returns: string;
      };
      criar_proposta: { Args: { p: Json; p_lead: string }; Returns: string };
      decidir_proposta: {
        Args: { p_aceite: boolean; p_motivo?: string; p_proposta: string };
        Returns: undefined;
      };
      e_comercial: { Args: Record<PropertyKey, never>; Returns: boolean };
      e_dono_plataforma: { Args: Record<PropertyKey, never>; Returns: boolean };
      e_sistema: { Args: Record<PropertyKey, never>; Returns: boolean };
      e_super_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      eliminar_inquilino: {
        Args: { p_confirmacao: string; p_inquilino: string };
        Returns: {
          user_id: string;
        }[];
      };
      entrar_fila_espera: {
        Args: {
          p_consentimento?: boolean;
          p_dia: string;
          p_inquilino: string;
          p_nome: string;
          p_servico: string;
          p_telefone: string;
        };
        Returns: string;
      };
      entrar_fila_presencial: {
        Args: {
          p_consentimento?: boolean;
          p_inquilino: string;
          p_nome: string;
          p_servico?: string;
          p_telefone: string;
        };
        Returns: {
          entrada_id: string;
          posicao: number;
        }[];
      };
      enviar_comprovativo: {
        Args: {
          p_caminho: string;
          p_inquilino: string;
          p_metodo: string;
          p_pago_em: string;
          p_valor: number;
        };
        Returns: string;
      };
      escolher_comercial: { Args: Record<PropertyKey, never>; Returns: string };
      estado_fila_presencial: {
        Args: { p_entrada: string };
        Returns: {
          estado: string;
          minutos_a_frente: number;
          minutos_em_curso: number;
          posicao: number;
          profissionais: number;
        }[];
      };
      evento_lead: {
        Args: { p_detalhes?: Json; p_lead: string; p_texto: string; p_tipo: string };
        Returns: undefined;
      };
      exigir_comercial_ou_admin: { Args: Record<PropertyKey, never>; Returns: undefined };
      exigir_gestor: { Args: { p_inquilino: string }; Returns: undefined };
      exigir_lead: { Args: { p_lead: string }; Returns: undefined };
      exigir_super_admin: { Args: Record<PropertyKey, never>; Returns: undefined };
      fixar_texto_contrato: { Args: { p_contrato: string; p_texto: string }; Returns: undefined };
      funcionalidade_ativa: { Args: { p_chave: string; p_inquilino: string }; Returns: boolean };
      gerar_contrato: {
        Args: { p_dados: Json; p_modelo: string; p_proposta: string; p_texto: string };
        Returns: string;
      };
      hoje_lisboa: { Args: Record<PropertyKey, never>; Returns: string };
      hora_local: { Args: { p: string }; Returns: string };
      inquilinos_onde: { Args: { p_papeis: string[]; p_so_ativos?: boolean }; Returns: string[] };
      inscrever_clube: {
        Args: { p_cliente: string; p_clube: string; p_inicio: string };
        Returns: string;
      };
      instante_lisboa: { Args: { p_dia: string; p_hora: string }; Returns: string };
      lead_acessivel: { Args: { p_lead: string }; Returns: boolean };
      ler_convite_adesao: { Args: { p_token: string }; Returns: Json };
      levantar_pedido: { Args: { p_pedido: string }; Returns: undefined };
      ligar_contrato_inquilino: {
        Args: { p_contrato: string; p_inquilino: string };
        Returns: undefined;
      };
      marcacao_online_bloqueada: { Args: { p_cliente: string }; Returns: boolean };
      marcar_comissao_paga: { Args: { p_comissao: string; p_data: string }; Returns: undefined };
      marcar_comunicado_lido: {
        Args: { p_comunicado: string; p_inquilino: string };
        Returns: undefined;
      };
      marcar_contrato_enviado: { Args: { p_contrato: string }; Returns: undefined };
      marcar_falta: { Args: { p_marcacao: string }; Returns: undefined };
      marcar_proposta_enviada: { Args: { p_proposta: string }; Returns: undefined };
      meu_cartao_selos: {
        Args: { p_inquilino: string };
        Returns: {
          necessarios: number;
          premio: string;
          selos: number;
        }[];
      };
      meu_codigo_convite: { Args: { p_inquilino: string }; Returns: string };
      meus_clientes: { Args: Record<PropertyKey, never>; Returns: string[] };
      meus_comunicados: {
        Args: { p_inquilino: string };
        Returns: {
          id: string;
          inicio: string;
          texto: string;
          titulo: string;
        }[];
      };
      meus_leads: { Args: Record<PropertyKey, never>; Returns: string[] };
      meus_profissionais: { Args: Record<PropertyKey, never>; Returns: string[] };
      modulo_ativo: { Args: { p_chave: string; p_inquilino: string }; Returns: boolean };
      mudar_estado_lead: {
        Args: { p_estado: string; p_lead: string; p_motivo?: string };
        Returns: undefined;
      };
      nif_valido: { Args: { p_nif: string }; Returns: boolean };
      pasta_lead_acessivel: { Args: { p_nome: string }; Returns: boolean };
      pedir_codigo_acesso: {
        Args: { p_inquilino: string; p_telefone: string };
        Returns: undefined;
      };
      periodo_a_pagar: {
        Args: { p_inquilino: string };
        Returns: {
          fatura_id: string;
          fim: string;
          inicio: string;
          valor_fatura: number;
        }[];
      };
      pode_criar_acesso_direto: { Args: { p_cliente: string }; Returns: boolean };
      pode_marcar_online: { Args: { p_cliente: string }; Returns: boolean };
      posicao_fila_espera: { Args: { p_entrada: string }; Returns: number };
      preparar_demonstracao: { Args: Record<PropertyKey, never>; Returns: string };
      preparar_lembrete_vencimento: {
        Args: { p_canal: string; p_conteudo: string; p_inquilino: string };
        Returns: string;
      };
      procurar_cliente_por_telefone: {
        Args: { p_inquilino: string; p_telefone: string };
        Returns: {
          id: string;
          nome: string;
        }[];
      };
      proximo_numero_comercial: { Args: { p_serie: string }; Returns: string };
      reclamar_email_confirmacao: {
        Args: { p_marcacao: string };
        Returns: {
          barbearia: string;
          barbeiro: string;
          cancelamento_min: number;
          cliente: string;
          dominio: string;
          email_barbearia: string;
          fim: string;
          inicio: string;
          morada: string;
          para: string;
          servico: string;
          slug: string;
        }[];
      };
      recusar_comprovativo: { Args: { p_id: string; p_motivo: string }; Returns: undefined };
      registar_auditoria: {
        Args: {
          p_accao: string;
          p_detalhes: Json;
          p_entidade: string;
          p_entidade_id: string;
          p_inquilino: string;
        };
        Returns: undefined;
      };
      registar_auditoria_admin: {
        Args: {
          p_accao: string;
          p_detalhes: Json;
          p_entidade: string;
          p_entidade_id: string;
          p_inquilino: string;
        };
        Returns: undefined;
      };
      registar_email_confirmacao: {
        Args: { p_enviado: boolean; p_marcacao: string };
        Returns: undefined;
      };
      registar_email_lembrete: { Args: { p_id: string; p_ok: boolean }; Returns: undefined };
      registar_evento_lead: {
        Args: {
          p_lead: string;
          p_proxima_acao?: string;
          p_proxima_acao_em?: string;
          p_texto: string;
          p_tipo: string;
        };
        Returns: undefined;
      };
      registar_taxa_paga: { Args: { p_comissao: string; p_data: string }; Returns: undefined };
      renovar_subscricao: { Args: { p_subscricao: string }; Returns: string };
      reservar_vaga: {
        Args: { p_inicio: string; p_inquilino: string; p_profissional?: string; p_servico: string };
        Returns: {
          desconto_percent: number;
          marcacao_id: string;
          profissional_id: string;
          reservada_ate: string;
          token: string;
          valor_cobrado: number;
          valor_tabela: number;
        }[];
      };
      saude_carteira: {
        Args: { p_user?: string };
        Returns: {
          aprovada_em: string;
          clientes: number;
          concluidas: number;
          estado: string;
          estado_pagamento: string;
          inquilino_id: string;
          marcacoes_30: number;
          marcacoes_anteriores_30: number;
          marcacoes_online: number;
          marcacoes_total: number;
          nome: string;
          profissionais_ativos: number;
          profissionais_com_acesso: number;
          responsavel: string;
          servicos_ativos: number;
          telefone: string;
          tem_logotipo: boolean;
          ultima_marcacao: string;
        }[];
      };
      submeter_lead: { Args: { p: Json }; Returns: boolean };
      submeter_pedido_adesao: { Args: { p: Json }; Returns: string };
      usar_cartao_oferta: {
        Args: { p_codigo: string; p_inquilino: string; p_marcacao?: string; p_valor: number };
        Returns: number;
      };
      usar_convite_adesao: { Args: { p_pedido: string; p_token: string }; Returns: boolean };
      vagas_livres: {
        Args: {
          p_dia: string;
          p_inquilino: string;
          p_profissional?: string;
          p_publico?: boolean;
          p_servico: string;
        };
        Returns: {
          desconto_percent: number;
          inicio: string;
          profissional_id: string;
          valor_cobrado: number;
          valor_tabela: number;
        }[];
      };
      validar_vaga: {
        Args: {
          p_ignorar?: string;
          p_inicio: string;
          p_inquilino: string;
          p_profissional: string;
          p_publico?: boolean;
          p_servico: string;
        };
        Returns: string;
      };
      vender_cartao_oferta: {
        Args: {
          p_beneficiario?: string;
          p_comprador: string;
          p_comprador_cliente?: string;
          p_inquilino: string;
          p_metodo?: string;
          p_valido_ate?: string;
          p_valor: number;
        };
        Returns: string;
      };
      verificar_codigo_acesso: {
        Args: { p_codigo: string; p_inquilino: string; p_telefone: string };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
