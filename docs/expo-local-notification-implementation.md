# Expo ローカル通知 実装ガイド

Expo React Native プロジェクトで「サーバー不要のローカル通知」をゼロから実装するための包括的ガイド。実装パターン・落とし穴・設計判断の根拠まで含めて記載。

別プロジェクトでも同じ手順で再現できることを目的とする。

---

## 目次

1. [このガイドのスコープ](#1-このガイドのスコープ)
2. [ローカル通知 vs リモート通知](#2-ローカル通知-vs-リモート通知)
3. [前提環境](#3-前提環境)
4. [完成形のアーキテクチャ](#4-完成形のアーキテクチャ)
5. [Step 1：パッケージのインストール](#step-1パッケージのインストール)
6. [Step 2：通知ライブラリ層の作成](#step-2通知ライブラリ層の作成)
7. [Step 3：アプリ起動時の通知ハンドラ登録](#step-3アプリ起動時の通知ハンドラ登録)
8. [Step 4：通知設定の永続化（Context化）](#step-4通知設定の永続化context化)
9. [Step 5：設定画面UI](#step-5設定画面ui)
10. [Step 6：CRUDオペレーションとの連動](#step-6crudオペレーションとの連動)
11. [Step 7：テスト通知ボタンの追加](#step-7テスト通知ボタンの追加)
12. [Step 8：動作確認](#step-8動作確認)
13. [制約と注意点](#13-制約と注意点)
14. [トラブルシューティング](#14-トラブルシューティング)
15. [失敗から学んだ重要パターン](#15-失敗から学んだ重要パターン)
16. [今後の拡張](#16-今後の拡張)

---

## 1. このガイドのスコープ

**対象**
- 端末側で完結する「ローカル通知（Local Notification）」
- ユーザーが操作した結果として、未来の特定時刻に通知を予約する用途
- 例：「賞味期限の◯日前の◯時にお知らせ」「次回受診日の前日に通知」など

**対象外**
- リモートプッシュ通知（APNs / FCM 経由）
- サーバー必須の通知配信
- バックグラウンドタスクからの動的通知計算

ローカル通知でできること：
- アプリ起動時 / 編集時に「N月N日X時にこのメッセージを出して」とOSに予約
- アプリを閉じても・端末を再起動してもOSが時刻になったら発火
- ネットワーク・サーバー一切不要

---

## 2. ローカル通知 vs リモート通知

| 項目 | ローカル通知 | リモート通知（Push） |
|---|---|---|
| 仕組み | アプリがOS通知キューに予約 | サーバー → APNs/FCM → 端末 |
| サーバー | **不要** | **必須**（自前 or Azure Functions等） |
| Apple Developer Program | 不要（開発時） | 必須 |
| 通知の動的決定 | 不可（予約時に内容固定） | 可能 |
| Expo Goでの動作 | **動作する** | 不可（SDK 53+） |
| 最大件数（iOS） | 64件 | 無制限 |
| ユースケース | 期限通知・リマインダー・アラーム | お知らせ配信・速報 |

「特定の時刻に発火させたい」だけならローカル通知で十分。サーバー側からアプリにメッセージを送るのが目的ならリモート通知が必要。

---

## 3. 前提環境

| 項目 | バージョン例 |
|---|---|
| Expo SDK | 54+ |
| React | 19+ |
| TypeScript | 5+ |
| Node.js | 20+ |
| プロジェクト構造 | `app/` ベース（expo-router 6） |

このガイドのコード例はすべて TypeScript + expo-router で書かれている。ファイルベースルーティングを前提。

---

## 4. 完成形のアーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│ app/_layout.tsx                                              │
│ ├── 副作用import: '@/src/lib/notifications'                 │
│ │   → setNotificationHandler を起動時に登録                  │
│ └── <NotificationSettingsProvider> でアプリ全体を包む        │
└─────────────────────────────────────────────────────────────┘
        ↓
┌──────────────────────────────┐  ┌──────────────────────────────┐
│ src/lib/notifications.ts     │  │ src/features/settings/        │
│ (副作用 + 純粋関数群)         │  │   types.ts                    │
│                              │  │   hooks/                      │
│ - setNotificationHandler     │  │     useNotificationSettings   │
│ - requestPermissionAsync     │  │   (Context + Provider + hook)  │
│ - scheduleXxxNotification    │  └──────────────────────────────┘
│ - cancelXxxNotification      │              ↑
│ - rescheduleAll              │              │
│ - sendTestNotification       │              │
└──────────────────────────────┘              │
        ↑                                      │
        │                                      │
┌──────────────────────────────────────────────────────────────┐
│ 設定画面 UI（app/(tabs)/settings/notifications.tsx）          │
│ - マスタースイッチ                                            │
│ - 日数選択（ラジオ）                                          │
│ - 時刻ピッカー（DateTimePicker）                              │
│ - テスト通知ボタン                                            │
└──────────────────────────────────────────────────────────────┘
        ↑
┌──────────────────────────────────────────────────────────────┐
│ データCRUD（編集モーダル等）                                  │
│ - 作成/更新時：scheduleXxxNotification(item, settings)        │
│ - 削除時：    cancelXxxNotification(itemId)                   │
└──────────────────────────────────────────────────────────────┘
```

設計の3つの分離：
1. **`src/lib/notifications.ts`** — 純粋関数（DB依存なし、設定値を引数で受ける）
2. **設定の永続化レイヤー** — AsyncStorage + Context、UIに横断展開
3. **UI / CRUD統合** — 上記2つを組み合わせる

---

## Step 1：パッケージのインストール

```bash
npx expo install expo-notifications @react-native-async-storage/async-storage @react-native-community/datetimepicker
```

| パッケージ | 役割 |
|---|---|
| `expo-notifications` | 通知のスケジュール・キャンセル・権限取得 |
| `@react-native-async-storage/async-storage` | 通知設定をローカル永続化（オン/オフ等） |
| `@react-native-community/datetimepicker` | 「通知時刻」を選ぶネイティブピッカー |

`expo install` を使うことで現在の Expo SDK と互換のあるバージョンが自動選定される。

---

## Step 2：通知ライブラリ層の作成

通知操作を全て純粋関数として `src/lib/notifications.ts` に集約。DB やUI の知識を持たせず、設定値とアイテム情報を引数で受ける。

### ファイル: `src/lib/notifications.ts`

```ts
import * as Notifications from 'expo-notifications';
import type { NotificationSettings } from '@/src/features/settings/types';

/**
 * 通知ハンドラ：フォアグラウンド状態の時にも通知バナーを出す設定
 * 副作用：このファイルが import された瞬間に1回だけ走る
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/**
 * 通知許可をリクエスト
 *  - 既に許可済み → 即 true
 *  - 未確定       → OS のダイアログを表示
 *  - 拒否済み     → ダイアログを出さず即 false
 */
export async function requestNotificationPermissionAsync(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;

  const requested = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: false, allowSound: true },
  });
  return requested.granted;
}

/** 通知対象のアイテム（このプロジェクトでは「非常食」だが、何でもよい） */
type NotifiableItem = {
  id: number;
  name: string;
  expirationDate: string; // 'YYYY-MM-DD'
};

/** 識別子はアイテムID単位で1スケジュールに固定。DBに通知IDカラムを増やさずに済む */
function notificationIdFor(itemId: number): string {
  return `expiration-${itemId}`;
}

/**
 * 1件分の期限通知を予約
 *  - 既存予約は自動キャンセル（同じ識別子で上書き）
 *  - 通知OFF or 過去時刻 → スケジュールしない
 */
export async function scheduleExpirationNotification(
  item: NotifiableItem,
  settings: NotificationSettings
): Promise<void> {
  await cancelExpirationNotification(item.id);
  if (!settings.enabled) return;

  // 'YYYY-MM-DD' を端末ローカル時間で解釈
  const [y, m, d] = item.expirationDate.split('-').map(Number);
  const trigger = new Date(y, m - 1, d);
  trigger.setDate(trigger.getDate() - settings.daysBeforeExpiration);
  trigger.setHours(settings.notificationHour, settings.notificationMinute, 0, 0);

  if (trigger.getTime() <= Date.now()) return;

  await Notifications.scheduleNotificationAsync({
    identifier: notificationIdFor(item.id),
    content: {
      title: '賞味期限が近づいています',
      body: `「${item.name}」の期限まで${settings.daysBeforeExpiration}日です`,
      data: { itemId: item.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: trigger,
    },
  });
}

/** 1件分の期限通知をキャンセル */
export async function cancelExpirationNotification(itemId: number): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationIdFor(itemId));
}

/**
 * 全アイテムに対して通知を再スケジュール
 * 設定変更時など、整合を取り直したい時に使う
 */
export async function rescheduleAllExpirationNotifications(
  items: NotifiableItem[],
  settings: NotificationSettings
): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!settings.enabled) return;
  for (const item of items) {
    await scheduleExpirationNotification(item, settings);
  }
}

/** 予約済みの通知をすべてキャンセル（リセット操作用） */
export async function cancelAllExpirationNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * テスト通知を5秒後に発火
 *  - 固定識別子なので連打しても重複予約されない
 *  - 設定OFF状態でも動作（設定を入れる前の動作確認に使える）
 */
export async function sendTestNotificationAsync(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier: 'test-notification',
    content: {
      title: 'テスト通知',
      body: '通知は正常に動作しています',
      data: { test: true },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(Date.now() + 5000),
    },
  });
}
```

### このファイルの設計ポイント

| 設計判断 | 理由 |
|---|---|
| 全関数を純粋関数化、Reactフックにしない | UI層からもCRUD層からも呼ぶため。Hookだとコンポーネント内でしか使えない |
| アイテム情報を引数で受ける | DBに依存せず、テスタブル |
| 識別子をアイテムID単位で固定 | DB側に「通知ID」カラムを追加せずに済む |
| 過去時刻ならスケジュールしない | iOS仕様で過去時刻指定は無視されるが、明示的に弾く方が安全 |
| TIME_INTERVAL ではなく DATE トリガー | OSバージョン差異に強い |

---

## Step 3：アプリ起動時の通知ハンドラ登録

`app/_layout.tsx`（あるいは最上位のレイアウトファイル）で **副作用import** する：

```tsx
// app/_layout.tsx
import '@/src/lib/notifications';   // ← 副作用：setNotificationHandler が起動時に1回だけ走る
```

### なぜ副作用importなのか

`setNotificationHandler` はモジュールがロードされた瞬間に走らせたい。
コンポーネント内で `useEffect` 経由にすると：
- そのコンポーネントがマウントされるまで未設定
- フォアグラウンド中に通知が来ても画面に出ない（バナーは出るが、アプリ内ハンドリングが届かない）

**最上位レイアウトでimportするだけ** で、アプリの最も早い段階で確実に1回走る。

---

## Step 4：通知設定の永続化（Context化）

ユーザーが選んだ「オン/オフ」「何日前」「何時」をAsyncStorageに保存し、複数画面で共有する。

### 4-1. 型定義: `src/features/settings/types.ts`

```ts
export type NotificationSettings = {
  /** マスター通知のオン/オフ */
  enabled: boolean;
  /** 期限の何日前に通知するか */
  daysBeforeExpiration: number;
  /** 通知時刻：時（0-23） */
  notificationHour: number;
  /** 通知時刻：分（0-59） */
  notificationMinute: number;
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  daysBeforeExpiration: 7,
  notificationHour: 10,
  notificationMinute: 0,
};

export const NOTIFICATION_SETTINGS_STORAGE_KEY = '@notification_settings_v1';
```

`_v1` のサフィックスはスキーマ進化時のためのバージョニング。将来構造を変える時に v2 を別キーにすればクリーンに切り替えられる。

### 4-2. Context + Provider + Hook: `src/features/settings/hooks/useNotificationSettings.tsx`

```tsx
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

export function NotificationSettingsProvider({ children }: { children: ReactNode }) {
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
    return () => { cancelled = true; };
  }, []);

  const updateSettings = useCallback(async (next: NotificationSettings) => {
    setSettings(next);
    await AsyncStorage.setItem(
      NOTIFICATION_SETTINGS_STORAGE_KEY,
      JSON.stringify(next)
    );
  }, []);

  return (
    <NotificationSettingsContext.Provider value={{ settings, loading, updateSettings }}>
      {children}
    </NotificationSettingsContext.Provider>
  );
}

export function useNotificationSettings() {
  return useContext(NotificationSettingsContext);
}
```

### 4-3. Provider でアプリをラップ

```tsx
// app/_layout.tsx
import { NotificationSettingsProvider } from '@/src/features/settings/hooks/useNotificationSettings';

export default function RootLayout() {
  return (
    <NotificationSettingsProvider>
      {/* ThemeProvider, Stack 等 */}
    </NotificationSettingsProvider>
  );
}
```

### ⚠️ 重要：Hookだけでは不十分（経験談）

最初は「Contextなし、各画面で `useNotificationSettings` を呼んだら state を持つ単なるHook」で実装したが、
**画面ごとに state が独立**してしまい、子画面（詳細設定）で更新しても親画面（設定トップ）の表示が古いままになる問題が発生した。

→ 必ず **Provider で state を共有** すること。Hookを useState で書き始めたら、ほぼ確実に後でContext化することになる。

---

## Step 5：設定画面UI

### 5-1. ファイル構造

`expo-router` で詳細設定を子ルートにする：

```
app/(tabs)/settings/
├── _layout.tsx          # Stack ナビゲータ
├── index.tsx            # 設定トップ
└── notifications.tsx    # 通知詳細
```

### 5-2. Stack: `app/(tabs)/settings/_layout.tsx`

```tsx
import { Stack } from 'expo-router';

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
```

### 5-3. 設定トップ：通知サマリの表示と遷移

```tsx
// app/(tabs)/settings/index.tsx（抜粋）
import { useRouter } from 'expo-router';
import { useNotificationSettings } from '@/src/features/settings/hooks/useNotificationSettings';

function summarize(s: NotificationSettings): string {
  if (!s.enabled) return 'オフ';
  const time = `${String(s.notificationHour).padStart(2,'0')}:${String(s.notificationMinute).padStart(2,'0')}`;
  return `${s.daysBeforeExpiration}日前 ${time}`;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { settings } = useNotificationSettings();

  return (
    <SettingsRow
      title="期限切れの通知"
      detail={summarize(settings)}
      onPress={() => router.push('/settings/notifications')}
    />
  );
}
```

サマリ表示があると「現状どうなっているか」がトップで一目で分かる（iOS設定アプリと同じパターン）。

### 5-4. 詳細画面: `app/(tabs)/settings/notifications.tsx`

主要部分のみ：

```tsx
import { useState } from 'react';
import { Alert, Platform, Switch, TouchableOpacity, View, Text } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useNotificationSettings } from '@/src/features/settings/hooks/useNotificationSettings';
import {
  requestNotificationPermissionAsync,
  rescheduleAllExpirationNotifications,
  sendTestNotificationAsync,
} from '@/src/lib/notifications';
// プロジェクトのデータリポジトリをimport
import { useItemRepository } from '@/src/db';

const DAY_OPTIONS = [1, 3, 7, 14] as const;

export default function NotificationSettingsScreen() {
  const { settings, loading, updateSettings } = useNotificationSettings();
  const repo = useItemRepository();
  const [showTimePicker, setShowTimePicker] = useState(false);

  /** 設定保存 → 全アイテムの通知を再スケジュール */
  const persist = async (next: NotificationSettings) => {
    await updateSettings(next);
    const items = await repo.findAll();
    await rescheduleAllExpirationNotifications(items, next);
  };

  /** マスタースイッチ：ON時に権限取得を試みる */
  const handleToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermissionAsync();
      if (!granted) {
        Alert.alert('通知が許可されていません',
          'iOSの「設定」アプリ > 通知 から許可してください');
        return;
      }
    }
    await persist({ ...settings, enabled });
  };

  const handleDaysChange = (days: number) =>
    persist({ ...settings, daysBeforeExpiration: days });

  const handleTimeChange = async (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (!selected) return;
    await persist({
      ...settings,
      notificationHour: selected.getHours(),
      notificationMinute: selected.getMinutes(),
    });
  };

  const handleSendTestNotification = async () => {
    const granted = await requestNotificationPermissionAsync();
    if (!granted) {
      Alert.alert('通知が許可されていません', '...');
      return;
    }
    await sendTestNotificationAsync();
    Alert.alert('テスト通知を送信', '5秒後に通知が届きます。');
  };

  if (loading) return null;

  return (
    <View>
      {/* マスタースイッチ */}
      <Switch value={settings.enabled} onValueChange={handleToggle} />

      {/* 日数ラジオ */}
      {DAY_OPTIONS.map((days) => (
        <TouchableOpacity key={days} onPress={() => handleDaysChange(days)}>
          <Text>{days}日前</Text>
          {settings.daysBeforeExpiration === days && <Text>✓</Text>}
        </TouchableOpacity>
      ))}

      {/* 時刻ピッカー */}
      <TouchableOpacity onPress={() => setShowTimePicker(v => !v)}>
        <Text>{formatTime(settings.notificationHour, settings.notificationMinute)}</Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          value={makeTimeDate(settings.notificationHour, settings.notificationMinute)}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}

      {/* テスト通知 */}
      <TouchableOpacity onPress={handleSendTestNotification}>
        <Text>テスト通知を送る</Text>
      </TouchableOpacity>
    </View>
  );
}

function formatTime(h: number, m: number) {
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}
function makeTimeDate(h: number, m: number) {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}
```

### 設定変更時の3点セット

設定を変えた時は **常に3つの処理をセット** で行う：
1. `updateSettings(next)` → AsyncStorage 保存 + state 更新
2. `repo.findAll()` → 全アイテム取得
3. `rescheduleAllExpirationNotifications(items, next)` → OS通知キューを設定値に合わせて再構成

`persist()` 関数として共通化しておくと「忘れた」事故が防げる。

---

## Step 6：CRUDオペレーションとの連動

アイテムを作成・更新・削除する画面で、通知スケジュールも同時に操作する。

### 6-1. 作成・更新時

```tsx
import {
  scheduleExpirationNotification,
  cancelExpirationNotification,
} from '@/src/lib/notifications';
import { useNotificationSettings } from '@/src/features/settings/hooks/useNotificationSettings';

export function ItemEditModal({ editingItem }) {
  const { settings: notificationSettings } = useNotificationSettings();
  const repo = useItemRepository();

  const handleSave = async () => {
    const payload = { name, expirationDate, ... };

    let targetId: number;
    if (editingItem) {
      await repo.update(editingItem.id, payload);
      targetId = editingItem.id;
    } else {
      targetId = await repo.create(payload);
    }

    // 通知をスケジュール（OFFなら関数内部でスキップ）
    await scheduleExpirationNotification(
      { id: targetId, name: payload.name, expirationDate: payload.expirationDate },
      notificationSettings
    );
  };

  const handleDelete = async () => {
    await repo.delete(editingItem.id);
    await cancelExpirationNotification(editingItem.id);
  };
}
```

### 6-2. 全データリセット時

```tsx
import { cancelAllExpirationNotifications } from '@/src/lib/notifications';

const handleResetAllData = async () => {
  await repo.deleteAll();                       // DB
  await cancelAllExpirationNotifications();     // OS通知キュー
  // 一覧画面の再fetchトリガー（プロジェクト依存）
};
```

### 整合性の原則

**「DB操作と通知操作は必ずペアで行う」** がルール。
- アイテム作成 → 通知予約
- アイテム削除 → 通知キャンセル
- 全削除 → 全予約キャンセル

片方を忘れると「もう存在しないアイテムの通知が届く」「設定したつもりが届かない」等の事故になる。

---

## Step 7：テスト通知ボタンの追加

設定画面下部に「テスト通知を送る」を置く。**設定値とは独立**して動かす：

```ts
// src/lib/notifications.ts
export async function sendTestNotificationAsync(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier: 'test-notification', // 固定識別子で連打対策
    content: {
      title: 'テスト通知',
      body: '通知は正常に動作しています',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(Date.now() + 5000),
    },
  });
}
```

理由：
- ユーザーは「通知ONにする前に動作確認したい」ことが多い
- 開発者も毎回データを登録せずに通知の見た目を確認できる
- 権限が未取得なら、ボタンタップ時にリクエストできる

---

## Step 8：動作確認

### 開発時のクイックチェック

1. **Expo Goで起動**（ローカル通知はExpo Goで動作する）
2. 設定 → 期限通知 → トグルON → 権限ダイアログで許可
3. 「テスト通知を送る」をタップ → 5秒待つ → 通知が届くか確認
4. ホーム → 新規アイテム登録（期限 = 「N日前 + 1日後」など短期で設定）
5. 期限通知のタイミングを「テスト用に短く」しておくと検証が早い

### 開発時の便利テクニック

通知の発火時刻をテスト用に短くしたい場合、`scheduleExpirationNotification` のトリガーを一時的に：

```ts
trigger: {
  type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
  seconds: 10,
}
```

に置き換えると、登録直後10秒で通知が来る。**本実装に戻すのを忘れずに**。

---

## 13. 制約と注意点

### iOS
| 項目 | 制約 |
|---|---|
| 同時スケジュール件数 | **64件まで** |
| バックグラウンド動的計算 | できない（事前予約のみ） |
| 過去時刻指定 | 無視される（事前にチェック必要） |
| Expo Go | ローカル通知は動作する（SDK 53+でリモートのみ不可） |

### Android
| 項目 | 内容 |
|---|---|
| 件数制限 | 実質的に無し |
| Doze モード | 充電中以外は配信遅延の可能性あり |
| 通知チャンネル | 細かい設定をするなら `setNotificationChannelAsync` で定義 |

### 共通
- 端末を再起動しても予約は生き残る
- アプリをアンインストールすると全予約消える（当然）
- アプリ更新では予約は残る
- 権限拒否後はOSの設定アプリでしか変更できない

---

## 14. トラブルシューティング

### 通知が全く出ない

| チェック | 対処 |
|---|---|
| 権限は許可されているか | `getPermissionsAsync()` で確認、必要ならOS設定誘導 |
| trigger.date は未来か | `Date.now()` と比較してログを出す |
| アプリがフォアグラウンドにある時に何も出ない | `setNotificationHandler` の `shouldShowBanner: true` を確認 |
| iOS 「サイレントモード」になっていないか | iOS の集中モードを確認 |

### フォアグラウンドで通知バナーが出ない

`setNotificationHandler` を `_layout.tsx` の副作用importで読み込めているか確認。
コンポーネント内の `useEffect` でハンドラ登録していると、そのコンポーネントがマウントされるまで効かない。

### 子画面で変更した設定が親画面で反映されない

**Context化していない可能性が高い**。`useState` だけのHookは画面ごとに独立 state を持つので、必ず Provider + Context にする（Step 4を参照）。

### 通知が重複して届く

識別子が動的に変わっている可能性。**アイテムID単位で固定** すれば再予約時に自動で上書きされる。

### iOSで「通知を許可しますか？」ダイアログが2回目から出ない

OSの仕様。一度「許可しない」を選んだ後は、`canAskAgain` が false になりOSダイアログは出せない。
ユーザーに **「設定アプリ > 通知 > このアプリ」で許可してください** と案内するのが正しい。

---

## 15. 失敗から学んだ重要パターン

このプロジェクトで実際に起きた失敗と対応：

### 失敗1：Hookだけで state 管理した結果、画面間で同期しない

最初は素朴に：

```ts
export function useNotificationSettings() {
  const [settings, setSettings] = useState(...);
  // AsyncStorage load + state
  return { settings, updateSettings };
}
```

詳細画面でトグルON → 親画面の設定サマリが「オフ」のまま、という症状が発生。
**画面ごとに別々のstateインスタンス**を持っていたため。

**教訓**：永続化された設定をUIで複数箇所から参照する場合、**最初からContext化** すること。後から直すのは可能だがimport先含めて手間。

### 失敗2：Provider を home タブ内に閉じ込めて、settings タブから refresh できなかった

food一覧の `InventoryProvider`（refresh トリガー保持）を home タブ配下にだけ置いた結果、settings画面の「全データリセット」から refresh を呼べなかった。

**教訓**：複数タブから操作される state は **最上位の Provider** に置く。タブ内ローカルに見えても、リセット系操作の発生源は他タブにある可能性が高い。

### 失敗3：Expo Go で動作確認しようとしたら一部不可

リモートpushはExpo GoではSDK 53以降サポート外になった。
**ローカル通知** は動作するので、本ガイドの内容はExpo Goで全て検証可能。
ただし本番運用では Development Build 推奨。

---

## 16. 今後の拡張

### 16-1. 複数の通知タイミング

「7日前 + 1日前 + 当日朝」など複数通知を出したい場合：

```ts
type NotificationSettings = {
  enabled: boolean;
  triggers: { daysBefore: number; hour: number; minute: number }[]; // 配列化
};
```

識別子も `expiration-{itemId}-{idx}` のように添字を付ける。

### 16-2. カテゴリ別の通知設定

「保存食は7日前、飲み物は3日前」のようにカテゴリ別に分ける場合：

```ts
type NotificationSettings = {
  enabled: boolean;
  perCategory: Record<string, { daysBefore: number; hour: number; minute: number }>;
};
```

### 16-3. 通知履歴

`Notifications.addNotificationReceivedListener` で受信ログを取り、AsyncStorage や SQLite に保存。
「最近届いた通知一覧」画面が作れる。

### 16-4. リモートpushへの拡張

ローカル通知をベースに、後からリモート通知を足す場合：
1. **Apple Developer Program 加入** ($99/年)
2. EAS Build で Development Build 作成
3. `getExpoPushTokenAsync()` でトークン取得・サーバー送信
4. サーバー側は Expo Push Notification Service 経由で配信
5. `addNotificationReceivedListener` で受信ハンドリング

**重要**：ローカル通知のロジックはそのまま残し、リモートを「並行」で追加するのが安全。

---

## 付録：チェックリスト（新プロジェクト導入時）

- [ ] `npx expo install` で3つのパッケージを追加
- [ ] `src/lib/notifications.ts` を作成
- [ ] `src/features/settings/types.ts` を作成
- [ ] `src/features/settings/hooks/useNotificationSettings.tsx` を作成（Context版）
- [ ] `app/_layout.tsx` で `'@/src/lib/notifications'` を副作用import
- [ ] `app/_layout.tsx` で `<NotificationSettingsProvider>` でラップ
- [ ] 設定画面のルートを `app/(tabs)/settings/` の Stack 構造に作成
- [ ] 詳細画面（notifications.tsx）を実装
- [ ] CRUD画面で `scheduleExpirationNotification` / `cancelExpirationNotification` 呼び出し
- [ ] テスト通知ボタンを設定画面に追加
- [ ] Expo Go で「テスト通知 → 5秒後に届く」を確認
- [ ] 設定変更 → 再スケジュール の流れを動作確認

---

## 参考リンク

- [expo-notifications 公式ドキュメント](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Apple Developer Notifications Guide](https://developer.apple.com/documentation/usernotifications)
- [Android Notification Channels](https://developer.android.com/develop/ui/views/notifications/channels)
