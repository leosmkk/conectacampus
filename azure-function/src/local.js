// Adaptador HTTP para testes locais. O host Azure executa api/triggers.js.
import http from 'node:http';
import { indicators } from './domain/indicators.js';

http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'GET' && req.url === '/api/events') { res.end('[]'); return; }
  if (req.method !== 'POST' || req.url !== '/api/enrich') { res.writeHead(404).end('{}'); return; }
  try {
    let body = '';
    for await (const chunk of req) { body += chunk; if (body.length > 32768) { res.writeHead(413).end('{}'); return; } }
    res.end(JSON.stringify(indicators(JSON.parse(body))));
  } catch (error) { res.writeHead(400).end(JSON.stringify({ message: error.message })); }
}).listen(process.env.PORT ?? 7071, '127.0.0.1');
