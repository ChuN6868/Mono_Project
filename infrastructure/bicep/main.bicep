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

@description('Web App 名（グローバルで一意である必要あり）')
param webAppName string
// ↑ Web App の名前は Azure 全体で一意でなければならない
//   （URL: https://<webAppName>.azurewebsites.net になるため）

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

// Web App を作成するモジュールを呼び出し
module webApp 'modules/web-app.bicep' = {
  name: 'webAppDeployment'
  params: {
    location: location
    webAppName: webAppName
    appServicePlanId: appServicePlan.outputs.appServicePlanId
    // ↑ 上の appServicePlan モジュールの output（作成結果）を参照。
    //   これにより「Web App → App Service Plan」の依存関係が自動解決され、
    //   App Service Plan が先に作成される。
  }
}

// ------------------------------------------------------------
// 出力（output）
// ------------------------------------------------------------
// デプロイ完了後にターミナルに表示される値。
// 書式: output <名前> <型> = <値>

output webAppUrl string = webApp.outputs.webAppUrl
// ↑ デプロイ後、作成された Web App の URL が表示される
//   例: https://app-bicep-lesson-dev.azurewebsites.net
