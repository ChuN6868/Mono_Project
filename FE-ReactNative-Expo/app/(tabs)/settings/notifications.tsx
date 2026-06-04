import { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useEmergencyFoodRepository } from '@/src/db';
import { useNotificationSettings } from '@/src/features/settings/hooks/useNotificationSettings';
import {
  requestNotificationPermissionAsync,
  rescheduleAllExpirationNotifications,
  sendTestNotificationAsync,
} from '@/src/lib/notifications';
import type { NotificationSettings } from '@/src/features/settings/types';

/**
 * 期限通知の詳細設定画面
 *
 * 【3つの設定】
 *  1. 通知をオン/オフ（マスタースイッチ）
 *  2. 期限の何日前に通知するか
 *  3. 通知する時刻
 *
 * 【設定変更時の連動】
 * いずれの変更も「設定保存 → 全食品の通知を再スケジュール」を行う。
 * これにより設定とOS通知キューの整合が常に取れる。
 */

const DAY_OPTIONS = [1, 3, 7, 14] as const;

function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** 時/分から「今日のその時刻」のDateを作る（DateTimePickerのvalue用） */
function makeTimeDate(hour: number, minute: number): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

export default function NotificationSettingsScreen() {
  const { settings, loading, updateSettings } = useNotificationSettings();
  const repo = useEmergencyFoodRepository();
  const [showTimePicker, setShowTimePicker] = useState(false);

  /** 設定を更新 → 全食品の通知を再スケジュール */
  const persist = async (next: NotificationSettings) => {
    await updateSettings(next);
    const foods = await repo.findAll();
    await rescheduleAllExpirationNotifications(foods, next);
  };

  const handleToggle = async (enabled: boolean) => {
    if (enabled) {
      // 通知ON時のみ権限をリクエスト（コンテキスト依頼でApple推奨パターン）
      const granted = await requestNotificationPermissionAsync();
      if (!granted) {
        Alert.alert(
          '通知が許可されていません',
          'iOSの「設定」アプリ > 通知 から、このアプリの通知を許可してください。',
          [{ text: 'OK' }]
        );
        return;
      }
    }
    await persist({ ...settings, enabled });
  };

  const handleDaysChange = async (days: number) => {
    await persist({ ...settings, daysBeforeExpiration: days });
  };

  const handleTimeChange = async (_: DateTimePickerEvent, selected?: Date) => {
    // Androidはピッカーが閉じるため毎回非表示にする。iOSは出しっぱなしOK
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (!selected) return;
    await persist({
      ...settings,
      notificationHour: selected.getHours(),
      notificationMinute: selected.getMinutes(),
    });
  };

  /**
   * テスト通知を送る：5秒後にローカル通知を発火させる
   *
   * 【意図的にやらないこと】
   * - settings.enabled の状態に依存させない（OFFでも動作確認できる方が便利）
   * - permissionがdeniedの時はリクエストを試みた上で案内を出す
   */
  const handleSendTestNotification = async () => {
    const granted = await requestNotificationPermissionAsync();
    if (!granted) {
      Alert.alert(
        '通知が許可されていません',
        'iOSの「設定」アプリ > 通知 から、このアプリの通知を許可してください。'
      );
      return;
    }
    await sendTestNotificationAsync();
    Alert.alert(
      'テスト通知を送信',
      '5秒後に通知が届きます。\nアプリを背景にしてもロック画面に届きます。'
    );
  };

  if (loading) {
    // 初期load中は空表示（一瞬で終わる想定）
    return <SafeAreaView style={styles.container} edges={['top']} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* === マスタースイッチ === */}
        <View style={styles.section}>
          <View style={styles.sectionCard}>
            <View style={styles.row}>
              <Text style={styles.rowTitle}>期限通知をオンにする</Text>
              <Switch
                value={settings.enabled}
                onValueChange={handleToggle}
                trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              />
            </View>
          </View>
          <Text style={styles.sectionFooter}>
            期限の一定日前にプッシュ通知でお知らせします
          </Text>
        </View>

        {/* === 通知タイミング（日数） === */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>通知タイミング</Text>
          <View style={styles.sectionCard}>
            {DAY_OPTIONS.map((days, idx) => {
              const selected = settings.daysBeforeExpiration === days;
              return (
                <View key={days}>
                  <TouchableOpacity
                    style={[styles.row, !settings.enabled && styles.rowDisabled]}
                    onPress={() => handleDaysChange(days)}
                    disabled={!settings.enabled}
                    activeOpacity={0.6}
                  >
                    <Text style={styles.rowTitle}>{days}日前</Text>
                    {selected && (
                      <Ionicons name="checkmark" size={20} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                  {idx < DAY_OPTIONS.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* === 通知時刻 === */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>通知時刻</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity
              style={[styles.row, !settings.enabled && styles.rowDisabled]}
              onPress={() => setShowTimePicker((v) => !v)}
              disabled={!settings.enabled}
              activeOpacity={0.6}
            >
              <Text style={styles.rowTitle}>時刻</Text>
              <Text style={styles.rowDetail}>
                {formatTime(settings.notificationHour, settings.notificationMinute)}
              </Text>
            </TouchableOpacity>

            {showTimePicker && (
              <View style={styles.pickerWrap}>
                <DateTimePicker
                  value={makeTimeDate(
                    settings.notificationHour,
                    settings.notificationMinute
                  )}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleTimeChange}
                />
              </View>
            )}
          </View>
        </View>

        {/* === テスト通知 === */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>動作確認</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.testButtonRow}
              onPress={handleSendTestNotification}
              activeOpacity={0.6}
            >
              <Text style={styles.testButtonText}>テスト通知を送る</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionFooter}>
            タップ後、5秒以内に通知が届きます。通知の見え方や許可状態の確認に使えます。
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6D6D72',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionFooter: {
    fontSize: 12,
    color: '#6D6D72',
    marginTop: 8,
    marginLeft: 4,
    lineHeight: 16,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 44,
  },
  rowDisabled: { opacity: 0.4 },
  rowTitle: { flex: 1, fontSize: 16, color: '#000' },
  rowDetail: { fontSize: 15, color: '#8E8E93' },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#C6C6C8',
    marginLeft: 14,
  },
  pickerWrap: {
    backgroundColor: '#fff',
    paddingVertical: 8,
  },
  testButtonRow: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: 16,
    color: '#007AFF', // iOS system blue
    fontWeight: '500',
  },
});
