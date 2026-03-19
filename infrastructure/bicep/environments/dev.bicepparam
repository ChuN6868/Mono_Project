using '../main.bicep'

param appServicePlanName = 'plan-bicep-lesson-dev-hogehoge' // ←任意の名前（変更可）
param webAppNameFrontendGoogle = 'app-bicep-lesson-dev-fe-google-20260314' // ←Google認証用FE（グローバルで一意が必要）
param webAppNameFrontendEntraId = 'app-bicep-lesson-dev-fe-entraid-20260314' // ←Entra ID認証用FE（グローバルで一意が必要）
param webAppNameBackend = 'app-bicep-lesson-dev-be-hogehoge-20260314' // ←グローバルで一意が必要
param googleClientId = '914871160612-dr3ro843kenmn4iq8munc4uausn0fvuo.apps.googleusercontent.com' // ←Step1で取得した値に置き換える
// ※ googleClientSecret はセキュリティのためここに書かず、デプロイ時にコマンドラインで渡す

param entraIdClientId = '242ccfeb-0719-49cc-8863-8ee9091b8fe4'
param entraIdTenantId = 'c1eb5b8f-ee65-465b-a28d-fbc750837850'
// ※ entraIdClientSecret もセキュリティのためここに書かず、デプロイ時にコマンドラインで渡す
