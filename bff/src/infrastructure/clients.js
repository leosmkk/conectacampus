export class UpstreamError extends Error {
  constructor(message, status = 502) { super(message); this.status = status; }
}

export function createClients(config, transport = fetch) {
  async function request(base, path, options = {}) {
    let response;
    try {
      response = await transport(`${base.replace(/\/$/, '')}${path}`, {
        method: options.method ?? 'GET',
        headers: { 'Content-Type': 'application/json', 'x-service-token': config.token, ...(options.function ? { 'x-functions-key': config.functionKey ?? '' } : {}) },
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: AbortSignal.timeout(config.timeout ?? 8000)
      });
    } catch (error) {
      throw new UpstreamError('Uma dependência está indisponível.', error.name === 'TimeoutError' ? 504 : 502);
    }
    if (response.status === 204) return null;
    let data;
    try { data = await response.json(); } catch { throw new UpstreamError('Resposta inválida de uma dependência.'); }
    if (!response.ok) {
      const status = [400, 404, 409, 422].includes(response.status) ? response.status : 502;
      throw new UpstreamError(status < 500 ? data.message : 'Uma dependência está indisponível.', status);
    }
    return data;
  }
  return {
    events: (path, options) => request(config.events, path, options),
    certificates: (path, options) => request(config.certificates, path, options),
    enrich: (body) => request(config.function, '/api/enrich', { method: 'POST', body, function: true }),
    processedEvents: () => request(config.function, '/api/events', { function: true })
  };
}
