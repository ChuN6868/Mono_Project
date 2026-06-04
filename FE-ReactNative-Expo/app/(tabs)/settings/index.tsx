import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEmergencyFoodRepository } from '@/src/db';
import { useInventoryRefresh } from '@/src/features/emergency-food/contexts/InventoryContext';
import { useNotificationSettings } from '@/src/features/settings/hooks/useNotificationSettings';
import type { NotificationSettings } from '@/src/features/settings/types';
import { cancelAllExpirationNotifications } from '@/src/lib/notifications';

/**
 * 設定画面（タブのトップ）
 *
 * 各セクション → カード → 行 の iOS グループドリスト構造。
 * 「期限切れの通知」行は現在の設定値をサマリ表示し、タップで詳細画面へ遷移。
 */

type SettingItem = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  detail?: string;
  onPress?: () => void;
};

type SettingSection = {
  title: string;
  items: SettingItem[];
};

/** "10:00" のような表示用に整形 */
function formatTime(hour: number, minute: number): string {
  const hh = String(hour).padStart(2, '0');
  const mm = String(minute).padStart(2, '0');
  return `${hh}:${mm}`;
}

/** "オン (7日前 10:00)" / "オフ" のサマリ文字列 */
function summarizeNotification(s: NotificationSettings): string {
  if (!s.enabled) return 'オフ';
  return `${s.daysBeforeExpiration}日前 ${formatTime(s.notificationHour, s.notificationMinute)}`;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { settings: notificationSettings, loading } = useNotificationSettings();
  const emergencyFoodRepository = useEmergencyFoodRepository();
  const { triggerRefresh } = useInventoryRefresh();

  /**
   * すべてのデータをリセット
   *
   * 【消すもの】
   *   - emergency_foods 全件（ユーザーが登録した非常食データ）
   *   - OSに予約済みの全通知（食品が消えれば通知の意味も無いため）
   *
   * 【残すもの】
   *   - 通知設定（7日前/10時 など、ユーザーの好み）
   *   - カテゴリマスタ（アプリ内蔵の参照データ）
   */
  const handleResetAllData = () => {
    Alert.alert(
      'すべてのデータをリセット',
      '登録された非常食データがすべて削除されます。\nこの操作は取り消せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'リセット',
          style: 'destructive',
          onPress: async () => {
            try {
              await emergencyFoodRepository.deleteAll();
              await cancelAllExpirationNotifications();
              triggerRefresh(); // 一覧画面の useInventoryItems を再fetch
              Alert.alert('完了', 'すべてのデータをリセットしました');
            } catch (e) {
              Alert.alert(
                'リセット失敗',
                e instanceof Error ? e.message : String(e)
              );
            }
          },
        },
      ]
    );
  };

  const sections: SettingSection[] = [
    {
      title: '通知',
      items: [
        {
          icon: 'notifications-outline',
          iconColor: '#FF9500',
          title: '期限切れの通知',
          detail: loading ? '...' : summarizeNotification(notificationSettings),
          onPress: () => router.push('/settings/notifications'),
        },
      ],
    },
    {
      title: '表示',
      items: [
        {
          icon: 'moon-outline',
          iconColor: '#AF52DE',
          title: 'テーマ',
          detail: '自動',
        },
      ],
    },
    {
      title: 'データ',
      items: [
        {
          icon: 'trash-outline',
          iconColor: '#FF3B30',
          title: 'すべてのデータをリセット',
          onPress: handleResetAllData,
        },
      ],
    },
    {
      title: 'アプリについて',
      items: [
        {
          icon: 'information-circle-outline',
          iconColor: '#007AFF',
          title: 'バージョン',
          detail: '1.0.0',
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>設定</Text>

        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, idx) => (
                <View key={item.title}>
                  <TouchableOpacity
                    style={styles.row}
                    onPress={item.onPress}
                    activeOpacity={0.6}
                    disabled={!item.onPress}
                  >
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: item.iconColor },
                      ]}
                    >
                      <Ionicons name={item.icon} size={18} color="#fff" />
                    </View>
                    <Text style={styles.rowTitle}>{item.title}</Text>
                    {item.detail && (
                      <Text style={styles.rowDetail}>{item.detail}</Text>
                    )}
                    <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
                  </TouchableOpacity>
                  {idx < section.items.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginTop: 12,
    marginBottom: 24,
  },
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
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowTitle: { flex: 1, fontSize: 16, color: '#000' },
  rowDetail: { fontSize: 15, color: '#8E8E93', marginRight: 6 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#C6C6C8',
    marginLeft: 56,
  },
});
