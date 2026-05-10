import { Button, StyleSheet, Text, View } from 'react-native';

export const EmergencyFoodList = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>すべて　食料品　水</Text>

            <View style={styles.button}>
                <Button title="testボタン" onPress={() => console.log('ボタンが押下されました')} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1, // 親いっぱいに広がるという意味。Viewの高さを画面全体にするために必要。
        justifyContent: 'center', // 縦中央
        alignItems: 'center',     // 横中央
    },

    text: {
        fontSize: 24,
        fontWeight: 'bold',
    },

    button: {
        width: 200, // ボタンの横幅を調整したい場合
    },
});