function fakeRequest({ query = {}, params = {}, body } = {}) {
  return {
    query: new URLSearchParams(query),
    params,
    json: async () => {
      if (body instanceof Error) throw body;
      return body;
    }
  };
}

function fakeContext() {
  const erros = [];
  return { erros, error: (...args) => erros.push(args) };
}

module.exports = { fakeRequest, fakeContext };
