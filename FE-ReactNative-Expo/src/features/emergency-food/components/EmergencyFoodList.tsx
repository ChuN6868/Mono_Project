import { View, Text, FlatList, StyleSheet } from 'react-native';
import type { InventoryItem } from '../types/inventoryItem';
import { InventoryCard } from './InventoryCard';

/**
 * 在庫一覧の純粋表示コンポーネント
 *
 * 【責務】
 * - 受け取った items を FlatList で並べる
 * - 0件の時は「未登録」の文言を出す
 * - 各カードのタップ通知（onItemPress）を上位に伝搬する
 *
 * 【意図的にやらないこと】
 * - データ取得（screenの useInventoryItems が担当）
 * - ローディング表示（screen側で出し分ける想定）
 * - 個別カードのスタイル定義（InventoryCard が担当）
 */
export function EmergencyFoodList({
  items,
  onItemPress,
}: {
  items: InventoryItem[];
  onItemPress?: (item: InventoryItem) => void;
}) {
  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>登録された非常食はありません</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={[styles.list, { paddingBottom: 100 }]}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => (
        <InventoryCard item={item} onPress={onItemPress} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 12,
    backgroundColor: '#f5f5f5',
  },
  separator: {
    height: 10,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
});
