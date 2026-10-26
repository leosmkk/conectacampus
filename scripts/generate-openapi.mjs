// Execute da raiz: node scripts/generate-openapi.mjs
import { writeFile } from 'node:fs/promises';
const string = { type: 'string', minLength: 1, maxLength: 200 };
const schemas = {
  Evento: { type: 'object', required: ['title', 'org', 'dateLabel', 'time', 'place', 'seatsUsed', 'seatsTotal'], properties: {
    title: string, org: string, dateLabel: string, time: string, place: string,
    seatsUsed: { type: 'integer', minimum: 0 }, seatsTotal: { type: 'integer', minimum: 1 },
    order: { type: 'integer', minimum: 0 }, status: { type: 'string', enum: ['vagas', 'lotado', 'inscrito'] }
  } },
  Certificado: { type: 'object', required: ['title', 'student', 'completedAt', 'hours'], properties: {
    title: string, student: string, completedAt: { type: 'string', format: 'date' },
    hours: { type: 'integer', minimum: 1, maximum: 1000 }, status: { type: 'string', enum: ['disponivel', 'emitido'] }
  } },
  DomainEvent: { type: 'object', required: ['id', 'type', 'version', 'subject', 'occurredAt', 'data'], properties: {
    id: { type: 'string', format: 'uuid' }, type: { type: 'string', enum: ['certificate.created', 'certificate.updated', 'certificate.deleted'] },
    version: { type: 'integer', enum: [1] }, subject: { type: 'string', format: 'uuid' }, occurredAt: { type: 'string', format: 'date-time' },
    data: { type: 'object', properties: { certificateId: { type: 'string', format: 'uuid' }, hours: { type: 'integer' } } }
  } }
};
const response = (description, schema) => ({ description, ...(schema ? { content: { 'application/json': { schema } } } : {}) });
const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
function crud(resource, model) {
  const body = { required: true, content: { 'application/json': { schema: ref(model) } } };
  const errors = { 400: response('Dados inválidos'), 401: response('Não autorizado'), 404: response('Não encontrado'), 500: response('Falha interna') };
  return {
    [`/${resource}`]: {
      get: { tags: [resource], summary: 'Listar até 1000 registros', responses: { 200: response('Lista', { type: 'array', items: ref(model) }), ...errors } },
      post: { tags: [resource], summary: 'Criar', requestBody: body, responses: { 201: response('Criado', ref(model)), ...errors } }
    },
    [`/${resource}/{id}`]: {
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', ...(model === 'Certificado' ? { format: 'uuid' } : { pattern: '^[a-fA-F0-9]{24}$' }) } }],
      get: { tags: [resource], summary: 'Consultar', responses: { 200: response('Registro', ref(model)), ...errors } },
      put: { tags: [resource], summary: 'Substituir campos editáveis', requestBody: body, responses: { 200: response('Atualizado', ref(model)), ...errors } },
      delete: { tags: [resource], summary: 'Excluir', responses: { 204: response('Excluído'), ...errors } }
    }
  };
}
const eventPaths = { '/events': { get: { tags: ['Eventos de domínio'], summary: 'Consultar outbox e publicação assíncrona', responses: {
  200: response('Eventos', { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, event: ref('DomainEvent'), publishedAt: { type: 'string', nullable: true } } } })
} } } };
function spec(title, paths, internal = false) {
  return { openapi: '3.0.3', info: { title, version: '2.0.0' }, servers: [{ url: internal ? '/' : '/api' }],
    paths, components: { schemas, securitySchemes: { serviceToken: { type: 'apiKey', in: 'header', name: 'x-service-token' } } },
    security: internal ? [{ serviceToken: [] }] : [] };
}
const bff = spec('ConectaCampus BFF', {
  ...crud('eventos', 'Evento'), ...crud('certificados', 'Certificado'),
  '/aggregated-data': { get: { tags: ['Agregação'], summary: 'Consultar MongoDB, SQL e Function em um response', responses: {
    200: response('Dados agregados', { type: 'object', required: ['eventos', 'certificados', 'indicadores', 'generatedAt'], properties: {
      eventos: { type: 'array', items: ref('Evento') }, certificados: { type: 'array', items: ref('Certificado') },
      indicadores: { type: 'object', additionalProperties: { type: 'number' } }, generatedAt: { type: 'string', format: 'date-time' }
    } }), 502: response('Dependência indisponível'), 504: response('Tempo esgotado')
  } } },
  '/events': { get: { tags: ['Eventos de domínio'], summary: 'Consultar outbox e eventos processados pela Function', responses: { 200: response('Outbox e ledger', { type: 'object', properties: { outbox: { type: 'array', items: { type: 'object' } }, processed: { type: 'array', items: { type: 'object' } } } }) } } }
});
for (const [path, value] of [
  ['bff/src/api/openapi.js', bff],
  ['services/eventos/src/api/openapi.js', spec('ConectaCampus Eventos MongoDB', crud('eventos', 'Evento'), true)],
  ['services/certificados/src/api/openapi.js', spec('ConectaCampus Certificados Azure SQL', { ...crud('certificados', 'Certificado'), ...eventPaths }, true)]
]) await writeFile(path, `// Gerado por scripts/generate-openapi.mjs\nexport const specification = ${JSON.stringify(value, null, 2)};\n`);
