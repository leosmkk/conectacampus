# Publicação da arquitetura

## Contas necessárias

GitHub já está disponível. Azure, MongoDB Atlas e Docker Hub precisam ser criados ou confirmados pelo grupo. Não há implantação cloud validada nesta entrega de código. Confira valores e cotas antes de criar recursos. Container Apps com uma réplica mínima e polling da outbox podem consumir recursos continuamente.

A oferta gratuita atual do Azure SQL usa limites de computação serverless e armazenamento. O requisito “Free 1 DTU” não corresponde à oferta atual. Confira a elegibilidade da assinatura em https://learn.microsoft.com/azure/azure-sql/database/free-offer. A arquitetura usa Azure SQL compatível com SQL Server.

## Preparação

1. Crie um cluster MongoDB Atlas gratuito e um usuário restrito ao banco conectacampus. Permita somente os IPs de saída do ambiente de execução.
2. Crie Azure SQL e o banco conectacampus. Restrinja firewall e configure um usuário para o serviço. Para a primeira migração, ele precisa criar as tabelas. Depois reduza as permissões para os comandos necessários ao CRUD e à outbox.
3. Crie Storage Account com Blob, Queue e Table. Ambos o serviço SQL e a Function devem usar a mesma conta. Queue campus-events é criada pelo serviço e Table CampusEvents pela Function.
4. Crie uma Azure Function App Linux, runtime Node.js 22 e Functions v4. Configure FUNCTIONS_WORKER_RUNTIME=node e AzureWebJobsStorage. Não configure CORS público para acesso direto pelo navegador.
5. Publique o conteúdo de azure-function com Azure Functions Core Tools. Execute npm ci no componente e func azure functionapp publish NOME_DA_FUNCTION. Confira no portal os triggers enrich, events e campusEvents.
6. Obtenha uma Function key de escopo de aplicação. Guarde em configuração segura e passe somente para o BFF. Não coloque a chave no frontend.

## Docker Hub

Docker Hub aceita usuário/repositório:tag. O formato com dois níveis de repositório mostrado no enunciado não se aplica ao Docker Hub.

```sh
docker login
node scripts/publish-images.mjs SEU_USUARIO v1 --push
```

O script constrói e publica frontend, bff, eventos, certificados, function e gateway. Não é necessário usar a imagem da Function se ela for publicada por Core Tools.

## Containers Azure

Crie um grupo de recursos. Gere um arquivo privado de parâmetros do Bicep, fora do Git ou sob .local/, com dockerHubUser, tag, functionUrl, functionKey, mongoUri, serviceToken, sqlServer, sqlDatabase, sqlUser, sqlPassword e storageConnection. Todos os segredos são parâmetros seguros. Use um serviceToken longo e aleatório.

```sh
az bicep build --file infra/main.bicep
az deployment group what-if --resource-group SEU_GRUPO --template-file infra/main.bicep --parameters @.local/cloud.parameters.json
az deployment group create --resource-group SEU_GRUPO --template-file infra/main.bicep --parameters @.local/cloud.parameters.json
```

O gateway recebe HTTPS público do Container Apps. BFF, microserviços e frontend têm ingress interno. Nginx encaminha /api/ ao BFF e o restante ao frontend. O gateway aplica limitação de requisições, tamanho de payload e métodos permitidos. As APIs entre serviços exigem token interno. O frontend não recebe credenciais.

Esta versão é uma demonstração pública sem login de usuário. Use dados fictícios. Autorização por usuário e segregação por instituição são evoluções pendentes para uso com dados reais.

## Verificação da entrega

```sh
node scripts/smoke.mjs https://URL_REAL_DO_GATEWAY
```

O smoke cria, consulta, altera e exclui dados de teste. Também verifica um evento publicado na outbox e processado no ledger da Function. A demonstração só está validada após esse teste passar contra a URL cloud.

Abra /api/docs/ para o BFF, /api/docs/?url=/api/specs/eventos para Mongo e /api/docs/?url=/api/specs/certificados para SQL e eventos de domínio. O contrato assíncrono está em docs/asyncapi.yaml. Capture prints com a URL pública visível e atualize docs/links.json antes de regenerar o PDF.

## Operação

Observe a outbox, logs outbox.retry_pending, campus.event.processed e a fila campus-events-poison. Mensagens inválidas vão para a poison queue após cinco tentativas. Corrija a causa antes de reenviar. A entrega é pelo menos uma vez. O ledger usa o id do evento como chave única.

Restaure backups de MongoDB e SQL conforme as políticas dos provedores. Não remova volumes locais durante a apresentação. Revogue chaves expostas e nunca coloque credenciais no README ou em imagens Docker.
