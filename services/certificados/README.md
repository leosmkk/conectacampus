# ConectaCampus certificados

API e adapters na camada externa, casos de uso na Application e regras puras no Domain. Infrastructure implementa acesso a bancos ou serviços. As features CRUD ficam em slices nomeados por operação.

## Tecnologias

Node.js 22, Express 5, Azure SQL, Azure Storage Queue e Swagger UI.

## Execução local

```sh
npm ci
npm test
npm start
```

SQL_SERVER, SQL_DATABASE, SQL_USER, SQL_PASSWORD, STORAGE_CONNECTION_STRING e SERVICE_TOKEN. PORT padrão 3002. CRUD /certificados e /events. TLS SQL ativo por padrão. A inicialização aplica o schema. A conta SQL necessita permissão DDL para essa etapa.

```sh
docker build -t conectacampus-certificados:local .
```

Para executar toda a arquitetura, use o [repositório de integração](https://github.com/leosmkk/conectacampus/tree/feat/pjbl-distributed-architecture), com Docker Compose e guia de publicação. A apresentação deve usar o gateway HTTPS publicado, com bancos e fila reais. Uma prévia local não substitui essa evidência.

## Origem e entrega

Extraído do projeto [leosmkk/conectacampus](https://github.com/leosmkk/conectacampus). O histórico é preservado por git subtree split. Repositório deste componente: https://github.com/otavioaugustosw/conectacampus-certificados.

Publicação em nuvem e Docker Hub pendentes de contas e recursos. Não há URL de produção validada.

## Alunos

Anna Quezia Dos Santos

Laura Rodrigues de Souza de Camargo

Leonardo Smijtink

Otávio Augusto Fermino da Silva
