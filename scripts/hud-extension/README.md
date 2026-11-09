# Painel de chamadas ao gateway (extensão do Chrome)

Mostra, no canto inferior direito, o painel **"Chamadas de rede (API Gateway)"** sobre o site do ConectaCampus e a Swagger UI. Serve para gravações e apresentações feitas à mão: o painel prova que a página só conversa com o gateway.

O que aparece:
- as chamadas `fetch`/XHR que a própria página faz ao gateway (método, caminho e status, em verde para 2xx e vermelho para 4xx);
- a requisição de páginas abertas direto no gateway, como `/api/aggregated-data` e `/api/events`.

## Instalação
1. Abra `chrome://extensions` e ligue o **Modo do desenvolvedor**.
2. Clique em **Carregar sem compactação** e escolha esta pasta (`scripts/hud-extension`).
3. Atualize o site ou a Swagger.

## Atalhos
- `Alt+H`: esconde ou mostra o painel.
- `Alt+C`: limpa a lista.

## Configuração
O endereço do gateway (`GATEWAY`) fica no topo de `hud.js`, e os sites onde a extensão atua ficam em `matches`, no `manifest.json`. Se o gateway mudar, ajuste os dois.

O Chrome pode pedir para desativar extensões do modo desenvolvedor ao reiniciar. Desligue a extensão quando terminar de gravar.
