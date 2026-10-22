## Parte K · Comando de arranque

O texto abaixo copia-se para o Claude Code no início do trabalho, com o
repositório da especificação aberto. Não se cola o documento mestre: o Claude
Code lê o `CLAUDE.md` e os ficheiros de cada fase.

```
Constrói a plataforma InstaBarber conforme a especificação deste repositório,
versão 10.1.

1. Lê o CLAUDE.md. As regras dele não se negociam.
2. Lê o fases/README.md e o fases/fase-0.md. Não leias o documento mestre.
3. Em cada fase, lê só as secções que o ficheiro da fase indica.
4. Antes de escrever código, apresenta o resumo da fase — o que vais construir,
   os ficheiros que vais criar e o que não vais fazer — e espera pela minha
   confirmação.
5. O esquema da base de dados é o de docs/esquema/. Copia-o para
   supabase/migrations/ sem o reescrever; se precisares de o alterar, propõe a
   alteração e o teste primeiro.
6. Se faltar uma chave em .env.local, para e pede-a. Nunca inventes valores.
7. Decisão de produto não especificada: pergunta. Decisão técnica menor:
   escolhe a mais simples e regista no DECISOES.md.
8. No fim de cada fase: typecheck, lint, test, test:sql e build sem erros,
   o resultado verificável mostrado, e o PROGRESSO.md atualizado. Não avances
   sem a minha confirmação.

Começa pela Fase 0.
```

### K.1 · Notas para quem executa

- Em caso de conflito entre a especificação e uma sugestão do assistente, prevalece a especificação; entre duas partes da especificação, prevalece o `DECISOES.md`.
- A qualidade da interface é parte do requisito, não um acabamento.
- Nenhuma funcionalidade está concluída se não estiver testada com um utilizador real do papel certo.
