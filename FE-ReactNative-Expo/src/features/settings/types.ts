/**
 * 通知設定の型と初期値
 *
 * 【保存先】
 * AsyncStorage（端末ローカル）。useNotificationSettings hook 経由で読み書きする。
 *
 * 【意図的にやらないこと】
 * - 同期APIにしない（AsyncStorage は非同期しかないため）
 * - 個別フラグの細分化（必要になったら追加）
 */
export type NotificationSettings = {
  /** マスター通知のオン/オフ */
  enabled: boolean;
  /** 期限の何日前に通知するか（1, 3, 7, 14） */
  daysBeforeExpiration: number;
  /** 通知する時刻：時（0-23） */
  notificationHour: number;
  /** 通知する時刻：分（0-59） */
  notificationMinute: number;
};

/** 初回起動時のデフォルト値 */
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  daysBeforeExpiration: 7,
  notificationHour: 10,
  notificationMinute: 0,
};

/** AsyncStorageに保存する時のキー */
export const NOTIFICATION_SETTINGS_STORAGE_KEY = '@notification_settings_v1';
