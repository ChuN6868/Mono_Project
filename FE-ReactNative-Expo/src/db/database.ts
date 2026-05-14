import * as SQLite from 'expo-sqlite';

// DB接続（シングルトン）
export const db = SQLite.openDatabaseSync('myapp.db'); // データベース名は自由（myapp.db）