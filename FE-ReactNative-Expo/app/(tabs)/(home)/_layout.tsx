import { withLayoutContext } from 'expo-router';
import {
    createMaterialTopTabNavigator,
    MaterialTopTabNavigationOptions,
    MaterialTopTabNavigationEventMap,
} from '@react-navigation/material-top-tabs';
import { ParamListBase, TabNavigationState } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdBanner } from '@/src/features/ads';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EmergencyFoodRegister } from '@/src/features/emergency-food/components/EmergencyFoodRegister';
import {
    InventoryProvider,
    useInventoryModal,
} from '@/src/features/emergency-food/contexts/InventoryContext';

const { Navigator } = createMaterialTopTabNavigator();

const MaterialTopTabs = withLayoutContext<
    MaterialTopTabNavigationOptions,
    typeof Navigator,
    TabNavigationState<ParamListBase>,
    MaterialTopTabNavigationEventMap
>(Navigator);

/**
 * 内側のレイアウト
 *
 * useInventoryModal が Provider 配下である必要があるため、
 * Provider と分離して内側コンポーネントに切り出している。
 */
function HomeLayoutInner() {
    const { modalIsOpen, modalEditingItem, openCreateModal, closeModal } =
        useInventoryModal();

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <AdBanner />

            <MaterialTopTabs>
                <MaterialTopTabs.Screen name="index" options={{ title: 'すべて' }} />
                <MaterialTopTabs.Screen name="food" options={{ title: '非常食' }} />
                <MaterialTopTabs.Screen name="drink" options={{ title: '飲み物' }} />
            </MaterialTopTabs>

            {/* FAB：新規登録モードでモーダルを開く */}
            <Pressable style={styles.fab} onPress={openCreateModal}>
                <Ionicons name="add" size={24} color="#fff" />
            </Pressable>

            {/* モーダルは新規/編集の両方を兼ねる。editingItemの有無で内部が切替わる */}
            <EmergencyFoodRegister
                isOpen={modalIsOpen}
                onClose={closeModal}
                editingItem={modalEditingItem}
            />
        </SafeAreaView>
    );
}

/**
 * (home) 配下の画面共通レイアウト
 *
 * 【責務】
 * - InventoryProvider でタブ配下を包む
 *   （カードタップ→編集モーダル open、保存→一覧再取得 の連携用Context）
 * - タブ枠、FAB、登録/編集モーダルを配置
 */
export default function HomeLayout() {
    return (
        <InventoryProvider>
            <HomeLayoutInner />
        </InventoryProvider>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },

    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#2196F3',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
    },
});
