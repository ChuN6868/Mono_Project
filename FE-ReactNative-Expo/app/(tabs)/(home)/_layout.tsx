import { withLayoutContext } from 'expo-router';
import {
    createMaterialTopTabNavigator,
    MaterialTopTabNavigationOptions,
    MaterialTopTabNavigationEventMap,
} from '@react-navigation/material-top-tabs';
import { ParamListBase, TabNavigationState } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdBanner } from '@/src/features/ads';
import {
    Pressable,
    StyleSheet,
    View,
    TextInput,
    Text,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // ←ここ修正済み
import { useState } from 'react';
import Modal from 'react-native-modal';
import { Calendar } from 'react-native-calendars';

const { Navigator } = createMaterialTopTabNavigator();

const MaterialTopTabs = withLayoutContext<
    MaterialTopTabNavigationOptions,
    typeof Navigator,
    TabNavigationState<ParamListBase>,
    MaterialTopTabNavigationEventMap
>(Navigator);

export default function HomeLayout() {
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const [name, setName] = useState('');
    const [place, setPlace] = useState('');

    const [selectedDate, setSelectedDate] = useState('');
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const [category, setCategory] = useState<'保存食' | '飲み物'>('保存食');

    const handleAddPress = () => {
        setIsSheetOpen(true);
    };

    const closeSheet = () => {
        setIsSheetOpen(false);
        setIsCalendarOpen(false);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>

            <AdBanner />

            <MaterialTopTabs>
                <MaterialTopTabs.Screen name="index" options={{ title: 'すべて' }} />
                <MaterialTopTabs.Screen name="food" options={{ title: '非常食' }} />
                <MaterialTopTabs.Screen name="drink" options={{ title: '飲み物' }} />
            </MaterialTopTabs>

            <Pressable style={styles.fab} onPress={handleAddPress}>
                <Ionicons name="add" size={24} color="#fff" />
            </Pressable>

            {/* =========================
                モーダル
            ========================= */}
            <Modal
                isVisible={isSheetOpen}
                onSwipeComplete={closeSheet}
                onBackdropPress={closeSheet}
                swipeDirection="down"
                style={styles.modal}
                backdropOpacity={0.4}
                useNativeDriver
                useNativeDriverForBackdrop
                hideModalContentWhileAnimating
            >
                <View style={styles.sheet}>

                    {/* =========================
                        上半分：入力
                    ========================= */}
                    <View style={styles.formArea}>

                        {/* ヘッダー */}
                        <View style={styles.header}>
                            <TouchableOpacity onPress={closeSheet}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={closeSheet}>
                                <Text style={styles.saveText}>保存</Text>
                            </TouchableOpacity>
                        </View>

                        {/* セグメント */}
                        <View style={styles.segment}>
                            <TouchableOpacity
                                style={[
                                    styles.segmentButton,
                                    category === '保存食' && styles.segmentActive,
                                ]}
                                onPress={() => setCategory('保存食')}
                            >
                                <Text
                                    style={[
                                        styles.segmentText,
                                        category === '保存食' && styles.segmentTextActive,
                                    ]}
                                >
                                    保存食
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.segmentButton,
                                    category === '飲み物' && styles.segmentActive,
                                ]}
                                onPress={() => setCategory('飲み物')}
                            >
                                <Text
                                    style={[
                                        styles.segmentText,
                                        category === '飲み物' && styles.segmentTextActive,
                                    ]}
                                >
                                    飲み物
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            placeholder="名前"
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                        />

                        <TextInput
                            placeholder="場所"
                            style={styles.input}
                            value={place}
                            onChangeText={setPlace}
                        />

                        <TouchableOpacity style={styles.dateBox}>
                            <Text>{selectedDate || 'タップして日付選択'}</Text>
                        </TouchableOpacity>

                    </View>

                    {/* =========================
                        下半分：広告
                    ========================= */}
                    <View style={styles.adArea}>
                        <Text style={styles.adTitle}>広告スペース</Text>
                        <Text style={styles.adSub}>（ここにAdMobなど）</Text>
                    </View>

                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

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

    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },

    sheet: {
        height: '90%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },

    formArea: {
        flex: 1,
        padding: 16,
    },

    adArea: {
        flex: 1,
        backgroundColor: '#f2f2f2',
        borderTopWidth: 1,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
    },

    adTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },

    adSub: {
        fontSize: 12,
        color: '#999',
        marginTop: 6,
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },

    saveText: {
        color: '#2196F3',
        fontWeight: 'bold',
    },

    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
    },

    dateBox: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        borderRadius: 8,
    },

    segment: {
        flexDirection: 'row',
        backgroundColor: '#f2f2f2',
        borderRadius: 10,
        padding: 4,
        marginBottom: 12,
    },

    segmentButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },

    segmentActive: {
        backgroundColor: '#2196F3',
    },

    segmentText: {
        color: '#666',
        fontWeight: '600',
    },

    segmentTextActive: {
        color: '#fff',
    },
});