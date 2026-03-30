/* ========================================
   main.bicep から渡される変数
    - location
    - appInsightsName
    - logAnalyticsId
    logAnalyticsId 以外は環境ごとに .bicepparam で指定される。
   ======================================== */

@description('リージョン')
param location string

@description('Application Insights 名')
param appInsightsName string

@description('Log Analytics ワークスペースのリソースID')
param logAnalyticsId string
// ↑ Application Insights のデータ送り先。Log Analytics モジュールの output から渡される。

/* ========================================
   Application Insights リソース
   ======================================== */
// Web App からデータを自動収集し、分析・可視化する。
// データの保管先は Log Analytics ワークスペース。
// Application Insights 自体に追加料金はなく、課金は Log Analytics のデータ取り込み量に依存する。

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web' // Web アプリ向けの Application Insights
  properties: {
    Application_Type: 'web' // アプリケーションの種類（web / other）
    WorkspaceResourceId: logAnalyticsId
    // ↑ データの送り先となる Log Analytics ワークスペースのリソースID
  }
}

/* ========================================
   出力
   ======================================== */

output connectionString string = appInsights.properties.ConnectionString
// ↑ Web App の環境変数に設定する接続文字列。各 Web App の appsettings に渡される。
