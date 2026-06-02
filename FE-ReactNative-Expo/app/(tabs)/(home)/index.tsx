import { useInventoryItems } from '@/src/features/emergency-food/hooks/useInventoryItems';
import { useInventoryModal } from '@/src/features/emergency-food/contexts/InventoryContext';
import { EmergencyFoodList } from '@/src/features/emergency-food/components/EmergencyFoodList';

/**
 * 「すべて」タブ：全カテゴリの非常食を一覧表示
 *
 * 【設計】
 * - useInventoryItems で取得
 * - useInventoryModal で「カードタップ→編集モーダルOPEN」配線
 */
export default function AllScreen() {
    const { items } = useInventoryItems();
    const { openEditModal } = useInventoryModal();
    return <EmergencyFoodList items={items} onItemPress={openEditModal} />;
}
