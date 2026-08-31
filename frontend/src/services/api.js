const API_URL = import.meta.env.VITE_API_URL;

async function get(path) {
  if (!API_URL) {
    throw new Error('VITE_API_URL não configurada.');
  }

  const response = await fetch(`${API_URL}${path}`);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Erro HTTP ${response.status}: ${body}`);
  }

  return response.json();
}

export function buscarEventos() {
  return get('/api/eventos');
}

export function buscarCertificados() {
  return get('/api/certificados');
}
