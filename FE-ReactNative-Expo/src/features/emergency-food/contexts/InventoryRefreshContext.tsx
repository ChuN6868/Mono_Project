import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';

/**
 * 在庫データの「再取得トリガー」をコンポーネント間で共有するContext
 *
 * 【課題】
 * 登録モーダル（_layout.tsx 配下）で新規追加した時、
 * 既に開いているリスト画面（index/food/drink タブ）に
 * 「再取得して」と通知する必要がある。
 *
 * 【解決策】
 * refreshKey という数値を共有し、saveのたびに +1 する。
 * 各リスト画面の useInventoryItems はこの値を useEffect の依存に入れて、
 * 値が変わるたびに DB再取得する。
 *
 * 【なぜ Context にしたか】
 * 親→子のpropドリリングだとTab内の各Screenまで届かない。
 * Redux/Zustand 等のグローバル状態を入れるほどでもないため、
 * Contextが最もシンプルで保守しやすい。
 */
type InventoryRefreshContextValue = {
  refreshKey: number;
  triggerRefresh: () => void;
};

const InventoryRefreshContext = createContext<InventoryRefreshContextValue>({
  refreshKey: 0,
  triggerRefresh: () => {},
});

export function InventoryRefreshProvider({ children }: { children: ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <InventoryRefreshContext.Provider value={{ refreshKey, triggerRefresh }}>
      {children}
    </InventoryRefreshContext.Provider>
  );
}

export function useInventoryRefresh(): InventoryRefreshContextValue {
  return useContext(InventoryRefreshContext);
}
