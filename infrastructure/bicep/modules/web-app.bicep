@description('リージョン')
param location string

@description('Web App 名（グローバルで一意である必要あり）')
param webAppName string

@description('App Service Plan のリソースID')
param appServicePlanId string

// デフォルト値をfalseにする設定
@description('Google認証を有効にするか')
param enableGoogleAuth bool = false

@description('Google OAuth クライアントID')
param googleClientId string = ''

@secure()
@description('Google OAuth クライアントシークレット')
param googleClientSecret string = ''

resource webApp 'Microsoft.Web/sites@2023-12-01' = {
  name: webAppName
  location: location
  properties: {
    serverFarmId: appServicePlanId
    httpsOnly: true
  }
}

// Google認証設定（enableGoogleAuth が true の場合のみ作成）
resource authSettings 'Microsoft.Web/sites/config@2023-12-01' = if (enableGoogleAuth) {
  parent: webApp
  name: 'authsettingsV2'
  properties: {
    globalValidation: {
      requireAuthentication: true
      unauthenticatedClientAction: 'RedirectToLoginPage'
      redirectToProvider: 'google'
    }
    identityProviders: {
      google: {
        enabled: true
        registration: {
          clientId: googleClientId
          clientSecretSettingName: 'GOOGLE_CLIENT_SECRET'
        }
        validation: {
          allowedAudiences: [
            googleClientId
          ]
        }
      }
    }
    login: {
      tokenStore: {
        enabled: true
      }
    }
  }
}

// Google認証用。クライアントシークレットをアプリ設定に格納
resource appSettings 'Microsoft.Web/sites/config@2023-12-01' = if (enableGoogleAuth) {
  parent: webApp
  name: 'appsettings'
  properties: {
    GOOGLE_CLIENT_SECRET: googleClientSecret
  }
}

output webAppUrl string = 'https://${webApp.properties.defaultHostName}'
