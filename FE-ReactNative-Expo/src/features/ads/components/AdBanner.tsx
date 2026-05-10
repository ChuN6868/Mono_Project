import { View, Text, StyleSheet } from 'react-native';

export const AdBanner = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>📢 広告スペース</Text>
            <Text style={styles.subLabel}>Advertisement</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 60,                          // ★ 高さを固定（重要）
        backgroundColor: '#FFF3E0',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#FFE0B2',
    },
    label: {
        color: '#E65100',
        fontWeight: '600',
        fontSize: 14,
    },
    subLabel: {
        color: '#FB8C00',
        fontSize: 10,
        marginTop: 2,
    },
});