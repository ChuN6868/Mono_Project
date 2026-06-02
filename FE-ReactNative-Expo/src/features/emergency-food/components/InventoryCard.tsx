import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { InventoryItem } from '../types/inventoryItem';

/**
 * カード1枚分の純粋表示コンポーネント
 *
 * 【純粋コンポーネントである理由】
 * - データ取得・状態管理を一切しない
 * - propsだけで描画が決まる → Storybook等で単体確認可能
 * - リスト内で大量にレンダリングされても副作用なし
 *
 * 【onPress について】
 * 任意プロパティ。指定があればタップ可能（編集モーダルを開くなど）、
 * 未指定なら通常のViewと同じく無反応。
 */
export function InventoryCard({
  item,
  onPress,
}: {
  item: InventoryItem;
  onPress?: (item: InventoryItem) => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress ? () => onPress(item) : undefined}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.card}>
        {/* 1行目：名前 + カテゴリバッジ */}
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text
            style={[
              styles.badge,
              item.category === '飲み物' ? styles.badgeWater : styles.badgeFood,
            ]}
          >
            {item.category}
          </Text>
        </View>

        {/* 2行目：場所 + 期限 */}
        <View style={styles.rowBetween}>
          <Text style={styles.place}>{item.place}</Text>
          <Text style={styles.limit}>{item.limit}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  name: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },

  place: {
    fontSize: 13,
    color: '#333',
  },

  limit: {
    fontSize: 12,
    color: '#666',
  },

  badge: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    color: '#fff',
    overflow: 'hidden',
  },

  badgeFood: {
    backgroundColor: '#4CAF50',
  },

  badgeWater: {
    backgroundColor: '#2196F3',
  },
});
