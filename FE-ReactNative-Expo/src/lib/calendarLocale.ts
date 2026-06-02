import { LocaleConfig } from 'react-native-calendars';

/**
 * react-native-calendars の日本語ロケール設定
 *
 * 【使い方】
 * app/_layout.tsx の先頭で副作用importする：
 *   import '@/src/lib/calendarLocale';
 *
 * これだけで以下が日本語化される：
 * - 月名（"August" → "8月"）
 * - 曜日名（"Sun Mon Tue ..." → "日 月 火 ..."）
 * - "Today" → "今日"
 *
 * 【年月ヘッダーの形式について】
 * "2027年 8月" のような順序にしたい場合、Calendar コンポーネント側で
 *   <Calendar monthFormat="yyyy年 M月" />
 * を指定する必要がある（ロケールだけでは "8月 2027" のままなため）。
 */
LocaleConfig.locales['jp'] = {
  monthNames: [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月',
  ],
  monthNamesShort: [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月',
  ],
  dayNames: [
    '日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日',
  ],
  dayNamesShort: ['日', '月', '火', '水', '木', '金', '土'],
  today: '今日',
};

// アプリ全体のデフォルトロケールをjpに切り替え
LocaleConfig.defaultLocale = 'jp';
