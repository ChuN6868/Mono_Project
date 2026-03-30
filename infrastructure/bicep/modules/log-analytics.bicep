/* ========================================
   main.bicep から渡される変数
    - location
    - logAnalyticsName
    - retentionInDays
    - skuName
    これらは環境ごとに .bicepparam で指定される。
   ======================================== */

@description('リージョン')
param location string
// ↑ main.bicep から渡される。値は environment で設定されたリージョン。
//   例: リソースグループ nakamura-poc が Japan East で作成されていれば japaneast が入る。

@description('Log Analytics ワークスペース名')
param logAnalyticsName string

@description('データ保持期間（日数）。30日までは無料。最大730日。')
param retentionInDays int

@description('SKU（価格プラン）。PerGB2018 = 従量課金制。')
param skuName string

/* ========================================
   Log Analytics ワークスペース リソース
   ======================================== */
// ログの保管場所。Application Insights や各種 Azure リソースの診断ログを集約する。
// SKU は PerGB2018（従量課金制）で、5GB/月まで無料。

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsName
  location: location
  properties: {
    sku: {
      name: skuName // 従量課金制（1GBあたり課金。5GB/月まで無料）
    }
    retentionInDays: retentionInDays
  }
}

/* ========================================
   出力
   ======================================== */

output logAnalyticsId string = logAnalytics.id
// ↑ Application Insights がこの ID を参照して、データの送り先として紐づける
