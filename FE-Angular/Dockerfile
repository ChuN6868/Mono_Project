# Node.js v24.11.0 を使用
FROM node:24.11-alpine

# 作業ディレクトリを作成
WORKDIR /app

# package.jsonとpackage-lock.jsonを先にコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci

# アプリ全体をコピー
COPY . .

# ポート4200でサーバを公開（ng serve のデフォルト）
EXPOSE 4200

# 開発用のコマンド（本番なら build 後に serve などに変更）
CMD ["npm", "run", "start"]