# ConectaCampus functions

Application agrega dados ou processa eventos. Infrastructure implementa as integrações. API registra as entradas HTTP ou triggers. Regras de indicadores ficam no Domain da Function.

## Tecnologias

Azure Functions v4, Node.js 22, Queue Storage e Table Storage.

## Execução local

```sh
npm ci
npm test
npm start
```

AzureWebJobsStorage e FUNCTIONS_WORKER_RUNTIME=node em local.settings.json (copie local.settings.example.json). Instale Azure Functions Core Tools v4. HTTP POST /api/enrich e GET /api/events requerem Function key na nuvem. O trigger campusEvents consome campus-events.

```sh
docker build -t conectacampus-functions:local .
```

Para executar toda a arquitetura, use o [repositório de integração](https://github.com/leosmkk/conectacampus/tree/feat/pjbl-distributed-architecture), com Docker Compose e guia de publicação. A apresentação deve usar o gateway HTTPS publicado, com bancos e fila reais. Uma prévia local não substitui essa evidência.

## Origem e entrega

Extraído do projeto [leosmkk/conectacampus](https://github.com/leosmkk/conectacampus). O histórico é preservado por git subtree split. Repositório deste componente: https://github.com/otavioaugustosw/conectacampus-functions.

Publicação em nuvem e Docker Hub pendentes de contas e recursos. Não há URL de produção validada.

## Alunos

Anna Quezia Dos Santos

Laura Rodrigues de Souza de Camargo

Leonardo Smijtink

Otávio Augusto Fermino da Silva
