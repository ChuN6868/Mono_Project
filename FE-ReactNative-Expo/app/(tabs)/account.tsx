import { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useUserRepository, type User } from '@/src/db';

export default function TabTwoScreen() {
  /**
   * UserRepository を取得
   * ※内部で useDatabase → SQLiteProvider のDBに繋がる
   * ※useMemo されているので、再レンダリングで作り直されない
   */
  const userRepository = useUserRepository();

  /**
   * 画面表示用のユーザー一覧ステート
   * 初期値は空配列
   */
  const [users, setUsers] = useState<User[]>([]);

  /**
   * 画面初回表示時にユーザーデータを取得
   *
   * ※async関数はuseEffectのコールバックに直接渡せないので、
   *   中でasync関数を定義して呼び出す
   * ※依存配列に userRepository を入れているが、
   *   useMemo化されているので無限ループにはならない
   */
  useEffect(() => {
    const load = async () => {
      const data = await userRepository.findAll();
      setUsers(data);
    };
    load();
  }, [userRepository]);

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
