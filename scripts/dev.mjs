// Prévia com repositórios em memória, sem provar integração com bancos e fila.
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { createApp as eventsApp } from '../services/eventos/src/api/app.js';
import { createApp as certificatesApp } from '../services/certificados/src/api/app.js';
import { createApp as bffApp } from '../bff/src/api/app.js';
import { createClients } from '../bff/src/infrastructure/clients.js';
import { memoryRepository } from './lib/memory-repositories.mjs';
const events = JSON.parse(await readFile(new URL('../mongodb-seed/eventos.json', import.meta.url)));
const repository = memoryRepository('eventos');
for (const event of events) await repository.create(event);
const certificates = memoryRepository('certificados');
await certificates.create({ title: 'Semana de Tecnologia 2026', student: 'Participante de demonstração', hours: 12, completedAt: '2026-09-14', status: 'disponivel' });
const servers = [eventsApp(repository, 'test-token').listen(3001, '127.0.0.1'), certificatesApp(certificates, 'test-token').listen(3002, '127.0.0.1')];
const functionProcess = spawn(process.execPath, ['azure-function/src/local.js'], { stdio: 'inherit' });
servers.push(bffApp(createClients({ events: 'http://127.0.0.1:3001', certificates: 'http://127.0.0.1:3002', function: 'http://127.0.0.1:7071', token: 'test-token' })).listen(3000, '127.0.0.1'));
const frontend = spawn('npm', ['run', 'dev', '--workspace', 'frontend', '--', '--host', '127.0.0.1'], { stdio: 'inherit' });
console.log('Prévia em memória. Não valida MongoDB, SQL, Azure Functions Host ou mensageria.');
function stop() { functionProcess.kill(); frontend.kill(); for (const server of servers) server.close(); }
process.on('SIGINT', stop); process.on('SIGTERM', stop);
