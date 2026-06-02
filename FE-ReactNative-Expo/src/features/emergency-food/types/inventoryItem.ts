import type { EmergencyFoodWithCategory } from '@/src/db';

/**
 * UI層が消費するビューモデル
 *
 * 【なぜ Domain型をそのまま使わないか】
 * - DB層の Domain 型はDBの構造に紐づいた「保存・取得の単位」
 * - UI層は表示に最適化された「画面の単位」が必要
 * - 両者を分けることで、DB構造変更（カラム追加・型変更）が
 *   UIコンポーネントに波及しなくなる
 *
 * 【設計方針】
 * 旧 mock-data.ts の InventoryItem 型と互換のフィールドにすることで、
 * 既存のUIコンポーネント（カードレイアウト）の変更を最小化している。
 */
export type InventoryItem = {
  id: number;
  name: string;
  category: string; // '保存食' | '飲み物' を想定（DBから来る値）
  place: string;
  limit: string; // 表示用フォーマット 'YYYY/MM/DD'
};

/**
 * DB層の EmergencyFoodWithCategory → UI用 InventoryItem 変換
 *
 * - place : null は空文字に正規化（UI側で `!= null` チェック不要）
 * - limit : DBは 'YYYY-MM-DD' だが UI慣習に合わせて 'YYYY/MM/DD' に変換
 */
export function toInventoryItem(food: EmergencyFoodWithCategory): InventoryItem {
  return {
    id: food.id,
    name: food.name,
    category: food.categoryName,
    place: food.storageLocation ?? '',
    limit: food.expirationDate.replaceAll('-', '/'),
  };
}
