# ConectaCampus microfrontend

SPA com módulos de Resumo, Agenda e Certificados. Todos usam somente o BFF pelo gateway.

## Tecnologias

React 18, Vite 8 e módulos de interface carregados por feature.

## Execução local

```sh
npm ci
npm test
npm run dev
```

VITE_API_URL=/api. O gateway encaminha /api para o BFF. Na prévia Vite o proxy usa http://127.0.0.1:3000.

```sh
docker build -t conectacampus-microfrontend:local .
```

Para executar toda a arquitetura, use o [repositório de integração](https://github.com/leosmkk/conectacampus/tree/feat/pjbl-distributed-architecture), com Docker Compose e guia de publicação. A apresentação deve usar o gateway HTTPS publicado, com bancos e fila reais. Uma prévia local não substitui essa evidência.

## Origem e entrega

Extraído do projeto [leosmkk/conectacampus](https://github.com/leosmkk/conectacampus). O histórico é preservado por git subtree split. Repositório deste componente: https://github.com/otavioaugustosw/conectacampus-microfrontend.

Publicação em nuvem e Docker Hub pendentes de contas e recursos. Não há URL de produção validada.

## Alunos

Anna Quezia Dos Santos

Laura Rodrigues de Souza de Camargo

Leonardo Smijtink

Otávio Augusto Fermino da Silva
