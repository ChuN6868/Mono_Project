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

@description('Web App 名 - フロントエンド（グローバルで一意である必要あり）')
param webAppNameFrontend string
// ↑ FE用 Web App の名前は Azure 全体で一意でなければならない
//   （URL: https://<webAppNameFrontend>.azurewebsites.net になるため）

@description('Web App 名 - バックエンド（グローバルで一意である必要あり）')
param webAppNameBackend string
// ↑ BE用 Web App の名前も Azure 全体で一意でなければならない

@description('Google OAuth クライアントID')
param googleClientId string = ''
// ↑ Google Cloud Console で取得したクライアントID

@secure()
@description('Google OAuth クライアントシークレット')
param googleClientSecret string = ''
// ↑ Google認証のシークレットをデプロイ時にコマンドラインで渡す（コードに含めない）

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

// FE用 Web App を作成するモジュールを呼び出し（Google認証付き）
module webAppFrontend 'modules/web-app.bicep' = {
  name: 'webAppFrontendDeployment'
  params: {
    location: location
    webAppName: webAppNameFrontend
    appServicePlanId: appServicePlan.outputs.appServicePlanId
    // ↑ 上の appServicePlan モジュールの output（作成結果）を参照。
    //   これにより「Web App → App Service Plan」の依存関係が自動解決され、
    //   App Service Plan が先に作成される。
    enableGoogleAuth: true // Google認証を有効にする
    googleClientId: googleClientId // Google認証パラメータから渡す（誰のアプリか、を識別するだけなので設定ファイルに書き込んでよい）
    googleClientSecret: googleClientSecret // Google認証パラメータから渡す（secure() でマスクされる。暗証番号のようなものなので設定ファイルに書き込まない）
  }
}

// BE用 Web App を作成するモジュールを呼び出し
module webAppBackend 'modules/web-app.bicep' = {
  name: 'webAppBackendDeployment'
  params: {
    location: location
    webAppName: webAppNameBackend
    appServicePlanId: appServicePlan.outputs.appServicePlanId
  }
}

// ------------------------------------------------------------
// 出力（output）
// ------------------------------------------------------------
// デプロイ完了後にターミナルに表示される値。
// 書式: output <名前> <型> = <値>

output webAppFrontendUrl string = webAppFrontend.outputs.webAppUrl
// ↑ デプロイ後、FE用 Web App の URL が表示される

output webAppBackendUrl string = webAppBackend.outputs.webAppUrl
// ↑ デプロイ後、BE用 Web App の URL が表示される
