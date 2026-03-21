// ============================================================
// main.bicep - エントリーポイント（最初に実行されるファイル）
// ============================================================
// このファイルの役割:
//   - デプロイに必要なパラメータを受け取る
//   - modules/ 内の各モジュールを呼び出してリソースを作成する
//   - デプロイ結果（output）を返す
//
// デプロイコマンド:
//   az deployment group create \
//     --resource-group <RG名> \
//     --template-file main.bicep \
//     --parameters environments/dev.bicepparam
// ============================================================

// ------------------------------------------------------------
// パラメータ（param）
// ------------------------------------------------------------
// デプロイ時に外部から値を受け取る変数。
// dev.bicepparam に定義した値がここに渡される。
// 「= resourceGroup().location」はデフォルト値。
// bicepparam で指定しなければこのデフォルト値が使われる。

@description('リージョン')
param location string = resourceGroup().location
// ↑ 型は string。デフォルトはリソースグループと同じリージョン。
//   例: japaneast, eastus など

@description('App Service Plan 名')
param appServicePlanName string
// ↑ デフォルト値なし = bicepparam での指定が必須

@description('Web App 名 - フロントエンド Google認証用（グローバルで一意である必要あり）')
param webAppNameFrontendGoogle string
// ↑ Google認証用 FE Web App の名前は Azure 全体で一意でなければならない

@description('Web App 名 - フロントエンド Entra ID認証用（グローバルで一意である必要あり）')
param webAppNameFrontendEntraId string
// ↑ Entra ID認証用 FE Web App の名前は Azure 全体で一意でなければならない

@description('Web App 名 - バックエンド（グローバルで一意である必要あり）')
param webAppNameBackend string
// ↑ BE用 Web App の名前も Azure 全体で一意でなければならない

/* ========================================
   Google認証関連
   ======================================== */

@description('Google OAuth クライアントID')
param googleClientId string = ''
// ↑ Google Cloud Console で取得したクライアントID

@secure()
@description('Google OAuth クライアントシークレット')
param googleClientSecret string = ''
// ↑ Google認証のシークレットをデプロイ時にコマンドラインで渡す（コードに含めない）

/* ========================================
   Entra ID認証関連
   ======================================== */

@description('Entra ID アプリケーション（クライアント）ID')
param entraIdClientId string = ''
// ↑ Azure Portal のアプリの登録で取得したクライアントID

@secure()
@description('Entra ID クライアントシークレット')
param entraIdClientSecret string = ''
// ↑ Entra ID のシークレットをデプロイ時にコマンドラインで渡す（コードに含めない）

@description('Entra ID テナントID')
param entraIdTenantId string = ''
// ↑ Azure Portal の Microsoft Entra ID の概要画面で確認できるテナントID

// ------------------------------------------------------------
// モジュール呼び出し（module）
// ------------------------------------------------------------
// module = 別の bicep ファイルを呼び出す仕組み。
// 書式:
//   module <任意の名前> '<ファイルパス>' = {
//     name: '<デプロイ名>'    ← Azure上で表示されるデプロイ名
//     params: { ... }        ← モジュール側の param に渡す値
//   }

// App Service Plan を作成するモジュールを呼び出し
module appServicePlan 'modules/app-service-plan.bicep' = {
  name: 'appServicePlanDeployment'
  params: {
    location: location // このファイルの param をそのまま渡す
    appServicePlanName: appServicePlanName
  }
}

// FE用 Web App（Google認証）を作成するモジュールを呼び出し
module webAppFrontendGoogle 'modules/web-app.bicep' = {
  name: 'webAppFrontendGoogleDeployment'
  params: {
    location: location
    webAppName: webAppNameFrontendGoogle
    appServicePlanId: appServicePlan.outputs.appServicePlanId
    // ↑ 上の appServicePlan モジュールの output（作成結果）を参照。
    //   これにより「Web App → App Service Plan」の依存関係が自動解決され、
    //   App Service Plan が先に作成される。
    enableGoogleAuth: true // Google認証のみ有効
    googleClientId: googleClientId
    googleClientSecret: googleClientSecret
  }
}

// FE用 Web App（Entra ID認証）を作成するモジュールを呼び出し
module webAppFrontendEntraId 'modules/web-app.bicep' = {
  name: 'webAppFrontendEntraIdDeployment'
  params: {
    location: location
    webAppName: webAppNameFrontendEntraId
    appServicePlanId: appServicePlan.outputs.appServicePlanId
    enableEntraIdAuth: true // Entra ID認証のみ有効
    entraIdClientId: entraIdClientId
    entraIdClientSecret: entraIdClientSecret
    entraIdTenantId: entraIdTenantId
  }
}

// BE用 Web App を作成するモジュールを呼び出し
module webAppBackend 'modules/web-app.bicep' = {
  name: 'webAppBackendDeployment'
  params: {
    location: location
    webAppName: webAppNameBackend
    appServicePlanId: appServicePlan.outputs.appServicePlanId
    runtime: 'java' // BE は Spring Boot のため Java ランタイムを指定（デフォルトの node を上書き）
  }
}

// ------------------------------------------------------------
// 出力（output）
// ------------------------------------------------------------
// デプロイ完了後にターミナルに表示される値。
// 書式: output <名前> <型> = <値>

output webAppFrontendGoogleUrl string = webAppFrontendGoogle.outputs.webAppUrl
// ↑ デプロイ後、Google認証用 FE Web App の URL が表示される

output webAppFrontendEntraIdUrl string = webAppFrontendEntraId.outputs.webAppUrl
// ↑ デプロイ後、Entra ID認証用 FE Web App の URL が表示される

output webAppBackendUrl string = webAppBackend.outputs.webAppUrl
// ↑ デプロイ後、BE用 Web App の URL が表示される
