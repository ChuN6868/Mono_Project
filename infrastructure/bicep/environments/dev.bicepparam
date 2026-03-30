using '../main.bicep'

/* ========================================
    共通パラメーター
   ======================================== */

// 選択肢: 'japaneast'（東日本） / 'japanwest'（西日本） / 'eastus'（米国東部） 等
param location = 'japaneast'

/* ========================================
    AppService、WebAppsのパラメーター
   ======================================== */

// App Service Plan 名（リソースグループ内で一意）
param appServicePlanName = 'plan-bicep-lesson-dev-hogehoge'

// Web App 名 - Google認証用FE（Azure全体で一意。URLの一部になる）
param webAppNameFrontendGoogle = 'app-bicep-lesson-dev-fe-google-20260314'

// Web App 名 - Entra ID認証用FE（Azure全体で一意。URLの一部になる）
param webAppNameFrontendEntraId = 'app-bicep-lesson-dev-fe-entraid-20260314'

// Web App 名 - バックエンド（Azure全体で一意。URLの一部になる）
param webAppNameBackend = 'app-bicep-lesson-dev-be-hogehoge-20260314'

param googleClientId = '914871160612-dr3ro843kenmn4iq8munc4uausn0fvuo.apps.googleusercontent.com' // ←Step1で取得した値に置き換える
// ※ googleClientSecret はセキュリティのためここに書かず、デプロイ時にコマンドラインで渡す

param entraIdClientId = '242ccfeb-0719-49cc-8863-8ee9091b8fe4'
param entraIdTenantId = 'c1eb5b8f-ee65-465b-a28d-fbc750837850'
// ※ entraIdClientSecret もセキュリティのためここに書かず、デプロイ時にコマンドラインで渡す

/* ========================================
    Log Analytics ワークスペースのパラメーター
   ======================================== */

// Log Analytics ワークスペース名（リソースグループ内で一意）
param logAnalyticsName = 'logAna-bicep-dev'

// 選択肢: 30〜730（日数）。30日までは無料。31日以降は $0.10/GB/月。
param logAnalyticsRetentionInDays = 30

// 選択肢: 'PerGB2018'（従量課金制。5GB/月まで無料） / 'CapacityReservation'（日100GB以上の大規模向け予約割引）
param logAnalyticsSkuName = 'PerGB2018'

/* ========================================
    Application Insights のパラメーター
   ======================================== */

// Application Insights 名（リソースグループ内で一意）
param appInsightsName = 'applicationInsights-bicep-dev'
