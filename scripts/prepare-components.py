"""python3 scripts/prepare-components.py. Prepara READMEs e testes independentes."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GROUP = (ROOT / 'GRUPO.md').read_text().strip()
COMPONENTS = [
    ('frontend', 'microfrontend', 'React 18, Vite 8 e módulos de interface carregados por feature', 'npm run dev', 'VITE_API_URL=/api. O gateway encaminha /api para o BFF. Na prévia Vite o proxy usa http://127.0.0.1:3000.'),
    ('bff', 'bff', 'Node.js 22, Express 5 e Swagger UI', 'npm start', 'EVENTS_URL, CERTIFICATES_URL, FUNCTION_URL, SERVICE_TOKEN e FUNCTION_KEY. PORT padrão 3000. GET /aggregated-data consulta os dois serviços e a Function. /api/docs/ apresenta o Swagger.'),
    ('services/eventos', 'eventos', 'Node.js 22, Express 5, MongoDB Atlas e Swagger UI', 'npm start', 'MONGODB_URI, MONGODB_DATABASE e SERVICE_TOKEN. PORT padrão 3001. CRUD /eventos e /docs protegido por x-service-token.'),
    ('services/certificados', 'certificados', 'Node.js 22, Express 5, Azure SQL, Azure Storage Queue e Swagger UI', 'npm start', 'SQL_SERVER, SQL_DATABASE, SQL_USER, SQL_PASSWORD, STORAGE_CONNECTION_STRING e SERVICE_TOKEN. PORT padrão 3002. CRUD /certificados e /events. TLS SQL ativo por padrão. A inicialização aplica o schema. A conta SQL necessita permissão DDL para essa etapa.'),
    ('azure-function', 'functions', 'Azure Functions v4, Node.js 22, Queue Storage e Table Storage', 'npm start', 'AzureWebJobsStorage e FUNCTIONS_WORKER_RUNTIME=node em local.settings.json (copie local.settings.example.json). Instale Azure Functions Core Tools v4. HTTP POST /api/enrich e GET /api/events requerem Function key na nuvem. O trigger campusEvents consome campus-events.')
]
ARCHITECTURE = '''import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
async function files(root) {
  return (await Promise.all((await readdir(root, { withFileTypes: true })).map((entry) => entry.isDirectory() ? files(path.join(root, entry.name)) : [path.join(root, entry.name)]))).flat();
}
test('fronteiras de camadas e repositório', async () => {
  for (const file of (await files('src')).filter((name) => /\\.(js|jsx)$/.test(name))) {
    const source = await readFile(file, 'utf8');
    const imports = [...source.matchAll(/(?:from\\s+|import\\s*\\()(['"])([^'"]+)\\1/g)].map((match) => match[2]);
    if (file.includes('/domain/')) assert.deepEqual(imports, [], file);
    if (file.includes('/application/')) assert.ok(imports.every((name) => name.startsWith('.') && !/infrastructure|\\/api\\//.test(name)), file);
    for (const name of imports.filter((value) => value.startsWith('.'))) assert.ok(path.resolve(path.dirname(file), name).startsWith(path.resolve('src') + path.sep), file);
  }
});
'''
UNIT_TESTS = {
    'frontend': '''import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('frontend usa entrada do BFF e não credenciais de infraestrutura', async () => {
  const source = await readFile('src/services/api.js', 'utf8');
  assert.ok(source.includes("'/api'"));
  assert.ok(!/mongodb|mssql|x-service-token|FUNCTION_KEY|azurewebsites/.test(source));
});
''',
    'bff': '''import test from 'node:test';
import assert from 'node:assert/strict';
import { aggregate } from '../src/application/aggregate.js';
test('agrega serviços e envia contagens para a Function', async () => {
  const result = await aggregate({ events: async () => [{ seatsUsed: 2, seatsTotal: 10 }], certificates: async () => [{ hours: 4 }], enrich: async (body) => body });
  assert.equal(result.indicadores.seatsTotal, 10);
  assert.equal(result.indicadores.totalHours, 4);
});
test('rejeita agregado se dependência falhar', async () => {
  await assert.rejects(aggregate({ events: async () => { throw new Error('offline'); }, certificates: async () => [] }), /offline/);
});
''',
    'services/eventos': '''import test from 'node:test';
import assert from 'node:assert/strict';
import { evento } from '../src/domain/evento.js';
test('capacidade é uma invariante e lotação é derivada', () => {
  const body = { title: 'Evento', org: 'Campus', place: 'Sala', dateLabel: '26 de outubro', time: '19:00', seatsUsed: 10, seatsTotal: 10 };
  assert.equal(evento(body).status, 'lotado');
  assert.throws(() => evento({ ...body, seatsUsed: 11 }));
});
''',
    'services/certificados': '''import test from 'node:test';
import assert from 'node:assert/strict';
import { certificado } from '../src/domain/certificado.js';
import { publishEvents } from '../src/application/publish-events.js';
test('rejeita certificado com carga ou data inválida', () => {
  const body = { title: 'Evento', student: 'Participante', hours: 4, completedAt: '2026-10-26' };
  assert.equal(certificado(body).hours, 4);
  assert.throws(() => certificado({ ...body, hours: 0 }));
  assert.throws(() => certificado({ ...body, completedAt: '2026-02-30' }));
});
test('outbox mantém evento pendente se fila falhar', async () => {
  let marked = false;
  await assert.rejects(publishEvents({ pending: async () => [{ id: '1', payload: '{}' }], published: async () => { marked = true; } }, { sendMessage: async () => { throw new Error('offline'); } }), /offline/);
  assert.equal(marked, false);
});
''',
    'azure-function': '''import test from 'node:test';
import assert from 'node:assert/strict';
import { indicators } from '../src/domain/indicators.js';
import { processEvent } from '../src/application/process-event.js';
test('indicadores não dividem por zero', () => {
  assert.equal(indicators({ eventCount: 0, certificateCount: 0, seatsUsed: 0, seatsTotal: 0, totalHours: 0 }).occupancyPercent, 0);
});
test('trigger rejeita mensagem incompatível', async () => { await assert.rejects(processEvent({ version: 2 }, {})); });
'''
}
for directory, slug, tech, command, config in COMPONENTS:
    project = ROOT / directory
    package = json.loads((project / 'package.json').read_text())
    package['scripts']['test'] = 'node --test tests/*.test.js'
    (project / 'package.json').write_text(json.dumps(package, indent=2) + '\n')
    (project / 'tests').mkdir(exist_ok=True)
    (project / 'tests/architecture.test.js').write_text(ARCHITECTURE)
    (project / 'tests/domain.test.js').write_text(UNIT_TESTS[directory])
    (project / '.gitignore').write_text('node_modules/\ndist/\n.env\n.env.local\nlocal.settings.json\n*.log\ncoverage/\n')
    architecture = ('SPA com módulos de Resumo, Agenda e Certificados. Todos usam somente o BFF pelo gateway.' if directory == 'frontend' else
        'API e adapters na camada externa, casos de uso na Application e regras puras no Domain. Infrastructure implementa acesso a bancos ou serviços. As features CRUD ficam em slices nomeados por operação.' if directory.startswith('services/') else
        'Application agrega dados ou processa eventos. Infrastructure implementa as integrações. API registra as entradas HTTP ou triggers. Regras de indicadores ficam no Domain da Function.')
    (project / 'README.md').write_text(f'''# ConectaCampus {slug}

{architecture}

## Tecnologias

{tech}.

## Execução local

```sh
npm ci
npm test
{command}
```

{config}

```sh
docker build -t conectacampus-{slug}:local .
```

Para executar toda a arquitetura, use o [repositório de integração](https://github.com/leosmkk/conectacampus/tree/feat/pjbl-distributed-architecture), com Docker Compose e guia de publicação. A apresentação deve usar o gateway HTTPS publicado, com bancos e fila reais. Uma prévia local não substitui essa evidência.

## Origem e entrega

Extraído do projeto [leosmkk/conectacampus](https://github.com/leosmkk/conectacampus). O histórico é preservado por git subtree split. Repositório deste componente: https://github.com/otavioaugustosw/conectacampus-{slug}.

Publicação em nuvem e Docker Hub pendentes de contas e recursos. Não há URL de produção validada.

## Alunos

{GROUP}
''')
print('Cinco componentes preparados com README e testes independentes.')
