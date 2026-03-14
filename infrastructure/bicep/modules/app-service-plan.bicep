@description('リージョン')
param location string

@description('App Service Plan 名')
param appServicePlanName string

resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: 'F1'
    tier: 'Free'
  }
}

output appServicePlanId string = appServicePlan.id
