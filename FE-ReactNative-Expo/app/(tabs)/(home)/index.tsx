import { useInventoryItems } from '@/src/features/emergency-food/hooks/useInventoryItems';
import { EmergencyFoodList } from '@/src/features/emergency-food/components/EmergencyFoodList';

/**
 * 「すべて」タブ：全カテゴリの非常食を一覧表示
 *
 * 【設計】
 * - hookで取得 + 純粋表示コンポーネントに渡すだけ
 * - フィルタなしで全件
 */
export default function AllScreen() {
    const { items } = useInventoryItems();
    return <EmergencyFoodList items={items} />;
}
