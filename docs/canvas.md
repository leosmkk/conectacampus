# Architecture Canvas

| Área | Decisão |
| --- | --- |
| Problema | Centralizar agenda acadêmica e certificados de participação |
| Pessoas | Estudantes, organizadores acadêmicos e avaliadores do PJBL |
| Valor | Consultar vagas e administrar registros de eventos e certificados |
| Domínios | Eventos no MongoDB, certificados no SQL |
| Entradas | React pelo gateway, BFF HTTP e trigger de fila |
| Integrações | MongoDB Atlas, Azure SQL, Functions, Queue e Table Storage |
| Qualidade | Invariantes no domínio, dependências voltadas para dentro, transação e idempotência |
| Implantação | Imagens no Docker Hub, Azure API Management como gateway, containers no Container Apps, frontend no Static Web Apps, Function protegida por chave |
| Riscos | Cotas de nuvem, cold start, segredos, eventual consistência e mensagens na poison queue |
| Evidências | Testes locais, pipeline de integração e demonstração final em URLs públicas |
| Pendências | Evidências de nuvem (prints) e gravação do vídeo do grupo |
