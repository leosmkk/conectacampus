# Design Patterns — ConectaCampus

Trabalho da equipe: aplicação de padrões de projeto focados em **reúso
de software**, sobre o domínio do ConectaCampus (LPS de gestão de
eventos acadêmicos). **Opção 01** do enunciado.

Requisitos atendidos:

- Ao menos 10 classes principais de domínio, com atributos e métodos — **12 classes** em `src/Domain/`.
- **Singleton** — 2 exemplos.
- **Template Method** — 3 exemplos.
- **Strategy** — 3 exemplos (padrão adicional escolhido pela equipe).

Só a codificação é entregue, sem modelagem/UML, conforme pedido no enunciado.

## Como rodar

Não depende de Composer, banco de dados nem extensões além do PDO
(que já vem com o PHP). Basta:

```bash
php design-patterns/Demo.php
```

Para ver a variabilidade da linha de produto escolhendo outro
algoritmo e outro template em tempo de execução, sem tocar em código:

```bash
CHECKIN_METHOD=nfc CERTIFICADO_TEMPLATE=empresa php design-patterns/Demo.php
```

Variáveis aceitas: `CHECKIN_METHOD` (`qrcode` | `manual` | `nfc`),
`CERTIFICADO_TEMPLATE` (`universidade` | `empresa` | `associacao`),
`TENANT` (livre, só informativo). Todas têm default.

## Domínio (`src/Domain/`)

Modelado a partir do protótipo do próprio projeto (`legacy/ConectaCampus.dc.html`
e `Prompt.md`): 3 tenants whitelabel, 5 módulos/feature flags, 4 perfis
de usuário. Os padrões operam sobre estes objetos — não sobre arrays
soltos.

| Classe | Papel |
|---|---|
| `Tenant` | cliente da LPS; liga/desliga módulos |
| `Modulo` | feature flag (geo, qrcode, advReports, dualSignature, customField) |
| `Usuario` *(abstract)* | base dos perfis |
| `Aluno` | se inscreve em eventos, recebe certificado |
| `CentroAcademico` | organiza eventos |
| `Palestrante` | conduz eventos |
| `Evento` | regra de vagas e inscrições |
| `Inscricao` | vínculo aluno↔evento; token de check-in; presença |
| `Presenca` | registro de comparecimento |
| `Cracha` | crachá NFC vinculado a um aluno |
| `Certificado` | só existe se a inscrição já tem presença |
| `ResultadoCheckIn` | value object devolvido pelas estratégias de check-in |

## Padrões

### Singleton (`src/Patterns/Singleton/`) — 2 exemplos

| Classe | Por que é único |
|---|---|
| `VariabilityConfig` | ponto único de leitura da variabilidade da LPS (método de check-in, template de certificado, tenant ativo) — todas as partes do sistema devem ver a mesma configuração |
| `ConnectionFactory` | uma única conexão PDO por processo; conecta de forma **lazy** (só na primeira chamada a `getConnection()`), para não derrubar a aplicação num ambiente sem o driver do banco configurado |

### Template Method (`src/Patterns/TemplateMethod/`) — 3 exemplos

`GeradorCertificado` define o esqueleto fixo (`gerar()`, `final`):
cabeçalho → corpo → assinatura → rodapé. As três subclasses variam
apenas o que é específico de cada tenant:

- `GeradorUniversidade`
- `GeradorEmpresa` (única que sobrescreve o hook `montarRodape()`)
- `GeradorAssociacao`

### Strategy (`src/Patterns/Strategy/`) — 3 exemplos

`CheckInMethod` é o contrato; cada implementação é um algoritmo de
confirmação de presença (RF23-RF26):

- `QrCodeCheckIn`
- `ManualCheckIn`
- `NfcCheckIn`

`CheckInContext` é o Contexto do padrão — mantém a estratégia atual e
permite trocá-la em runtime (`setMetodo()`), o que o `Demo.php` faz
explicitamente no Bloco 3.

`CheckInMethodFactory` **não é um quarto padrão**: é só a cola que lê
`VariabilityConfig::getCheckInMethod()` (Singleton) e resolve a
estratégia correspondente (Strategy) — é o que fecha o ciclo da LPS no
Bloco 4 do Demo.

## `Demo.php`

Um único script, cinco blocos, na ordem: domínio → Singleton →
Template Method → Strategy (com sucesso e falha em cada uma das 3
estratégias) → integração via `VariabilityConfig`.
