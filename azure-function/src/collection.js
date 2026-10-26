const TIPOS_PERMITIDOS = ['eventos', 'certificados'];

// Cada Function opera sobre eventos ou certificados, escolhido via ?tipo= na querystring.
// Retorna null quando o tipo informado não é permitido.
function getTipo(request) {
  const tipo = request.query.get('tipo') || 'eventos';

  if (!TIPOS_PERMITIDOS.includes(tipo)) {
    return null;
  }

  return tipo;
}

// module.exports - Permite que o código possa ser usado em arquivos diferentes
module.exports = {
  getTipo,
  TIPOS_PERMITIDOS
};
