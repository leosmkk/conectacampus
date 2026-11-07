# ConectaCampus PJBL

Aplicação distribuída para agenda acadêmica e certificados. O React chama somente o BFF, passando pelo gateway. Eventos usam MongoDB, certificados usam Azure SQL e Azure Functions calcula indicadores e processa eventos pela fila.

## Arquitetura e tecnologias

```text
Navegador -> Gateway -> React
React -> Gateway /api -> BFF -> Eventos -> MongoDB
                            -> Certificados -> Azure SQL + Outbox
                            -> Function HTTP
Certificados Outbox -> Azure Queue -> Function Queue Trigger -> Table Ledger
```

Node.js 22, React 18, Vite 8, Express 5, MongoDB 8/Atlas, SQL Server 2022/Azure SQL, Functions v4, Queue/Table Storage, Nginx, Docker Compose, OpenAPI, AsyncAPI e GitHub Actions.

Os microserviços possuem Domain, Application, Infrastructure e API. As operações CRUD são slices próprios. Certificado e outbox são gravados na mesma transação SQL. A fila tem entrega pelo menos uma vez e o consumidor usa chave única por evento.

## Executar a arquitetura

Requisitos: Node.js 22.12 ou superior, Docker e Compose. SQL Server usa linux/amd64 e precisa de emulação compatível em máquinas ARM.

```sh
npm ci
node scripts/init-local.mjs
docker compose up -d --build
node scripts/smoke.mjs
```

Abra http://localhost:8080. Aguarde SQL e Functions Host iniciarem antes do smoke. Os segredos locais são gerados em .env e .local/, ignorados pelo Git. Somente o gateway expõe porta no host. Não há fallback de produção para memória.

## Prévia e testes

```sh
npm run check
npm test --workspaces
npm run dev
# Em outro terminal
npx playwright install chromium
npx playwright test
```

A prévia em http://127.0.0.1:5173 usa memória e um adaptador HTTP. Não comprova bancos ou fila. O pipeline PJBL validation executa o smoke com MongoDB, SQL, Azurite e Azure Functions Host reais. A integração passou no [pipeline 40413543638](https://github.com/leosmkk/conectacampus/actions/runs/40413543638). Isso não substitui a demonstração na URL cloud.

## APIs pelo gateway

| Recurso | Caminho |
| --- | --- |
| Agregação obrigatória | GET /api/aggregated-data (BFF também aceita /aggregated-data) |
| Eventos MongoDB | /api/eventos e /api/eventos/{id} |
| Certificados SQL | /api/certificados e /api/certificados/{id} |
| Eventos de domínio | GET /api/events |
| Swagger BFF | /api/docs/ |
| Swagger Mongo | /api/docs/?url=/api/specs/eventos |
| Swagger SQL e eventos | /api/docs/?url=/api/specs/certificados |

As APIs internas exigem x-service-token. O BFF aplica a credencial no servidor. A Function exige x-functions-key na nuvem. O frontend não recebe essas chaves. A demonstração é anônima e deve usar dados fictícios.

## Repositório público

Todo o código está neste repositório público, com cada componente em sua pasta:

- [Microfrontend](frontend)
- [BFF](bff)
- [Eventos MongoDB](services/eventos)
- [Certificados Azure SQL](services/certificados)
- [Azure Functions](azure-function)

## Documentação e publicação

[Entrega em PDF](docs/ConectaCampus-Entrega-3.pdf), [ARC42](docs/arc42.md), [C4](docs/c4.md), [Canvas](docs/canvas.md), [deploy](docs/deploy.md), [eventos AsyncAPI](docs/asyncapi.yaml), [roteiro do vídeo](docs/video.md) e [links/status](docs/links.json).

Implantação no Azure: frontend em https://happy-pebble-0ff30c50f.3.azurestaticapps.net/ e API Gateway (Azure API Management) em https://apim-campus-7e6589.azure-api.net/api. As imagens estão no Docker Hub em leosmkk/conectacampus-*:v1. Falta publicar o vídeo no YouTube.

As versões transitivas Azure Identity 4.13.0 e UUID 11 estão fixadas para corrigir os alertas encontrados. UUID 11 mantém a interface CommonJS utilizada. Reavalie esses pins ao atualizar mssql/tedious.

## Alunos

Anna Quezia Dos Santos

Laura Rodrigues de Souza de Camargo

Leonardo Smijtink

Otávio Augusto Fermino da Silva
