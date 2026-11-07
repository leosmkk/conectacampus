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
    image: '${dockerHubUser}/conectacampus-bff:${tag}', port: 3000
    secretBundle: { values: [{ name: 'service-token', value: serviceToken }, { name: 'function-key', value: functionKey }] }
    env: [
      { name: 'EVENTS_URL', value: events.outputs.url }, { name: 'CERTIFICATES_URL', value: certificates.outputs.url }
      { name: 'FUNCTION_URL', value: functionUrl }, { name: 'FUNCTION_KEY', secretRef: 'function-key' }
      { name: 'SERVICE_TOKEN', secretRef: 'service-token' }, { name: 'PORT', value: '3000' }
    ]
  }
}
module frontend 'container-app.bicep' = {
  name: 'frontend'
  params: {
    name: 'frontend', location: location, environmentId: environment.id
    image: '${dockerHubUser}/conectacampus-frontend:${tag}', port: 8080
  }
}
module gateway 'container-app.bicep' = {
  name: 'gateway'
  params: {
    name: 'gateway', location: location, environmentId: environment.id
    image: '${dockerHubUser}/conectacampus-gateway:${tag}', port: 8080, external: true
    env: [{ name: 'BFF_URL', value: bff.outputs.url }, { name: 'FRONTEND_URL', value: frontend.outputs.url }]
  }
}
output gatewayUrl string = gateway.outputs.url
