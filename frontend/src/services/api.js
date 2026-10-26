const API_URL = import.meta.env.VITE_API_URL || '/api';

async function request(path, { method = 'GET', body } = {}) {
  if (!API_URL) {
    throw new Error('VITE_API_URL não configurada.');
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });

  const texto = await response.text();
  let dados = null;

  if (texto) {
    try {
      dados = JSON.parse(texto);
    } catch {
      dados = texto;
    }
  }

  if (!response.ok) {
    const mensagem =
      (dados && dados.message) || `Erro HTTP ${response.status}`;
    throw new Error(mensagem);
  }

  return dados;
}

export function buscarEventos() {
  return request('/eventos');
}

export function buscarCertificados() {
  return request('/certificados');
}

export function inserirEvento(dados) {
  return request('/eventos', { method: 'POST', body: dados });
}

export function alterarEvento(id, dados) {
  return request(`/eventos/${encodeURIComponent(id)}`, { method: 'PUT', body: dados });
}

export function excluirEvento(id) {
  return request(`/eventos/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export const buscarResumo = () => request('/aggregated-data');
export const inserirCertificado = (body) => request('/certificados', { method: 'POST', body });
export const alterarCertificado = (id, body) => request(`/certificados/${encodeURIComponent(id)}`, { method: 'PUT', body });
export const excluirCertificado = (id) => request(`/certificados/${encodeURIComponent(id)}`, { method: 'DELETE' });
