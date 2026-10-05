const {
  TipoInvalidoError,
  IdInvalidoError,
  DadosInvalidosError,
  RegistroNaoEncontradoError
} = require('../domain/errors');

const STATUS_POR_ERRO = [
  [TipoInvalidoError, 400],
  [IdInvalidoError, 400],
  [DadosInvalidosError, 400],
  [RegistroNaoEncontradoError, 404]
];

// Converte erros de domínio em resposta HTTP; qualquer outro erro vira 500 com a mensagem da operação.
function responderErro(error, context, operacao, mensagem500) {
  const mapeado = STATUS_POR_ERRO.find(([Tipo]) => error instanceof Tipo);

  if (mapeado) {
    return { status: mapeado[1], jsonBody: { message: error.message } };
  }

  context.error(`Erro ao ${operacao}:`, error);

  return { status: 500, jsonBody: { message: mensagem500 } };
}

module.exports = { responderErro };
