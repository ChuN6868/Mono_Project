import { useInventoryItems } from '@/src/features/emergency-food/hooks/useInventoryItems';
import { EmergencyFoodList } from '@/src/features/emergency-food/components/EmergencyFoodList';

/**
 * 「非常食」タブ：カテゴリ「保存食」のみ表示
 */
export default function FoodScreen() {
    const { items } = useInventoryItems('保存食');
    return <EmergencyFoodList items={items} />;
}
