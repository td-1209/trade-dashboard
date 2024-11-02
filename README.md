# Requirement
### 実行環境
MacOS 14.5(23F79)  
Node v20.15.1  
npm 10.7.0  
npx 10.7.0  
Next 14.2.5  
### ライブラリ
詳細はpackage.jsonを参照

# Installation
### Git
1. ローカルの作業フォルダに移動
1. `git clone git@github.com:td-1209/trade-dashboard.git`
### Node
1. macの場合
    1. nodebrewを導入
    1. `nodebrew install v20.15.1`
    1. `nodebrew use v20.15.1`
### Next
1. 新規プロジェクトを作成する場合
    1. `cd trade-dashboard`
    1. .git/以外のファイルを削除
    1. `npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias '@/*'`
1. 既存プロジェクトを導入する場合
    1. `cd trade-dashboard`
    1. `npm install`
### UIコンポーネントライブラリ
文字色やブレイクポイントなどの定数は`src/components/layouts/Theme.ts`で定義  
その他サイズなど細かなCSS設定は各コンポーネントに直接記入  
新規プロジェクトにTailwindCSSを導入する手順は以下（[参考情報](https://nextjs.org/docs/app/building-your-application/styling/tailwind-css)）
1. `npm install tailwindcss postcss autoprefixer`
1. `npx tailwindcss init -p`
1. tailwind.config.tsのConfig.contentに以下追加
    1. `'./src/**/*.{js,ts,jsx,tsx,mdx}',　`
1. globals.cssに以下追加
    1. `@tailwind base;`
    1. `@tailwind components;`
    1. `@tailwind utilities;`
1. layout.tsxに以下追加
    1. `import '＠/styles/globals.css'`
### 静的解析
`npm run dev`実行時に型チェックやリンティングが自動実行  
詳細はpackage.jsonを参照
### パス設定
詳細はpackage.jsonを参照
### 環境変数設定
.env.localに秘密鍵などを記載（機密情報につきpush禁止）  
.envにNode.jsバージョンなどを記載  
クラウド環境に.env.localの内容を手動設定

# Directory
app routerを採用  
各種ソースコードはsrc/に配置
```
wakarase/
├── src/
│   ├── app/                 # アプリケーション
│   │   ├── (home)/             # homeルート
│   │   │   ├── layout.tsx      # 最上位のページコンポーネント
│   │   │   ├── page.tsx        # indexページコンポーネント
│   │   │   └── xxx/            # 各ページコンポーネント
│   │   └── api/                # API処理
│   ├── components/          # グローバルな共通コンポーネント
│   ├── config/              # 環境変数・定数
│   ├── contexts/            # コンテキストプロバイダ
│   ├── hooks/               # カスタムフック
│   ├── lib/                 # グローバルな共通処理
│   ├── styles/              # グローバルな共通スタイル
│   └── types/               # グローバルな共通型定義
├── .env                     # 公開可能な環境変数(シークレットは記載禁止)
...
```

# Usage
1. 開発環境での実行
    1. `cd trade-dashboard`
    1. `npm run dev`
1. 本番環境での実行
    1. `cd trade-dashboard`
    1. `npm install --omit=dev && npm run build`
    1. `npm run start`
1. 環境リセット
    1. `npm cache clean --force`
    1. `rm -rf ~/.npm`
    1. `rm -rf node_modules`
    1. `rm -rf .next`
