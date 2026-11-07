FROM mcr.microsoft.com/azure-functions/node:4-node22
WORKDIR /home/site/wwwroot
ENV AzureWebJobsScriptRoot=/home/site/wwwroot FUNCTIONS_WORKER_RUNTIME=node AzureFunctionsJobHost__Logging__Console__IsEnabled=true
COPY package*.json ./
RUN npm ci --omit=dev
COPY host.json ./
COPY src ./src
