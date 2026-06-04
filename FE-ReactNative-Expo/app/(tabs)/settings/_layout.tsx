import { Stack } from 'expo-router';

/**
 * 設定タブの Stack ナビゲータ
 *
 * 【画面構成】
 *  - index            : 設定トップ（ヘッダー無し、自前のタイトル表示）
 *  - notifications    : 期限通知の詳細設定（戻るボタン付きヘッダー）
 *
 * 設定項目が増えたら Stack.Screen を1行追加して、index.tsx の onPress で
 * router.push('/settings/xxx') するだけで拡張可能。
 */
export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="notifications"
        options={{
          title: '期限通知',
          headerBackTitle: '設定',
        }}
      />
    </Stack>
  );
}
