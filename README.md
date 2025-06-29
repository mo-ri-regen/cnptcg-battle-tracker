# CNP TCG Battle Tracker

CNP トレカのバトル戦績を記録・管理する Web アプリケーションです。デッキ管理から戦績分析まで、プレイヤーの成長をサポートします。

## 🎯 主な機能

### バトル記録管理

- 戦績の詳細記録（勝敗、使用デッキ、対戦相手デッキなど）
- 先攻・後攻の記録
- イベント名やメモの記録
- 戦績の時系列管理

### デッキ管理

- 自分のデッキライブラリの管理
- デッキの色分類（赤・青・緑・黄・紫）
- デッキごとの戦績追跡
- デッキメモ機能

### 統計分析

- 総合勝率の計算
- デッキ別パフォーマンス分析
- 先攻・後攻別の勝率統計
- 最近の戦績履歴表示

### ダッシュボード

- 戦績サマリーの一覧表示
- 最近のバトル履歴
- 各種統計データの可視化

## 🛠 使用技術

### フロントエンド

- **Next.js 15** - React ベースのフルスタックフレームワーク
- **React 19** - UI ライブラリ
- **TypeScript** - 型安全な開発環境
- **Tailwind CSS v4** - ユーティリティファーストの CSS フレームワーク
- **Heroicons** - SVG アイコンライブラリ
- **Recharts** - データ可視化ライブラリ

### バックエンド

- **Next.js API Routes** - サーバーサイド API
- **SQLite** - 軽量データベース
- **better-sqlite3** - Node.js 用 SQLite ドライバー
- **date-fns** - 日付操作ライブラリ

### 開発環境

- **ESLint** - コード品質管理
- **Turbopack** - 高速バンドラー（開発時）

## 🚀 アプリの起動方法

### 前提条件

- Node.js 18.0 以上
- npm、yarn、pnpm、または bun のいずれか

### インストール手順

1. **リポジトリのクローン**

   ```bash
   git clone git@github.com:mo-ri-regen/cnptcg-battle-tracker.git
   cd cnptcg-battle-tracker
   ```

2. **依存関係のインストール**

   ```bash
   npm install
   ```

3. **開発サーバーの起動**

   ```bash
   npm run dev
   ```

4. **アプリケーションにアクセス**

   ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

### その他のコマンド

- **プロダクションビルド**

  ```bash
  npm run build
  npm run start
  ```

- **コードリンティング**

  ```bash
  npm run lint
  ```

## 📁 プロジェクト構成

```
cnptcg-battle-tracker/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── battles/       # バトル記録API
│   │   │   ├── decks/         # デッキ管理API
│   │   │   ├── colors/        # デッキカラーAPI
│   │   │   └── statistics/    # 統計API
│   │   ├── decks/             # デッキ管理ページ
│   │   └── (その他のページ)
│   ├── components/            # Reactコンポーネント
│   ├── lib/                   # ライブラリとユーティリティ
│   │   ├── database.ts        # データベース設定
│   │   ├── services/          # ビジネスロジック
│   │   └── types.ts           # 型定義
│   └── styles/                # スタイルファイル
├── data/                      # SQLiteデータベースファイル
└── public/                    # 静的ファイル
```

## 🗃 データベース構成

### テーブル構造

- **deck_colors**: デッキの色マスタ（赤・青・緑・黄・紫）
- **my_decks**: ユーザーのデッキ情報
- **battle_records**: バトル戦績記録
- **opponent_deck_colors**: 対戦相手デッキの色情報（多対多関係）

### データ特徴

- SQLite によるローカルデータベース
- トランザクション対応
- 論理削除によるデータ保護
- 外部キー制約による整合性保証

## 🎮 使い方

1. **デッキ登録**: まず自分のデッキを「デッキ管理」で登録
2. **バトル記録**: 対戦後にダッシュボードから戦績を記録
3. **統計確認**: 蓄積されたデータから勝率や傾向を分析
4. **デッキ改善**: 統計データを基にデッキ構築を最適化

## 📱 対応環境

- **デスクトップ**: Chrome、Firefox、Safari、Edge
- **モバイル**: iOS Safari、Android Chrome
- **レスポンシブデザイン**: 各画面サイズに対応

## 🤝 開発について

このプロジェクトは個人のホビープロジェクトとして開発されています。バグ報告や機能提案があれば、issue からお知らせください。

---

CNP Trading Card Game の戦績管理にお役立てください！🎲
