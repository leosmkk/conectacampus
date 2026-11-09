param location string = resourceGroup().location
param dockerHubUser string
param tag string = 'v1'
param functionUrl string
@secure()
param functionKey string
@secure()
param mongoUri string
@secure()
param serviceToken string
param sqlServer string
param sqlDatabase string = 'conectacampus'
param sqlUser string
@secure()
param sqlPassword string
@secure()
param storageConnection string
@secure()
param gatewaySecret string
@description('Nome global unico do API Management (vira <nome>.azure-api.net).')
param apimName string
param apimPublisherName string = 'ConectaCampus'
@description('E-mail do publicador, obrigatorio no API Management.')
param apimPublisherEmail string
@description('Origens adicionais do navegador autorizadas no CORS do gateway.')
param allowedOrigins array = [ 'https://happy-pebble-0ff30c50f.3.azurestaticapps.net', 'http://localhost:5173' ]

resource environment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: 'conectacampus-env'
  location: location
  properties: {}
}
module events 'container-app.bicep' = {
  name: 'events'
  params: {
    name: 'eventos', location: location, environmentId: environment.id
    image: '${dockerHubUser}/conectacampus-eventos:${tag}', port: 3001
    secretBundle: { values: [{ name: 'mongo-uri', value: mongoUri }, { name: 'service-token', value: serviceToken }] }
    env: [{ name: 'MONGODB_URI', secretRef: 'mongo-uri' }, { name: 'SERVICE_TOKEN', secretRef: 'service-token' }, { name: 'PORT', value: '3001' }]
  }
}
module certificates 'container-app.bicep' = {
  name: 'certificates'
  params: {
    name: 'certificados', location: location, environmentId: environment.id
    image: '${dockerHubUser}/conectacampus-certificados:${tag}', port: 3002
    secretBundle: { values: [{ name: 'sql-password', value: sqlPassword }, { name: 'storage', value: storageConnection }, { name: 'service-token', value: serviceToken }] }
    env: [
      { name: 'SQL_SERVER', value: sqlServer }, { name: 'SQL_DATABASE', value: sqlDatabase }, { name: 'SQL_USER', value: sqlUser }
      { name: 'SQL_PASSWORD', secretRef: 'sql-password' }, { name: 'STORAGE_CONNECTION_STRING', secretRef: 'storage' }
      { name: 'SERVICE_TOKEN', secretRef: 'service-token' }, { name: 'PORT', value: '3002' }
    ]
  }
}
module bff 'container-app.bicep' = {
  name: 'bff'
  params: {
    name: 'bff', location: location, environmentId: environment.id
    image: '${dockerHubUser}/conectacampus-bff:${tag}', port: 3000, external: true
    secretBundle: { values: [{ name: 'service-token', value: serviceToken }, { name: 'function-key', value: functionKey }, { name: 'gateway-secret', value: gatewaySecret }] }
    env: [
      { name: 'EVENTS_URL', value: events.outputs.url }, { name: 'CERTIFICATES_URL', value: certificates.outputs.url }
      { name: 'FUNCTION_URL', value: functionUrl }, { name: 'FUNCTION_KEY', secretRef: 'function-key' }
      { name: 'SERVICE_TOKEN', secretRef: 'service-token' }, { name: 'GATEWAY_SECRET', secretRef: 'gateway-secret' }, { name: 'PORT', value: '3000' }
    ]
  }
}
// O frontend roda no Azure Static Web Apps; o gateway e o Azure API Management.
// Obs.: o tier Consumption nao suporta rate-limit/rate-limit-by-key; a politica faz CORS e injeta o segredo.
resource apim 'Microsoft.ApiManagement/service@2022-08-01' = {
  name: apimName
  location: location
  sku: { name: 'Consumption', capacity: 0 }
  properties: { publisherName: apimPublisherName, publisherEmail: apimPublisherEmail }
}
resource gatewaySecretValue 'Microsoft.ApiManagement/service/namedValues@2022-08-01' = {
  parent: apim
  name: 'gateway-secret'
  properties: { displayName: 'gateway-secret', value: gatewaySecret, secret: true }
}
resource api 'Microsoft.ApiManagement/service/apis@2022-08-01' = {
  parent: apim
  name: 'conectacampus-bff'
  properties: {
    displayName: 'ConectaCampus BFF'
    path: 'api'
    protocols: [ 'https' ]
    serviceUrl: '${bff.outputs.url}/api'
    subscriptionRequired: false
  }
}
resource operations 'Microsoft.ApiManagement/service/apis/operations@2022-08-01' = [for method in [ 'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS' ]: {
  parent: api
  name: toLower('any-${method}')
  properties: { displayName: '${method} /*', method: method, urlTemplate: '/*' }
}]
// O Swagger UI e servido pelo proprio gateway. Sem esta origem, o APIM encerra
// requisicoes com Origin do Swagger em 200 vazio antes de encaminha-las ao BFF.
// union tambem evita uma entrada duplicada se a origem for passada como parametro.
var swaggerOrigin = 'https://${apimName}.azure-api.net'
var corsOrigins = union(allowedOrigins, [ swaggerOrigin ])
var allowedOriginXml = join(map(corsOrigins, origin => '<origin>${origin}</origin>'), '')
resource apiPolicy 'Microsoft.ApiManagement/service/apis/policies@2022-08-01' = {
  parent: api
  name: 'policy'
  dependsOn: [ gatewaySecretValue, operations ]
  properties: {
    format: 'rawxml'
    value: '<policies><inbound><base /><cors allow-credentials="false"><allowed-origins>${allowedOriginXml}</allowed-origins><allowed-methods><method>GET</method><method>POST</method><method>PUT</method><method>DELETE</method><method>OPTIONS</method></allowed-methods><allowed-headers><header>*</header></allowed-headers></cors><set-header name="x-gateway-secret" exists-action="override"><value>{{gateway-secret}}</value></set-header></inbound><backend><base /></backend><outbound><base /></outbound><on-error><base /></on-error></policies>'
  }
}
output gatewayUrl string = apim.properties.gatewayUrl
output apiUrl string = '${apim.properties.gatewayUrl}/api'
output bffUrl string = bff.outputs.url
