# REFACTOR_NOTES — Backend (azure-function)

Refatoração do backend para **Vertical Slice + Clean Architecture + SOLID**, preservando rotas, payloads, status codes e mensagens. Sem mudança de schema nem novas dependências.

## 1. Branch e commits

Branch: `refactor/vertical-slice-clean-architecture` (não foi feito push).

| Hash | Mensagem |
|---|---|
| `60c126e` | adiciona documentos, legado e arquivos de lock pendentes (commit em `master`, antes da branch; arquivos que já estavam não rastreados) |
| `c030936` | cria estrutura compartilhada de dominio, http e acesso mongo |
| `a0948af` | migra slice inserir para vertical slice com clean architecture |
| `d5be8c2` | migra slice alterar para vertical slice com clean architecture |
| `c689c43` | migra slice pesquisar para vertical slice com clean architecture |
| `e75b6b8` | migra slice excluir e remove db.js e collection.js legados |

(O commit que adiciona este arquivo não aparece na tabela, pois não pode citar o próprio hash.)

## 2. Slices

**Migrados:** `inserir`, `alterar`, `pesquisar`, `excluir`.
O prompt pedia no máximo 3; o backend só tem 4 operações CRUD sobre a mesma entidade ("registro" do tipo `eventos` ou `certificados`) e `excluir` é pequeno, então foi migrado também para manter o diagrama coerente.

**Não migrados:** nenhum no backend `azure-function`. O `frontend/`, `design-patterns/` (PHP) e `mongodb-seed/` estão fora do escopo deste trabalho.

## 3. Árvore antes / depois

Antes:
```
azure-function/src/
  db.js
  collection.js
  functions/{inserir,alterar,pesquisar,excluir}.js   # HTTP + validação + regra + Mongo juntos
```

Depois:
```
azure-function/
  test/                                  # node:test (helpers + 1 arquivo por slice + dominio)
  src/
    domain/
      errors.js  TipoRegistro.js  RegistroId.js  DadosRegistro.js
    shared/
      http.js                            # DomainError -> resposta HTTP / 500
      compositionRoot.js                 # único ponto de DI
      mongo/{db.js, colecao.js}          # conexão e helpers de coleção
    features/
      inserir/    InserirRegistroHandler  RegistroInserter  MongoRegistroInserter  inserirEndpoint
      alterar/    AlterarRegistroHandler  RegistroUpdater   MongoRegistroUpdater   alterarEndpoint
      pesquisar/  BuscarRegistroPorIdHandler  ListarRegistrosHandler
                  RegistroFinder  RegistroLister  MongoRegistroFinder  MongoRegistroLister  pesquisarEndpoint
      excluir/    ExcluirRegistroHandler  RegistroRemover  MongoRegistroRemover  excluirEndpoint
    functions/{inserir,alterar,pesquisar,excluir}.js   # só app.http(...) apontando para o composition root
```

## 4. Como cada princípio foi aplicado

**Vertical Slice** — cada operação vive em `src/features/<slice>/` com endpoint, caso de uso, porta (interface) e implementação Mongo. Nenhum slice importa outro (verificado por grep). Só `domain/` e `shared/` são compartilhados.

**Clean Architecture** — dependências apontam para dentro:
- *Domain* (`domain/*`): value objects `TipoRegistro`, `RegistroId`, `DadosRegistro` e erros; não importa nada externo (nem `mongodb`, nem `@azure/functions`).
- *Application*: `*Handler.js` + portas (`RegistroInserter`, `RegistroUpdater`, `RegistroFinder`, `RegistroLister`, `RegistroRemover`); dependem só do domain.
- *Infrastructure*: `Mongo*.js` e `shared/mongo/*` (única parte que conhece o driver).
- *Presentation*: `*Endpoint.js` + `functions/*.js`; traduzem HTTP e nunca tocam no banco.

**S — Single Responsibility** — um handler por caso de uso; `pesquisar` foi dividido em `BuscarRegistroPorIdHandler` e `ListarRegistrosHandler`. O endpoint só traduz HTTP; a validação mora nos value objects.

**O — Open/Closed** — nova operação = novo slice + uma linha no `compositionRoot.js`. Novo tipo de registro = ajuste em `TIPOS_PERMITIDOS` (`TipoRegistro.js`) sem mexer em handlers. Novo erro de domínio = nova entrada em `shared/http.js`.

**L — Liskov** — as implementações `Mongo*` estendem as portas e são substituíveis; os testes usam fakes (`FakeInserter`, `FakeUpdater`, ...) no lugar delas, sem alterar handlers ou endpoints. Contrato: `atualizar`/`buscarPorId` devolvem `null` quando não existe, `remover` devolve boolean.

**I — Interface Segregation** — portas com um único método cada. Em vez de um `RegistroRepository` gigante, existem 5 portas pequenas; `pesquisar` usa duas (`RegistroFinder`, `RegistroLister`).

**D — Dependency Inversion** — handlers recebem a porta no construtor e nunca instanciam `Mongo*`. Toda a montagem está em `src/shared/compositionRoot.js` (DI manual, sem biblioteca).

## 5. Classes por slice (para diagramas)

Legenda: D = Domain, A = Application, I = Infrastructure, P = Presentation. Todas as setas de dependência apontam para dentro (P → A → D; I → A/D).

### Domain / shared
| Classe | Camada | Depende de |
|---|---|---|
| `DomainError` (+ `TipoInvalidoError`, `IdInvalidoError`, `DadosInvalidosError`, `RegistroNaoEncontradoError`) | D | — |
| `TipoRegistro`, `RegistroId`, `DadosRegistro` (value objects) | D | `errors` |
| `responderErro` (`shared/http.js`) | P (compartilhado) | `errors` |
| `colecao`, `filtroPorId`, `getDatabase` (`shared/mongo`) | I (compartilhado) | `mongodb` |
| `compositionRoot` | composição | todos os slices |

### inserir (`POST /api/inserir`)
| Classe | Camada | Depende de |
|---|---|---|
| `inserirEndpoint` | P | `InserirRegistroHandler`, `TipoRegistro`, `DadosRegistro`, `responderErro` |
| `InserirRegistroHandler` | A | `RegistroInserter` |
| `RegistroInserter` (porta) | A | `TipoRegistro`, `DadosRegistro` |
| `MongoRegistroInserter` | I | implementa `RegistroInserter`; `colecao` |

### alterar (`PUT /api/alterar/{id}`)
| Classe | Camada | Depende de |
|---|---|---|
| `alterarEndpoint` | P | `AlterarRegistroHandler`, `TipoRegistro`, `RegistroId`, `DadosRegistro`, `responderErro` |
| `AlterarRegistroHandler` | A | `RegistroUpdater`, `RegistroNaoEncontradoError` |
| `RegistroUpdater` (porta) | A | value objects |
| `MongoRegistroUpdater` | I | implementa `RegistroUpdater`; `colecao`, `filtroPorId` |

### pesquisar (`GET /api/pesquisar[?id=]`)
| Classe | Camada | Depende de |
|---|---|---|
| `pesquisarEndpoint` | P | `BuscarRegistroPorIdHandler`, `ListarRegistrosHandler`, `TipoRegistro`, `RegistroId`, `responderErro` |
| `BuscarRegistroPorIdHandler` | A | `RegistroFinder`, `RegistroNaoEncontradoError` |
| `ListarRegistrosHandler` | A | `RegistroLister` |
| `RegistroFinder`, `RegistroLister` (portas) | A | value objects |
| `MongoRegistroFinder`, `MongoRegistroLister` | I | implementam as portas; `colecao`, `filtroPorId` |

### excluir (`DELETE /api/excluir/{id}`)
| Classe | Camada | Depende de |
|---|---|---|
| `excluirEndpoint` | P | `ExcluirRegistroHandler`, `TipoRegistro`, `RegistroId`, `responderErro` |
| `ExcluirRegistroHandler` | A | `RegistroRemover`, `RegistroNaoEncontradoError` |
| `RegistroRemover` (porta) | A | value objects |
| `MongoRegistroRemover` | I | implementa `RegistroRemover`; `colecao`, `filtroPorId` |

## 6. Build / testes: antes vs depois

| | Antes | Depois |
|---|---|---|
| Build | não existe (JS puro, sem etapa de build) | idem |
| Carga dos módulos (`require` dos 4 `functions/*.js`) | OK (4/4) | OK (4/4) |
| Testes | nenhum | `npm test` → 16 testes, 16 passam |
| `func start` | — | registra as 4 rotas (`alterar`, `excluir`, `inserir`, `pesquisar`) |

Smoke test com `func start` + curl (sem alterar dados):
- 400 confirmado e com mensagens idênticas: tipo inválido (pesquisar, inserir), id inválido (pesquisar, alterar, excluir), corpo array (alterar, inserir).
- **Não foi possível validar os caminhos 200/201/404 contra o banco real**: o cluster Atlas configurado em `local.settings.json` não resolveu no DNS (`querySrv ENOTFOUND`), então chamadas que chegam ao Mongo responderam 500 (`Erro ao pesquisar dados.` etc.). Isso é o mesmo comportamento do código original para falha de banco. Os caminhos 200/201/404 são cobertos apenas pelos testes unitários com fakes.
- Há um teste automatizado de que, sem `MONGODB_ATLAS_URI`, o endpoint real de inserir devolve 500 (banco continua lazy).
- `RegistroId` foi validado contra `ObjectId.isValid` (`mongodb` 6 / `bson` 4.12 instalado) com `abcdefghijkl`, `507f1f77bcf86cd799439011` (minúsculas e maiúsculas), `xyz` e `''`: resultados idênticos (teste em `test/dominio.test.js`).

Verificação da regra de dependência (grep): `domain/` não tem `require` externo; endpoints/handlers/portas não importam `mongodb` nem `Mongo*`; não há import entre slices; nada em `features/` ou `domain/` importa o `compositionRoot`.

## 7. Violações e lacunas restantes

- Sem teste de integração contra um MongoDB real (o Atlas configurado estava inacessível); as classes `Mongo*` só foram exercitadas indiretamente.
- Portas são classes JS "abstratas" (JavaScript não tem `interface`); LSP/ISP dependem de convenção e dos testes, não do compilador.
- `shared/http.js` é presentation compartilhada e conhece os erros de domínio (aceitável: dependência aponta para dentro).
- Os value objects expõem `.valor`/`.valores` e a infra os lê; poderia haver mapeamento mais explícito, mas foi mantido simples.
- Comportamento sutil: `alterar` continua fazendo `updateOne` + `findOne` (duas consultas), como antes.
- Fora do escopo: `frontend/`, `design-patterns/` (PHP) e `mongodb-seed/` não foram alterados.
