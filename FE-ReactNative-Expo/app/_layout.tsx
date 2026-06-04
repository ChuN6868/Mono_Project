import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
// 副作用import：react-native-calendars を日本語化（appの最も早い時点で1回実行されればよい）
import '@/src/lib/calendarLocale';
// 副作用import：通知ハンドラの設定をアプリ起動時に登録（フォアグラウンド時の通知表示等）
import '@/src/lib/notifications';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { DatabaseProvider } from '@/src/db';
import { NotificationSettingsProvider } from '@/src/features/settings/hooks/useNotificationSettings';
import { InventoryProvider } from '@/src/features/emergency-food/contexts/InventoryContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    // ★DatabaseProviderで全体をラップする
    // children が描画される前にDB初期化（PRAGMA設定・マイグレーション・seed）が完了している保証がある
    // useEffect で migrate() を呼んでいた旧実装より、初期化漏れ・タイミング事故が起きにくい
    <DatabaseProvider>
      <NotificationSettingsProvider>
        {/* InventoryProvider をアプリ最上位に置くことで、
            設定画面の「すべてのデータをリセット」など home タブ外からも
            triggerRefresh() を呼べるようにしている */}
        <InventoryProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </InventoryProvider>
      </NotificationSettingsProvider>
    </DatabaseProvider>
  );
}
