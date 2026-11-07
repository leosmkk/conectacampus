# ConectaCampus bff

Application agrega dados ou processa eventos. Infrastructure implementa as integrações. API registra as entradas HTTP ou triggers. Regras de indicadores ficam no Domain da Function.

## Tecnologias

Node.js 22, Express 5 e Swagger UI.

## Execução local

```sh
npm ci
npm test
npm start
```

EVENTS_URL, CERTIFICATES_URL, FUNCTION_URL, SERVICE_TOKEN e FUNCTION_KEY. PORT padrão 3000. GET /aggregated-data consulta os dois serviços e a Function. /api/docs/ apresenta o Swagger.

```sh
docker build -t conectacampus-bff:local .
```

Para executar toda a arquitetura, use o [repositório de integração](https://github.com/leosmkk/conectacampus/tree/feat/pjbl-distributed-architecture), com Docker Compose e guia de publicação. A apresentação deve usar o gateway HTTPS publicado, com bancos e fila reais. Uma prévia local não substitui essa evidência.

## Origem e entrega

Extraído do projeto [leosmkk/conectacampus](https://github.com/leosmkk/conectacampus). O histórico é preservado por git subtree split. Repositório deste componente: https://github.com/otavioaugustosw/conectacampus-bff.

Publicação em nuvem e Docker Hub pendentes de contas e recursos. Não há URL de produção validada.

## Alunos

Anna Quezia Dos Santos

Laura Rodrigues de Souza de Camargo

Leonardo Smijtink

Otávio Augusto Fermino da Silva
