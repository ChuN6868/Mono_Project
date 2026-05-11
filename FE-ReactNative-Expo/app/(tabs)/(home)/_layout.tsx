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
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

    const handleAddPress = () => setIsSheetOpen(true);

    const closeSheet = () => {
        setIsSheetOpen(false);
        setIsCalendarOpen(false);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
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

            {/* モーダル */}
            <Modal
                isVisible={isSheetOpen}
                onBackdropPress={closeSheet}
                swipeDirection="down"
                onSwipeComplete={closeSheet}
                propagateSwipe
                style={styles.modal}
                backdropOpacity={0.4}
                useNativeDriver
                hideModalContentWhileAnimating
            >
                <View style={styles.sheet}>

                    {/* ヘッダー */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={closeSheet}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={closeSheet}>
                            <Text style={styles.saveText}>保存</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.scrollArea}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >

                        {/* カテゴリ */}
                        <View style={styles.segment}>
                            <TouchableOpacity
                                style={[styles.segmentButton, category === '保存食' && styles.segmentActive]}
                                onPress={() => setCategory('保存食')}
                            >
                                <Text style={[styles.segmentText, category === '保存食' && styles.segmentTextActive]}>
                                    保存食
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.segmentButton, category === '飲み物' && styles.segmentActive]}
                                onPress={() => setCategory('飲み物')}
                            >
                                <Text style={[styles.segmentText, category === '飲み物' && styles.segmentTextActive]}>
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

                        {/* =========================
                            期限（アイコン付き）
                        ========================= */}
                        <View style={styles.dateRow}>

                            <View style={styles.dateLabelWrap}>
                                <Ionicons name="calendar-outline" size={18} color="#333" />
                                <Text style={styles.label}>期限</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.dateInput}
                                onPress={() => setIsCalendarOpen(true)}
                            >
                                <Text style={selectedDate ? styles.dateText : styles.datePlaceholder}>
                                    {selectedDate ? formatDate(selectedDate) : '選択'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* カレンダー */}
                        {isCalendarOpen && (
                            <View style={styles.calendarBox}>
                                <Calendar
                                    onDayPress={(day) => {
                                        setSelectedDate(day.dateString);
                                        setIsCalendarOpen(false);
                                    }}
                                    markedDates={{
                                        [selectedDate]: {
                                            selected: true,
                                            selectedColor: '#2196F3',
                                        },
                                    }}
                                />
                            </View>
                        )}

                    </ScrollView>

                    {/* 広告 */}
                    <View style={styles.adArea}>
                        <Text style={styles.adTitle}>広告スペース</Text>
                        <Text style={styles.adSub}>（ここにAdMobなど）</Text>
                    </View>

                </View>
            </Modal>
        </SafeAreaView>
    );
}

/* =========================
   styles
========================= */
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

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
    },

    scrollArea: { flex: 1 },

    scrollContent: { padding: 16 },

    /* ===== 期限UI改善 ===== */
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },

    dateLabelWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },

    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },

    dateInput: {
        width: 140,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        alignItems: 'center',
    },

    dateText: {
        color: '#111',
    },

    datePlaceholder: {
        color: '#999',
    },

    calendarBox: {
        marginTop: 10,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#eee',
    },

    /* その他 */
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
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

    adArea: {
        height: 180,
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

    saveText: {
        color: '#2196F3',
        fontWeight: 'bold',
    },
});