import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  NOTIFICATION_SETTINGS_STORAGE_KEY,
  type NotificationSettings,
} from '../types';

/**
 * 通知設定の Context + Provider + フック
 *
 * 【経緯】
 * 当初は hook 内に state を持つ素朴な実装だったが、
 * 「画面ごとに hook が独立 instance を持ち、子画面で更新しても
 *  親画面の state が更新されない」という問題が発生したため Context化。
 *
 * 【設計】
 * Provider が唯一のソース・オブ・トゥルース。
 * どこから useNotificationSettings() を呼んでも同じ state を購読する。
 * このため、詳細画面で updateSettings した瞬間に親画面側の表示も自動更新される。
 *
 * 【配置】
 * 全タブから参照されるため Provider はアプリの最上位（app/_layout.tsx）で
 * DatabaseProvider と同じ階層に置く。
 */

type ContextValue = {
  settings: NotificationSettings;
  loading: boolean;
  updateSettings: (next: NotificationSettings) => Promise<void>;
};

const NotificationSettingsContext = createContext<ContextValue>({
  settings: DEFAULT_NOTIFICATION_SETTINGS,
  loading: true,
  updateSettings: async () => {},
});

export function NotificationSettingsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [settings, setSettings] = useState<NotificationSettings>(
    DEFAULT_NOTIFICATION_SETTINGS
  );
  const [loading, setLoading] = useState(true);

  // 起動時に1回だけ AsyncStorage から読み込む
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_STORAGE_KEY);
        if (raw && !cancelled) {
          const parsed = JSON.parse(raw) as Partial<NotificationSettings>;
          // 既存ユーザーの後方互換のため、欠損フィールドはデフォルトで補完
          setSettings({ ...DEFAULT_NOTIFICATION_SETTINGS, ...parsed });
        }
      } catch {
        // 破損時はデフォルトのまま起動
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateSettings = useCallback(async (next: NotificationSettings) => {
    setSettings(next);
    await AsyncStorage.setItem(
      NOTIFICATION_SETTINGS_STORAGE_KEY,
      JSON.stringify(next)
    );
  }, []);

  return (
    <NotificationSettingsContext.Provider
      value={{ settings, loading, updateSettings }}
    >
      {children}
    </NotificationSettingsContext.Provider>
  );
}

export function useNotificationSettings() {
  return useContext(NotificationSettingsContext);
}
