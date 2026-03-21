@description('リージョン')
param location string

@description('Web App 名（グローバルで一意である必要あり）')
param webAppName string

@description('App Service Plan のリソースID')
param appServicePlanId string

/* ========================================
   ランタイム設定関連
   ======================================== */
// Free(F1)プランは Windows のみ対応のため、linuxFxVersion ではなく
// Windows 用のランタイム設定（appSettings / javaVersion 等）を使用する。
// runtime パラメータで 'node' または 'java' を切り替える。

@description('ランタイムの種類（node または java）')
param runtime string = 'node' // デフォルト: Node.js

@description('Node.js のバージョン（例: ~22, ~20）')
param nodeVersion string = '~22' // デフォルト: Node.js 22

@description('Java のバージョン（例: 17, 21）')
param javaVersion string = '17' // デフォルト: Java 17

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
    // ランタイムの種類に応じて siteConfig を切り替える（三項演算子）
    // 'java' → Java SE ランタイムを設定
    // 'node' → nodeVersion で Node.js バージョンを指定
    siteConfig: runtime == 'java' ? {
      javaVersion: javaVersion       // Java のバージョン（例: 17）
      javaContainer: 'JAVA'          // コンテナの種類（Java SE の場合は 'JAVA'）
      javaContainerVersion: 'SE'     // Java SE（組み込みサーバー = Spring Boot 等で使用）
      metadata: [
        {
          name: 'CURRENT_STACK'      // ポータルの「スタック設定」に表示するための設定
          value: 'java'
        }
      ]
    } : {
      nodeVersion: nodeVersion       // Node.js のバージョン（例: ~22）
      metadata: [
        {
          name: 'CURRENT_STACK'      // ポータルの「スタック設定」に表示するための設定
          value: 'node'
        }
      ]
    }
  }
}

// 認証設定（enableGoogleAuth または enableEntraIdAuth が true の場合のみ作成）
resource authSettings 'Microsoft.Web/sites/config@2023-12-01' = if (enableGoogleAuth || enableEntraIdAuth) {
  parent: webApp
  name: 'authsettingsV2'
  properties: {
    globalValidation: {
      requireAuthentication: true
      unauthenticatedClientAction: 'RedirectToLoginPage'
      // ↑ 未認証ユーザーをログインページにリダイレクトする
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
   認証用アプリ設定
   ======================================== */

// アプリ設定（環境変数）を一括で管理する
// ・認証用シークレット（認証プロバイダーが参照する）
// ・WEBSITE_NODE_DEFAULT_VERSION（Node.js の場合のみ、ランタイムバージョンを指定）
// ※ appsettings リソースは1つにまとめる必要がある（複数定義すると後勝ちで上書きされるため）
resource appSettings 'Microsoft.Web/sites/config@2023-12-01' = {
  parent: webApp
  name: 'appsettings'
  properties: union(
    // Node.js の場合、WEBSITE_NODE_DEFAULT_VERSION を設定
    runtime == 'node' ? { WEBSITE_NODE_DEFAULT_VERSION: nodeVersion } : {},
    // Google認証が有効な場合、クライアントシークレットを設定
    enableGoogleAuth ? { GOOGLE_CLIENT_SECRET: googleClientSecret } : {},
    // Entra ID認証が有効な場合、クライアントシークレットを設定
    enableEntraIdAuth ? { ENTRA_ID_CLIENT_SECRET: entraIdClientSecret } : {}
  )
}

output webAppUrl string = 'https://${webApp.properties.defaultHostName}'
