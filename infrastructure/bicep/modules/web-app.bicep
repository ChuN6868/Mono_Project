@description('リージョン')
param location string

@description('Web App 名（グローバルで一意である必要あり）')
param webAppName string

@description('App Service Plan のリソースID')
param appServicePlanId string

resource webApp 'Microsoft.Web/sites@2023-12-01' = {
  name: webAppName
  location: location
  properties: {
    serverFarmId: appServicePlanId
    httpsOnly: true
  }
}

output webAppUrl string = 'https://${webApp.properties.defaultHostName}'
