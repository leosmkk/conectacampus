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
| Implantação | Imagens independentes, gateway público, containers internos, Function protegida por chave |
| Riscos | Cotas de nuvem, cold start, segredos, eventual consistência e mensagens na poison queue |
| Evidências | Testes locais, pipeline de integração e demonstração final em URLs públicas |
| Pendências | Contas de nuvem, Docker Hub, validação de integração no pipeline e gravação do grupo |
