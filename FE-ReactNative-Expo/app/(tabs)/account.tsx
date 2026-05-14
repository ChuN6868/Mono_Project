import { getUsers } from '@/src/repositories/hogeRepository';
import { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';

/**
 * Userテーブルの型定義
 * SQLiteから取得したデータの構造を表す
 */
type User = {
  id: number;
  name: string;
  email: string;
  created_at: string;
};

export default function TabTwoScreen() {
  /**
   * 画面表示用のユーザー一覧ステート
   * 初期値は空配列
   */
  const [users, setUsers] = useState<User[]>([]);

  /**
   * 画面初回表示時にユーザーデータを取得
   *
   * ※useEffect([])なのでマウント時に1回だけ実行される
   * ※Repository層からDBデータを取得してstateに反映
   */
  useEffect(() => {
    // SQLiteからユーザー一覧を取得
    const data = getUsers();

    // 取得したデータをstateに保存し画面再レンダリング
    setUsers(data);
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* 画面タイトル */}
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>
        Users
      </Text>

      {/* ユーザー一覧のリスト表示 */}
      <FlatList
        data={users} // 表示するデータ配列
        keyExtractor={(item) => item.id.toString()} // 一意キー（React最適化用）
        renderItem={({ item }) => (
          <View
            style={{
              padding: 12,
              borderBottomWidth: 1,
              borderColor: '#ddd',
            }}
          >
            {/* ユーザー名 */}
            <Text style={{ fontSize: 16 }}>{item.name}</Text>

            {/* メールアドレス（補助情報） */}
            <Text style={{ color: 'gray' }}>{item.email}</Text>
          </View>
        )}
      />
    </View>
  );
}