import { useInventoryItems } from '@/src/features/emergency-food/hooks/useInventoryItems';
import { EmergencyFoodList } from '@/src/features/emergency-food/components/EmergencyFoodList';

/**
 * 「飲み物」タブ：カテゴリ「飲み物」のみ表示
 */
export default function DrinkScreen() {
    const { items } = useInventoryItems('飲み物');
    return <EmergencyFoodList items={items} />;
}
