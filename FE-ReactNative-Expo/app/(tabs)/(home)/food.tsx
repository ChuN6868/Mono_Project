import { View, Text, StyleSheet } from 'react-native';

export default function FoodScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>食料品の中身がここに表示されます</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    text: {
        fontSize: 18,
        color: '#333',
    },
});