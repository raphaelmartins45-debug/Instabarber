#!/usr/bin/env bash
# Gera o documento mestre e os critérios de aceitação a partir das Partes.
# Nunca editar o documento mestre à mão: editar a Parte e correr este script.
# A Parte P (roteiro de expansões, dormente) fica fora do mestre de propósito: só se lê por ordem do dono.
set -euo pipefail
cd "$(dirname "$0")/.."
saida=instabarber-documento-mestre.md
{
  cat docs/00-indice.md
  for f in docs/parte-a-*.md docs/parte-b-*.md docs/parte-c-*.md docs/parte-d-*.md docs/parte-e-*.md \
           docs/parte-f-*.md docs/parte-g-*.md docs/parte-h-*.md docs/parte-i-*.md docs/parte-j-*.md \
           docs/parte-k-*.md docs/parte-l-*.md docs/parte-m-*.md docs/parte-n-*.md docs/parte-o-*.md; do
    printf '\n\n---\n\n'
    cat "$f"
  done
  printf '\n\n---\n\n'
  cat docs/manual-do-operador.md
  printf '\n\n---\n\n## Anexo · Esquema da base de dados\n\nO SQL completo está em `docs/esquema/` (01 a 04) e não se reproduz aqui.\n'
} > "$saida"

# Critérios de aceitação: cópia da J.1, em caixas de verificação
python3 - <<'PY'
j = open('docs/parte-j-plano-de-execucao.md', encoding='utf-8').read()
corpo = j[j.index('### J.1'):j.index('### J.2')]
linhas = corpo.splitlines()[1:]
out = []
for l in linhas:
    if l.startswith('**') and l.endswith('**'):
        out.append('### ' + l.strip('*'))
    elif l.startswith('- '):
        out.append('- [ ] ' + l[2:])
    else:
        out.append(l)
texto = '\n'.join(out)
open('fases/criterios-de-aceitacao.md', 'w', encoding='utf-8').write(
    '# Critérios de aceitação\n\nGerado a partir da J.1 por `scripts/gerar-mestre.sh`. '
    'Não editar aqui: editar a J.1.\n\n' + texto.strip() + '\n')
PY
echo "Gerados: $saida e fases/criterios-de-aceitacao.md"
