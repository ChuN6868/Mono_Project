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

const { Navigator } = createMaterialTopTabNavigator();

const MaterialTopTabs = withLayoutContext<
    MaterialTopTabNavigationOptions,
    typeof Navigator,
    TabNavigationState<ParamListBase>,
    MaterialTopTabNavigationEventMap
>(Navigator);

export default function HomeLayout() {

    const handleAddPress = () => {
        console.log('＋ボタンが押された');
        // TODO: ここでボトムシート開く処理など
    };

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: '#fff' }} // 余白部分のカラーを白に設定
            edges={['top']} // タブナビゲーションの上部にスペースを確保するために 'top' を指定（top, bottomから選択）
        >
            <AdBanner />
            <MaterialTopTabs
                screenOptions={{
                    tabBarLabelStyle: {
                        fontSize: 14,
                        fontWeight: '600',
                    },
                    tabBarActiveTintColor: '#2196F3',
                    tabBarInactiveTintColor: '#999',
                    tabBarIndicatorStyle: {
                        backgroundColor: '#2196F3',
                        height: 3,
                    },
                    tabBarStyle: {
                        backgroundColor: '#fff',
                    },
                }}
            >
                <MaterialTopTabs.Screen name="index" options={{ title: 'すべて' }} />
                <MaterialTopTabs.Screen name="food" options={{ title: '非常食' }} />
                <MaterialTopTabs.Screen name="drink" options={{ title: '飲み物' }} />
            </MaterialTopTabs>

            <Pressable
                style={styles.fab}
                onPress={handleAddPress}
                android_ripple={{ color: 'rgba(255,255,255,0.3)', borderless: true }}
            >
                <Ionicons name="add" size={24} color="#fff" />
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    fab: {
        position: 'absolute',          // ★ 絶対配置
        right: 20,                     // 右から20px
        bottom: 20,                    // 下から20px
        width: 56,
        height: 56,
        borderRadius: 28,              // 円形
        backgroundColor: '#2196F3',
        justifyContent: 'center',
        alignItems: 'center',
        // 影
        elevation: 6,                  // Android用
        shadowColor: '#000',           // iOS用
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
    },
});