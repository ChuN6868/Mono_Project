using '../main.bicep'

param appServicePlanName = 'plan-bicep-lesson-dev-hogehoge' // ←任意の名前（変更可）
param webAppNameFrontend = 'app-bicep-lesson-dev-fe-hogehoge-20260314' // ←グローバルで一意が必要
param webAppNameBackend = 'app-bicep-lesson-dev-be-hogehoge-20260314' // ←グローバルで一意が必要
param googleClientId = '914871160612-dr3ro843kenmn4iq8munc4uausn0fvuo.apps.googleusercontent.com' // ←Step1で取得した値に置き換える
// ※ googleClientSecret はセキュリティのためここに書かず、デプロイ時にコマンドラインで渡す
