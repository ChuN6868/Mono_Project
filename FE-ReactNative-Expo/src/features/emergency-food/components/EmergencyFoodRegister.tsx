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
import { useInventoryRefresh } from '../contexts/InventoryContext';
import type { InventoryItem } from '../types/inventoryItem';

type CategoryName = '保存食' | '飲み物';

/**
 * 非常食 登録/編集モーダル
 *
 * 【モード】
 * - editingItem = null  : 新規登録モード（INSERT）
 * - editingItem = item  : 編集モード（UPDATE）
 *
 * UI は完全に共通。editingItem の有無で初期値とSQLだけが切り替わる。
 *
 * 【責務】
 * - フォーム入力の状態管理
 * - DBへの保存/更新（emergencyFoodRepository.create / update）
 * - 成功時：refreshトリガー発火 → 一覧画面が自動再取得
 * - キャンセル/保存時：フォームをリセットして閉じる
 */
export function EmergencyFoodRegister({
  isOpen,
  onClose,
  editingItem,
}: {
  isOpen: boolean;
  onClose: () => void;
  editingItem: InventoryItem | null;
}) {
  const categoryRepository = useCategoryRepository();
  const emergencyFoodRepository = useEmergencyFoodRepository();
  const { triggerRefresh } = useInventoryRefresh();

  const isEditMode = editingItem !== null;

  // フォーム入力state
  const [name, setName] = useState('');
  const [storage, setStorage] = useState('');
  const [selectedDate, setSelectedDate] = useState(''); // 'YYYY-MM-DD'
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [categoryName, setCategoryName] = useState<CategoryName>('保存食');
  const [saving, setSaving] = useState(false);

  // カテゴリ名 → ID 解決のため、起動時に1回だけ全カテゴリを取得しておく
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    categoryRepository.findAll().then(setCategories);
  }, [categoryRepository]);

  /**
   * モーダルが開く瞬間にフォームを「適切な初期値」にセットする
   *
   * 依存配列に editingItem?.id を入れることで：
   * - 別アイテムの編集に切り替わった時 → 再populate
   * - 新規モードに切り替わった時       → reset
   * - 同じアイテムを再度開いた時       → effectは発火しないが既に正しい状態
   */
  useEffect(() => {
    if (!isOpen) return;

    if (editingItem) {
      // 編集モード：既存値を流し込む
      setName(editingItem.name);
      // category は string 型だが実際は 2 種類のいずれか
      const cat: CategoryName =
        editingItem.category === '飲み物' ? '飲み物' : '保存食';
      setCategoryName(cat);
      // limit は 'YYYY/MM/DD' 表示形式なので '-' 区切りに戻す
      setSelectedDate(editingItem.limit.replaceAll('/', '-'));
      setStorage(editingItem.place);
    } else {
      // 新規モード：すべて初期値にリセット
      setName('');
      setCategoryName('保存食');
      setSelectedDate('');
      setStorage('');
    }
    setIsCalendarOpen(false);
  }, [isOpen, editingItem]);

  /** 閉じる（state は次回 open 時に useEffect が再初期化するのでここではクリア不要） */
  const handleClose = () => {
    setIsCalendarOpen(false);
    onClose();
  };

  /** 削除：確認ダイアログ → DBから物理削除 → 一覧再取得 → モーダルclose */
  const handleDelete = () => {
    if (!editingItem) return;

    Alert.alert(
      '削除確認',
      `「${editingItem.name}」を削除します。よろしいですか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            setSaving(true);
            try {
              await emergencyFoodRepository.delete(editingItem.id);
              triggerRefresh();
              handleClose();
            } catch (e) {
              Alert.alert(
                '削除失敗',
                e instanceof Error ? e.message : String(e)
              );
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  /** 保存ボタン押下：モードに応じて create or update */
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
      const payload = {
        categoryId: category.id,
        name: name.trim(),
        expirationDate: selectedDate, // 'YYYY-MM-DD'
        storageLocation: storage.trim() || null,
      };

      if (isEditMode && editingItem) {
        await emergencyFoodRepository.update(editingItem.id, payload);
      } else {
        await emergencyFoodRepository.create(payload);
      }

      // 一覧画面の useInventoryItems が再取得するように通知
      triggerRefresh();
      handleClose();
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
      onBackdropPress={handleClose}
      swipeDirection="down"
      onSwipeComplete={handleClose}
      propagateSwipe
      style={styles.modal}
      backdropOpacity={0.4}
      useNativeDriver
      hideModalContentWhileAnimating
    >
      <View style={styles.sheet}>
        {/* ヘッダー：左=閉じる / 中=タイトル / 右=保存 */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={handleClose} disabled={saving}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>{isEditMode ? '編集' : '新規登録'}</Text>

          <View style={styles.headerRight}>
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              <Text style={[styles.saveText, saving && styles.saveTextDisabled]}>
                {saving ? '保存中...' : '保存'}
              </Text>
            </TouchableOpacity>
          </View>
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
                monthFormat="yyyy年 M月"
                enableSwipeMonths
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

          {/* 削除：編集モード時のみ表示
              ・ゴーストボタン（背景なし・赤テキスト）で意図的にトーンを落とす
              ・上に細いディバイダーを置いて「危険ゾーン」を視覚分離
              ・破壊的アクションは目立ちすぎないのがモダンUXの基本 */}
          {isEditMode && (
            <View style={styles.dangerZone}>
              <View style={styles.dangerDivider} />
              <TouchableOpacity
                style={[styles.deleteButton, saving && styles.deleteButtonDisabled]}
                onPress={handleDelete}
                disabled={saving}
                activeOpacity={0.4}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                <Text style={styles.deleteButtonText}>このアイテムを削除</Text>
              </TouchableOpacity>
            </View>
          )}
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
    alignItems: 'center',
    padding: 16,
  },
  headerLeft: { minWidth: 60, alignItems: 'flex-start' },
  headerRight: { minWidth: 60, alignItems: 'flex-end' },
  title: { fontSize: 16, fontWeight: '600', color: '#333' },
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
  dangerZone: {
    marginTop: 32,
    alignItems: 'center',
  },
  dangerDivider: {
    height: StyleSheet.hairlineWidth, // 端末の最小線幅。OS問わず細く綺麗に出る
    backgroundColor: '#E5E5EA',       // iOS systemGray5 相当
    width: '100%',
    marginBottom: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    // ゴーストボタン：背景・枠線なし
  },
  deleteButtonDisabled: {
    opacity: 0.4,
  },
  deleteButtonText: {
    color: '#FF3B30', // iOS System Red
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});
