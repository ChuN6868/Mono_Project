import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import type { InventoryItem } from '../types/inventoryItem';

/**
 * 在庫一覧画面と登録/編集モーダルの間で状態を共有するContext
 *
 * 【担う2つの責務】
 *  1. refresh：保存/更新が起きたことを一覧側に通知して再fetchさせる
 *  2. modal  ：カードタップで「編集モーダル」、FABで「新規モーダル」を開く
 *
 * 【なぜ1つの Context にしたか】
 * どちらも「一覧画面 ↔ モーダル」のコミュニケーション用途で密接に関連する。
 * 別Contextに分けるとProviderが2重になり、利用側も2回 useContext する必要があり煩雑。
 * 関心が近いので統合し、用途別に hook を分けて公開する（useInventoryRefresh / useInventoryModal）。
 */

type InventoryContextValue = {
  // ---- refresh ----
  refreshKey: number;
  triggerRefresh: () => void;

  // ---- modal ----
  modalIsOpen: boolean;
  /** null = 新規モード / オブジェクト = 編集モード */
  modalEditingItem: InventoryItem | null;
  openCreateModal: () => void;
  openEditModal: (item: InventoryItem) => void;
  closeModal: () => void;
};

const InventoryContext = createContext<InventoryContextValue>({
  refreshKey: 0,
  triggerRefresh: () => {},
  modalIsOpen: false,
  modalEditingItem: null,
  openCreateModal: () => {},
  openEditModal: () => {},
  closeModal: () => {},
});

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalEditingItem, setModalEditingItem] = useState<InventoryItem | null>(null);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const openCreateModal = useCallback(() => {
    setModalEditingItem(null);
    setModalIsOpen(true);
  }, []);

  const openEditModal = useCallback((item: InventoryItem) => {
    setModalEditingItem(item);
    setModalIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalIsOpen(false);
    // editingItem も即座にクリア。
    // react-native-modal の hideModalContentWhileAnimating=true により
    // 閉じアニメ中はコンテンツが非表示なので、見た目への影響はない。
    setModalEditingItem(null);
  }, []);

  return (
    <InventoryContext.Provider
      value={{
        refreshKey,
        triggerRefresh,
        modalIsOpen,
        modalEditingItem,
        openCreateModal,
        openEditModal,
        closeModal,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

/** refresh だけが必要な側（hookやモーダル）が使う */
export function useInventoryRefresh() {
  const { refreshKey, triggerRefresh } = useContext(InventoryContext);
  return { refreshKey, triggerRefresh };
}

/** モーダル開閉が必要な側（_layout / カード経由のscreen）が使う */
export function useInventoryModal() {
  const {
    modalIsOpen,
    modalEditingItem,
    openCreateModal,
    openEditModal,
    closeModal,
  } = useContext(InventoryContext);
  return {
    modalIsOpen,
    modalEditingItem,
    openCreateModal,
    openEditModal,
    closeModal,
  };
}
