export type InventoryItem = {
    id: string;
    name: string;
    category: '保存食' | '水';
    place: string;
    limit: string;
};

export const MOCK_DATA_FOOD: InventoryItem[] = [
    {
        id: '1',
        name: 'カロリーメイト（チョコ）',
        category: '保存食',
        place: '台所棚下',
        limit: '2027/04/20',
    },
    {
        id: '2',
        name: 'ツナ缶',
        category: '保存食',
        place: '台所棚下',
        limit: '2027/04/20',
    },
    {
        id: '3',
        name: 'ツナ缶',
        category: '保存食',
        place: '台所棚下',
        limit: '2027/04/20',
    },
    {
        id: '4',
        name: 'ツナ缶',
        category: '保存食',
        place: '台所棚下',
        limit: '2027/04/20',
    },
    {
        id: '5',
        name: 'ツナ缶',
        category: '保存食',
        place: '台所棚下',
        limit: '2027/04/20',
    },
    {
        id: '6',
        name: 'ツナ缶',
        category: '保存食',
        place: '台所棚下',
        limit: '2027/04/20',
    },
    {
        id: '7',
        name: 'ツナ缶',
        category: '保存食',
        place: '台所棚下',
        limit: '2027/04/20',
    },
    {
        id: '8',
        name: 'ツナ缶',
        category: '保存食',
        place: '台所棚下',
        limit: '2027/04/20',
    },
    {
        id: '9',
        name: 'クラッカー',
        category: '保存食',
        place: '物置',
        limit: '2027/07/10',
    },
];

export const MOCK_DATA_DRINK: InventoryItem[] = [
    {
        id: '10',
        name: 'いろはす 500ml',
        category: '水',
        place: '玄関収納',
        limit: '2027/05/01',
    },
    {
        id: '11',
        name: '南アルプス天然水 2L',
        category: '水',
        place: '押し入れ',
        limit: '2027/06/15',
    },
];

export const MOCK_DATA_ALL: InventoryItem[] = [
    ...MOCK_DATA_FOOD,
    ...MOCK_DATA_DRINK
];