import { useCallback, useEffect, useState } from 'react';
import { useEmergencyFoodRepository } from '@/src/db';
import {
  type InventoryItem,
  toInventoryItem,
} from '../types/inventoryItem';
import { useInventoryRefresh } from '../contexts/InventoryContext';

type UseInventoryItemsResult = {
  items: InventoryItem[];
  loading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
};

/**
 * 在庫一覧をDBから取得して画面用のビューモデルに変換するフック
 *
 * 【使い方】
 *   const { items } = useInventoryItems();          // すべて
 *   const { items } = useInventoryItems('保存食');  // カテゴリ絞り込み
 *
 * 【自動再取得】
 * InventoryRefreshContext の refreshKey が変わる（=モーダルでsave完了）と
 * 自動で DB を再取得して items が更新される。
 */
export function useInventoryItems(filter?: string): UseInventoryItemsResult {
  const repo = useEmergencyFoodRepository();
  const { refreshKey } = useInventoryRefresh();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const foods = filter
        ? await repo.findByCategoryName(filter)
        : await repo.findAll();
      setItems(foods.map(toInventoryItem));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [repo, filter]);

  useEffect(() => {
    reload();
  }, [reload, refreshKey]); // refreshKey が変わるたびに再取得

  return { items, loading, error, reload };
}
