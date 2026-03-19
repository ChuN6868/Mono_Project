@description('リージョン')
param location string

@description('Web App 名（グローバルで一意である必要あり）')
param webAppName string

@description('App Service Plan のリソースID')
param appServicePlanId string

/* ========================================
   Google認証関連
   ======================================== */

// デフォルト値をfalseにする設定
@description('Google認証を有効にするか')
param enableGoogleAuth bool = false

@description('Google OAuth クライアントID')
param googleClientId string = ''

@secure()
@description('Google OAuth クライアントシークレット')
param googleClientSecret string = ''

/* ========================================
   Entra ID認証関連
   ======================================== */

// デフォルト値をfalseにする設定
@description('Entra ID認証を有効にするか')
param enableEntraIdAuth bool = false

@description('Entra ID アプリケーション（クライアント）ID')
param entraIdClientId string = ''

@secure()
@description('Entra ID クライアントシークレット')
param entraIdClientSecret string = ''

@description('Entra ID テナントID')
param entraIdTenantId string = ''

/* ========================================
    Web App リソース
   ======================================== */

resource webApp 'Microsoft.Web/sites@2023-12-01' = {
  name: webAppName
  location: location
  properties: {
    serverFarmId: appServicePlanId
    httpsOnly: true
  }
}

// Google認証設定（enableGoogleAuth が true の場合のみ作成）
resource authSettings 'Microsoft.Web/sites/config@2023-12-01' = if (enableGoogleAuth || enableEntraIdAuth) {
  parent: webApp
  name: 'authsettingsV2'
  properties: {
    globalValidation: {
      requireAuthentication: true
      unauthenticatedClientAction: 'RedirectToLoginPage'
      // redirectToProvider: 'google' ←複数プロバイダーの場合は、redirectToProviderは指定しない
    }
    identityProviders: {
      // Google認証（enableGoogleAuth が true の場合）
      google: enableGoogleAuth
        ? {
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
        : null
      // Entra ID認証（enableEntraIdAuth が true の場合）
      azureActiveDirectory: enableEntraIdAuth
        ? {
            enabled: true
            registration: {
              openIdIssuer: '${environment().authentication.loginEndpoint}${entraIdTenantId}/v2.0'
              clientId: entraIdClientId
              clientSecretSettingName: 'ENTRA_ID_CLIENT_SECRET'
            }
            validation: {
              allowedAudiences: [
                entraIdClientId
              ]
            }
          }
        : null
    }
    login: {
      tokenStore: {
        enabled: true
      }
    }
  }
}

/* ========================================
   Google & Entra ID認証関連
   ======================================== */

// クライアントシークレットをアプリ設定に格納
resource appSettings 'Microsoft.Web/sites/config@2023-12-01' = if (enableGoogleAuth || enableEntraIdAuth) {
  parent: webApp
  name: 'appsettings'
  properties: union(
    enableGoogleAuth ? { GOOGLE_CLIENT_SECRET: googleClientSecret } : {},
    enableEntraIdAuth ? { ENTRA_ID_CLIENT_SECRET: entraIdClientSecret } : {}
  )
}

output webAppUrl string = 'https://${webApp.properties.defaultHostName}'
