# Sugestão de separação de commits

A ideia é evitar um único commit grande e deixar o histórico fácil de explicar na apresentação.

## Commit 1 — Estrutura React/Vite

Arquivos:

```text
frontend/package.json
frontend/vite.config.js
frontend/index.html
frontend/src/main.jsx
frontend/src/global.css
frontend/public/staticwebapp.config.json
frontend/.env.example
```

Commit:

```bash
git add frontend/package.json frontend/vite.config.js frontend/index.html \
  frontend/src/main.jsx frontend/src/global.css \
  frontend/public/staticwebapp.config.json frontend/.env.example

git commit -m "feat: estrutura frontend com React e Vite"
```

## Commit 2 — Tela de agenda

Arquivos:

```text
frontend/src/App.jsx
frontend/src/components/Header.jsx
frontend/src/components/Feedback.jsx
frontend/src/features/eventos/AgendaPage.jsx
```

Commit:

```bash
git add frontend/src/App.jsx frontend/src/components \
  frontend/src/features/eventos

git commit -m "feat: adiciona tela de agenda de eventos"
```

## Commit 3 — Tela de certificados

Arquivos:

```text
frontend/src/features/certificados/CertificatesPage.jsx
```

Commit:

```bash
git add frontend/src/features/certificados

git commit -m "feat: adiciona tela de certificados"
```

## Commit 4 — Azure Functions

Arquivos:

```text
azure-function/package.json
azure-function/host.json
azure-function/local.settings.example.json
azure-function/src/db.js
azure-function/src/functions/eventos.js
azure-function/src/functions/certificados.js
```

Commit:

```bash
git add azure-function

git commit -m "feat: adiciona azure functions para dados acadêmicos"
```

## Commit 5 — MongoDB Atlas no frontend

Arquivos:

```text
frontend/src/services/api.js
mongodb-seed/eventos.json
mongodb-seed/certificados.json
```

Commit:

```bash
git add frontend/src/services/api.js mongodb-seed

git commit -m "feat: integra frontend com dados do mongodb atlas"
```

## Commit 6 — Documentação da entrega

Arquivos:

```text
README.md
GRUPO.md
Prompt.md
COMMITS.md
.gitignore
```

Commit:

```bash
git add README.md GRUPO.md Prompt.md COMMITS.md .gitignore

git commit -m "docs: adiciona instruções e informações da entrega"
```
