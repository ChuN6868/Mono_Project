import * as Notifications from 'expo-notifications';
import type { NotificationSettings } from '@/src/features/settings/types';

/**
 * 通知のグローバル設定
 *
 * 【ここで何をしているか】
 * アプリがフォアグラウンド状態の時にも通知バナーを出す設定。
 * デフォルトではフォア時は通知が出ない（OS仕様）ため、明示的に有効化する。
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
 *
 * 【流れ】
 *  1. 現在の権限を確認
 *  2. 既に許可済みなら即 true
 *  3. 未確定なら OS のダイアログを出す
 *  4. 拒否済み（denied）の場合は OS のダイアログは出ず即 false
 */
export async function requestNotificationPermissionAsync(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;

  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
    },
  });
  return requested.granted;
}

/** 食品1件分の最小情報 */
type FoodForNotification = {
  id: number;
  name: string;
  expirationDate: string; // 'YYYY-MM-DD'
};

/** identifier生成（食品ID単位で1スケジュールにすることでDB側の通知IDカラム不要） */
function notificationIdFor(foodId: number): string {
  return `expiration-${foodId}`;
}

/**
 * 1件分の期限通知をスケジュールする
 *
 * 【挙動】
 * - 通知OFF or 設定値ベースで「過去時刻」になる場合はスケジュールせず終了
 * - 既存の予約があれば常に上書き（cancel → schedule）
 * - 識別子は食品IDに紐づくので、編集や削除時はこの関数 or cancelで一意操作できる
 */
export async function scheduleExpirationNotification(
  food: FoodForNotification,
  settings: NotificationSettings
): Promise<void> {
  await cancelExpirationNotification(food.id);

  if (!settings.enabled) return;

  // expiration_date は 'YYYY-MM-DD' 文字列。端末ローカルタイム0時として解釈する
  const [y, m, d] = food.expirationDate.split('-').map(Number);
  const trigger = new Date(y, m - 1, d);
  trigger.setDate(trigger.getDate() - settings.daysBeforeExpiration);
  trigger.setHours(settings.notificationHour, settings.notificationMinute, 0, 0);

  if (trigger.getTime() <= Date.now()) {
    // 既に通知時刻を過ぎている → スケジュール不要
    return;
  }

  await Notifications.scheduleNotificationAsync({
    identifier: notificationIdFor(food.id),
    content: {
      title: '賞味期限が近づいています',
      body: `「${food.name}」の期限まで${settings.daysBeforeExpiration}日です`,
      data: { foodId: food.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: trigger,
    },
  });
}

/** 1件分の期限通知をキャンセル */
export async function cancelExpirationNotification(foodId: number): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationIdFor(foodId));
}

/**
 * 予約済みの通知をすべてキャンセル
 *
 * 【注意】
 * 現状のアプリは期限通知しかスケジュールしないので「全部消す = 期限通知を全部消す」だが、
 * 将来別種の通知（例：補充リマインダー）を追加した時はここに残るので命名を再考すること。
 */
export async function cancelAllExpirationNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * テスト通知を5秒後に発火させる
 *
 * 【用途】
 * 設定画面のテストボタンから呼ぶことで、ユーザーが
 * 「通知が許可されているか」「通知の見た目」を実機で確認できる。
 *
 * 【識別子について】
 * 固定 'test-notification' を使うため、ボタン連打しても重複予約されず
 * 最後の1件だけがスケジュールされる（連打されても通知爆発しない設計）。
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

/**
 * 全食品に対して通知を再スケジュール
 *
 * 【使い所】
 * - 通知設定（オン/オフ、何日前、何時）が変わった時
 * - アプリ起動時にDBとOS通知キューを揃え直したい時
 *
 * 【実装】
 * 既存予約を全消し → DBから取った全食品を順次スケジュール、というシンプルな方式。
 * 食品数 < iOS上限64件 を前提にしているが、業務的に十分妥当な仮定。
 */
export async function rescheduleAllExpirationNotifications(
  foods: FoodForNotification[],
  settings: NotificationSettings
): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!settings.enabled) return;

  for (const food of foods) {
    await scheduleExpirationNotification(food, settings);
  }
}
