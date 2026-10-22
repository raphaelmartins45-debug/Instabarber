// Entrada da equipa, palavra-passe, verificação em dois passos e acesso do cliente (B.6, B9, F.9).

export const acesso = {
  equipa: {
    titulo: "Entrar",
    subtitulo: "Gestores e barbeiros",
    email: "E-mail",
    palavraPasse: "Palavra-passe",
    botao: "Entrar",
    esqueci: "Esqueci-me da palavra-passe",
    erroCredenciais: "E-mail ou palavra-passe errados.",
    semAcesso: "Esta conta não tem acesso a nenhuma barbearia ativa.",
  },
  recuperar: {
    titulo: "Recuperar a palavra-passe",
    texto:
      "Escreva o seu e-mail. Se tiver conta, recebe uma ligação para definir uma palavra-passe nova.",
    botao: "Enviar ligação",
    enviado:
      "Se o e-mail tiver conta, a ligação chega dentro de momentos. Veja também a pasta de spam.",
    voltar: "Voltar à entrada",
  },
  definir: {
    titulo: "Definir a palavra-passe",
    texto: "Escolha uma palavra-passe com pelo menos 8 caracteres.",
    nova: "Palavra-passe",
    repetir: "Repita a palavra-passe",
    botao: "Guardar e entrar",
    erroDiferentes: "As duas palavras-passe não são iguais.",
    erroCurta: "A palavra-passe tem de ter pelo menos 8 caracteres.",
    erroFraca: "Escolha uma palavra-passe diferente, mais difícil de adivinhar.",
    ligacaoInvalida: "A ligação expirou ou já foi usada. Peça uma nova.",
  },
  doisPassos: {
    titulo: "Verificação em dois passos",
    inscrever:
      "Leia o código QR com uma aplicação de autenticação (Google Authenticator, Microsoft Authenticator, 1Password…) e escreva o código de 6 dígitos que ela mostra.",
    chave: "Se não conseguir ler o código QR, escreva esta chave na aplicação:",
    desafio: "Abra a aplicação de autenticação e escreva o código de 6 dígitos.",
    codigo: "Código de 6 dígitos",
    botao: "Confirmar",
    erroCodigo: "Código errado. Tente outra vez.",
  },
  cliente: {
    titulo: "Entrar na minha área",
    telemovel: "Telemóvel",
    exemploTelemovel: "912 345 678",
    palavraPasse: "Palavra-passe",
    botao: "Entrar",
    erroCredenciais: "Telemóvel ou palavra-passe errados.",
    semAcesso: "Ainda não tem acesso, ou esqueceu-se da palavra-passe?",
    pedirTitulo: "Pedir código",
    pedirTexto:
      "A barbearia vai enviar-lhe um código de 6 dígitos por WhatsApp. O código é válido durante 15 minutos.",
    foraDeHoras: "Receberá o código quando a barbearia abrir.",
    pedirBotao: "Pedir código",
    pedido:
      "Pedido registado. Quando receber o código, escreva-o abaixo com a palavra-passe que quer usar.",
    codigo: "Código de 6 dígitos",
    novaPalavraPasse: "Palavra-passe nova (pelo menos 8 caracteres)",
    criarBotao: "Criar acesso",
    erroCodigo: "Código errado ou expirado. Peça um código novo.",
    erroTelemovel: "Escreva um número de telemóvel português com 9 dígitos.",
  },
  erros: {
    limite: "Demasiadas tentativas. Tente outra vez daqui a uma hora.",
    generico: "Não foi possível concluir. Tente outra vez.",
  },
} as const;
