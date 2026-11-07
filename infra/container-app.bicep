param location string
param environmentId string
param name string
param image string
param port int
param external bool = false
param env array = []
@secure()
param secretBundle object = {}

resource app 'Microsoft.App/containerApps@2024-03-01' = {
  name: name
  location: location
  properties: {
    managedEnvironmentId: environmentId
    configuration: {
      activeRevisionsMode: 'Single'
      secrets: secretBundle.?values ?? []
      ingress: { external: external, targetPort: port, transport: 'http', allowInsecure: false }
    }
    template: {
      containers: [{ name: name, image: image, env: env, resources: { cpu: json('0.5'), memory: '1Gi' } }]
      scale: { minReplicas: 1, maxReplicas: 1 }
    }
  }
}
output url string = 'https://${app.properties.configuration.ingress.fqdn}'
