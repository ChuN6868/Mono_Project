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
import { useState } from 'react';
import { EmergencyFoodRegister } from '@/src/features/emergency-food/components/EmergencyFoodRegister';
import { InventoryRefreshProvider } from '@/src/features/emergency-food/contexts/InventoryRefreshContext';

const { Navigator } = createMaterialTopTabNavigator();

const MaterialTopTabs = withLayoutContext<
    MaterialTopTabNavigationOptions,
    typeof Navigator,
    TabNavigationState<ParamListBase>,
    MaterialTopTabNavigationEventMap
>(Navigator);

/**
 * (home) 配下の画面共通レイアウト
 *
 * 【責務】
 * - タブ枠（すべて / 非常食 / 飲み物）の提供
 * - FAB（追加ボタン）の提供と開閉state管理
 * - 登録モーダル <EmergencyFoodRegister /> の配置
 * - InventoryRefreshProvider でタブ配下を包む
 *   （モーダルからの保存通知が各タブの一覧に届くようにするため）
 */
export default function HomeLayout() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <InventoryRefreshProvider>
            <SafeAreaView style={styles.container} edges={['top']}>
                <AdBanner />

                <MaterialTopTabs>
                    <MaterialTopTabs.Screen name="index" options={{ title: 'すべて' }} />
                    <MaterialTopTabs.Screen name="food" options={{ title: '非常食' }} />
                    <MaterialTopTabs.Screen name="drink" options={{ title: '飲み物' }} />
                </MaterialTopTabs>

                <Pressable style={styles.fab} onPress={() => setIsOpen(true)}>
                    <Ionicons name="add" size={24} color="#fff" />
                </Pressable>

                <EmergencyFoodRegister
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                />
            </SafeAreaView>
        </InventoryRefreshProvider>
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
