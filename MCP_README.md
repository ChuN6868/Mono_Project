# Playwright MCP サーバー設定ガイド

このプロジェクトで使用している `.mcp.json` の設定内容の説明です。

## 現在の設定

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "-y",
        "@playwright/mcp@latest",
        "--browser", "msedge",
        "--viewport-size", "1280,720"
      ],
      "env": {
        "PLAYWRIGHT_BROWSERS_PATH": "C:\\playwright-browsers",
        "DEBUG": "pw:api",
        "PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD": "0",
        "TZ": "Asia/Tokyo"
      }
    }
  }
}
```

## 各項目の説明

### コマンド設定

| 項目 | 値 | 説明 |
|------|-----|------|
| `command` | `npx` | Node.js パッケージを直接実行するツール |

### 引数 (args)

| 引数 | 値 | 説明 |
|------|-----|------|
| `-y` | - | 確認プロンプトをスキップして自動実行 |
| パッケージ | `@playwright/mcp@latest` | Playwright MCP サーバーの最新版を使用 |
| `--browser` | `msedge` | Microsoft Edge ブラウザを使用 |
| `--viewport-size` | `1280,720` | HD解像度（1280x720）で表示<br>一般的なノートPCサイズ |

#### ブラウザの選択肢
- `chromium` - Chromiumブラウザ
- `firefox` - Firefoxブラウザ
- `webkit` - Safariのベース（WebKit）
- `chrome` - Google Chrome
- `msedge` - Microsoft Edge（現在使用中）

### 環境変数 (env)

| 環境変数 | 値 | 説明 |
|----------|-----|------|
| `PLAYWRIGHT_BROWSERS_PATH` | `C:\\playwright-browsers` | ブラウザのインストール先（カスタムパス） |
| `DEBUG` | `pw:api` | Playwright API のデバッグログを有効化 |
| `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD` | `0` | ブラウザの自動ダウンロードを許可<br>（`0`=許可, `1`=スキップ） |
| `TZ` | `Asia/Tokyo` | タイムゾーンを日本時間に設定 |

## よく使うカスタマイズ例

### ヘッドレスモード（ブラウザ非表示）
```json
"args": [
  "-y",
  "@playwright/mcp@latest",
  "--browser", "msedge",
  "--viewport-size", "1920,1080",
  "--headless"
]
```

### デバッグモード（動作をゆっくり確認）
```json
"args": [
  "-y",
  "@playwright/mcp@latest",
  "--browser", "msedge",
  "--viewport-size", "1920,1080",
  "--headed",
  "--slow-mo", "500"
]
```

### モバイル表示（iPhone サイズ）
```json
"args": [
  "-y",
  "@playwright/mcp@latest",
  "--browser", "chromium",
  "--viewport-size", "375,667"
]
```

## トラブルシューティング

### ブラウザが起動しない場合
```bash
# ブラウザを手動インストール
npx playwright install msedge
```

### 環境変数のパスが見つからない場合
`PLAYWRIGHT_BROWSERS_PATH` のパスを確認してください：
```bash
# Windows
dir C:\playwright-browsers
```

## 参考リンク

- [Playwright 公式ドキュメント](https://playwright.dev/)
- [MCP (Model Context Protocol)](https://github.com/modelcontextprotocol)
