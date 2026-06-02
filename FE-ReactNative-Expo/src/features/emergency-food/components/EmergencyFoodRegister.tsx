import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import {
  type Category,
  useCategoryRepository,
  useEmergencyFoodRepository,
} from '@/src/db';
import { useInventoryRefresh } from '../contexts/InventoryRefreshContext';

/**
 * 非常食登録モーダル
 *
 * 【責務】
 * - フォーム入力の状態管理
 * - DBへの保存（emergencyFoodRepository.create）
 * - 保存成功時：refreshトリガー発火 → 一覧画面が自動再取得
 * - キャンセル/保存時：フォームをリセットして閉じる
 *
 * 【表示制御】
 * isOpen / onClose は親（_layout.tsx）が管理する。
 * このコンポーネントは「中身」だけに責任を持つ。
 */
export function EmergencyFoodRegister({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const categoryRepository = useCategoryRepository();
  const emergencyFoodRepository = useEmergencyFoodRepository();
  const { triggerRefresh } = useInventoryRefresh();

  // フォーム入力state
  const [name, setName] = useState('');
  const [storage, setStorage] = useState('');
  const [selectedDate, setSelectedDate] = useState(''); // 'YYYY-MM-DD'
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [categoryName, setCategoryName] = useState<'保存食' | '飲み物'>('保存食');
  const [saving, setSaving] = useState(false);

  // カテゴリ名 → ID 解決のため、起動時に1回だけ全カテゴリを取得しておく
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    categoryRepository.findAll().then(setCategories);
  }, [categoryRepository]);

  /** 入力をクリアして閉じる */
  const resetAndClose = () => {
    setName('');
    setStorage('');
    setSelectedDate('');
    setCategoryName('保存食');
    setIsCalendarOpen(false);
    onClose();
  };

  /** 保存ボタン押下 */
  const handleSave = async () => {
    // バリデーション
    if (!name.trim()) {
      Alert.alert('入力エラー', '名前を入力してください');
      return;
    }
    if (!selectedDate) {
      Alert.alert('入力エラー', '期限を選択してください');
      return;
    }

    // カテゴリ名 → IDを解決
    const category = categories.find((c) => c.name === categoryName);
    if (!category) {
      Alert.alert(
        'エラー',
        `カテゴリ「${categoryName}」がDBに存在しません。アプリを再起動してください。`
      );
      return;
    }

    setSaving(true);
    try {
      await emergencyFoodRepository.create({
        categoryId: category.id,
        name: name.trim(),
        expirationDate: selectedDate, // 'YYYY-MM-DD'
        storageLocation: storage.trim() || null,
      });
      // 一覧画面の useInventoryItems が再取得するように通知
      triggerRefresh();
      resetAndClose();
    } catch (e) {
      Alert.alert('保存失敗', e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  /** YYYY-MM-DD を 'YYYY年M月D日' に変換（表示用） */
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  };

  return (
    <Modal
      isVisible={isOpen}
      onBackdropPress={resetAndClose}
      swipeDirection="down"
      onSwipeComplete={resetAndClose}
      propagateSwipe
      style={styles.modal}
      backdropOpacity={0.4}
      useNativeDriver
      hideModalContentWhileAnimating
    >
      <View style={styles.sheet}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <TouchableOpacity onPress={resetAndClose} disabled={saving}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSave} disabled={saving}>
            <Text style={[styles.saveText, saving && styles.saveTextDisabled]}>
              {saving ? '保存中...' : '保存'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* 名前 */}
          <TextInput
            placeholder="名前"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          {/* カテゴリ */}
          <View style={styles.row}>
            <View style={styles.leftLabel}>
              <Ionicons
                name={categoryName === '保存食' ? 'fast-food-outline' : 'water-outline'}
                size={18}
                color="#333"
              />
              <Text style={styles.label}>カテゴリ</Text>
            </View>

            <View style={styles.segmentSmall}>
              <TouchableOpacity
                style={[
                  styles.segmentSmallBtn,
                  categoryName === '保存食' && styles.segmentActive,
                ]}
                onPress={() => setCategoryName('保存食')}
              >
                <Text
                  style={[
                    styles.segmentSmallText,
                    categoryName === '保存食' && styles.segmentTextActive,
                  ]}
                >
                  保存食
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentSmallBtn,
                  categoryName === '飲み物' && styles.segmentActive,
                ]}
                onPress={() => setCategoryName('飲み物')}
              >
                <Text
                  style={[
                    styles.segmentSmallText,
                    categoryName === '飲み物' && styles.segmentTextActive,
                  ]}
                >
                  飲み物
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 期限 */}
          <View style={styles.dateRow}>
            <View style={styles.leftLabel}>
              <Ionicons name="calendar-outline" size={18} color="#333" />
              <Text style={styles.label}>期限</Text>
            </View>

            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setIsCalendarOpen(true)}
            >
              <Text style={selectedDate ? styles.dateText : styles.datePlaceholder}>
                {selectedDate ? formatDate(selectedDate) : '選択'}
              </Text>
            </TouchableOpacity>
          </View>

          {isCalendarOpen && (
            <View style={styles.calendarBox}>
              <Calendar
                // ヘッダーを「2027年 8月」表記に（ロケールだけでは英語語順のままなため必要）
                monthFormat="yyyy年 M月"
                // 月を左右スワイプで切り替えられるようにする
                enableSwipeMonths
                // 日本語UIに合うテーマ（アプリの青色に統一）
                theme={{
                  todayTextColor: '#2196F3',
                  arrowColor: '#2196F3',
                  selectedDayBackgroundColor: '#2196F3',
                  textMonthFontWeight: 'bold',
                }}
                onDayPress={(day) => {
                  setSelectedDate(day.dateString);
                  setIsCalendarOpen(false);
                }}
                markedDates={{
                  [selectedDate]: {
                    selected: true,
                    selectedColor: '#2196F3',
                  },
                }}
              />
            </View>
          )}

          {/* 保管場所 */}
          <TextInput
            placeholder="保管場所"
            style={styles.input}
            value={storage}
            onChangeText={setStorage}
          />
        </ScrollView>

        {/* 広告 */}
        <View style={styles.adArea}>
          <Text style={styles.adTitle}>広告スペース</Text>
          <Text style={styles.adSub}>（ここにAdMobなど）</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  sheet: {
    height: '90%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  scrollArea: { flex: 1 },
  scrollContent: { padding: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  leftLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  segmentSmall: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 3,
  },
  segmentSmallBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  segmentSmallText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  segmentActive: {
    backgroundColor: '#2196F3',
  },
  segmentTextActive: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  dateInput: {
    width: 140,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  dateText: { color: '#111' },
  datePlaceholder: { color: '#999' },
  calendarBox: {
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  adArea: {
    height: 180,
    backgroundColor: '#f2f2f2',
    borderTopWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adTitle: { fontSize: 16, fontWeight: '600', color: '#666' },
  adSub: { fontSize: 12, color: '#999', marginTop: 6 },
  saveText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  saveTextDisabled: {
    color: '#aaa',
  },
});
