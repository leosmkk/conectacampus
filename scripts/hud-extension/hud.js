// Painel "Chamadas de rede (API Gateway)" para gravacoes MANUAIS no navegador normal.
// Observa fetch/XHR da propria pagina (site e Swagger) e as paginas JSON abertas direto no gateway.
// Alt+H esconde/mostra o painel; Alt+C limpa a lista.
(() => {
  if (window.__campusHud) return;
  window.__campusHud = true;
  const GATEWAY = 'https://apim-campus-7e6589.azure-api.net/api';
  const log = [];
  let root;
  let hidden = false;

  function ensure() {
    if (root && root.isConnected) return;
    root = document.createElement('div');
    root.style.cssText = 'position:fixed;bottom:14px;right:14px;z-index:2147483647;pointer-events:none;background:rgba(20,24,32,.9);color:#d6f5e6;padding:10px 12px;border-radius:12px;font:12px ui-monospace,monospace;min-width:320px;display:none';
    (document.documentElement || document).appendChild(root);
  }
  function paint() {
    ensure();
    root.style.display = !hidden && log.length ? 'block' : 'none';
    root.innerHTML = '<div style="color:#fff;margin-bottom:6px;font:600 12px system-ui">Chamadas de rede (API Gateway)</div>' +
      log.map(([m, p, s]) => '<div><b style="color:' + (s >= 400 || s === 0 ? '#fca5a5' : '#86efac') + '">' + m + '</b> ' + p + ' <b>' + s + '</b></div>').join('');
  }
  function record(method, href, status) {
    let url;
    try { url = new URL(href, location.href); } catch { return; }
    if (!url.href.startsWith(GATEWAY)) return;
    if (url.pathname.startsWith('/api/docs')) return; // arquivos da Swagger UI nao interessam
    const path = url.pathname.length > 34 ? url.pathname.slice(0, 33) + '…' : url.pathname;
    log.push([method, path, status]);
    if (log.length > 7) log.shift();
    paint();
  }

  const nativeFetch = window.fetch;
  window.fetch = async function (input, init) {
    const method = String(init?.method || input?.method || 'GET').toUpperCase();
    const target = typeof input === 'string' || input instanceof URL ? String(input) : input.url;
    try {
      const response = await nativeFetch.apply(this, arguments);
      record(method, target, response.status);
      return response;
    } catch (err) { record(method, target, 0); throw err; }
  };
  const nativeOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) { this.__hud = [String(method).toUpperCase(), String(url)]; return nativeOpen.apply(this, arguments); };
  const nativeSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function () {
    this.addEventListener('loadend', () => { if (this.__hud) record(this.__hud[0], this.__hud[1], this.status); });
    return nativeSend.apply(this, arguments);
  };

  // Pagina aberta direto no gateway (ex.: /api/aggregated-data, /api/events): mostra a propria requisicao.
  addEventListener('DOMContentLoaded', () => {
    const nav = performance.getEntriesByType('navigation')[0];
    if (location.href.startsWith(GATEWAY) && nav?.responseStatus) record('GET', location.href, nav.responseStatus);
  });
  addEventListener('keydown', (ev) => {
    if (!ev.altKey) return;
    if (ev.key.toLowerCase() === 'h') { hidden = !hidden; paint(); }
    if (ev.key.toLowerCase() === 'c') { log.length = 0; paint(); }
  });
})();
