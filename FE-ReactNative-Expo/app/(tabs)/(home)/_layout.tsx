import { withLayoutContext } from 'expo-router';
import {
    createMaterialTopTabNavigator,
    MaterialTopTabNavigationOptions,
    MaterialTopTabNavigationEventMap,
} from '@react-navigation/material-top-tabs';
import { ParamListBase, TabNavigationState } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdBanner } from '@/src/features/ads';

const { Navigator } = createMaterialTopTabNavigator();

const MaterialTopTabs = withLayoutContext<
    MaterialTopTabNavigationOptions,
    typeof Navigator,
    TabNavigationState<ParamListBase>,
    MaterialTopTabNavigationEventMap
>(Navigator);

export default function HomeLayout() {
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
        </SafeAreaView>
    );
}