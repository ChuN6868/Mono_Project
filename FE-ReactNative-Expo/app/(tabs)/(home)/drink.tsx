import { useInventoryItems } from '@/src/features/emergency-food/hooks/useInventoryItems';
import { useInventoryModal } from '@/src/features/emergency-food/contexts/InventoryContext';
import { EmergencyFoodList } from '@/src/features/emergency-food/components/EmergencyFoodList';

/**
 * 「飲み物」タブ：カテゴリ「飲み物」のみ表示
 */
export default function DrinkScreen() {
    const { items } = useInventoryItems('飲み物');
    const { openEditModal } = useInventoryModal();
    return <EmergencyFoodList items={items} onItemPress={openEditModal} />;
}
