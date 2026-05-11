import { MOCK_DATA_ALL, InventoryItem } from '@/src/features/emergency-food/api/mock-data';
import { View, Text, StyleSheet, FlatList } from 'react-native';

export default function AllScreen() {
    return (
        <FlatList<InventoryItem>
            data={MOCK_DATA_ALL}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.list, { paddingBottom: 100 }]}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => (
                <View style={styles.card}>

                    {/* 1行目：名前 + カテゴリ */}
                    <View style={styles.row}>
                        <Text style={styles.name} numberOfLines={1}>
                            {item.name}
                        </Text>

                        <Text
                            style={[
                                styles.badge,
                                item.category === '水'
                                    ? styles.badgeWater
                                    : styles.badgeFood,
                            ]}
                        >
                            {item.category}
                        </Text>
                    </View>

                    {/* 2行目：場所 + 期限 */}
                    <View style={styles.rowBetween}>
                        <Text style={styles.place}>{item.place}</Text>
                        <Text style={styles.limit}>{item.limit}</Text>
                    </View>

                </View>
            )}
        />
    );
}

const styles = StyleSheet.create({
    list: {
        padding: 12,
        backgroundColor: '#f5f5f5',
    },

    card: {
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 12,

        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },

    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    name: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 8,
    },

    place: {
        fontSize: 13,
        color: '#333',
    },

    limit: {
        fontSize: 12,
        color: '#666',
    },

    badge: {
        fontSize: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        color: '#fff',
        overflow: 'hidden',
    },

    badgeFood: {
        backgroundColor: '#4CAF50',
    },

    badgeWater: {
        backgroundColor: '#2196F3',
    },

    separator: {
        height: 10,
    },
});