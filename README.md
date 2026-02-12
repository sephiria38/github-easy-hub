# GitHub Easy Hub 🚀

GitHubをもっと簡単に、もっと便利に使えるWebアプリケーションです。

## 特徴 ✨

- 🔐 **GitHub Personal Access Token による認証**
- 📁 **リポジトリ管理** - 一覧表示、作成、詳細確認
- 📤 **ファイルアップロード** - 複数ファイルの一括アップロード対応
- 📥 **ファイルダウンロード** - 個別ファイル・ZIP一括ダウンロード
- 🌿 **ブランチ管理** - ブランチ作成・一覧表示
- 📝 **Issue管理** - Issue作成・クローズ・コメント追加
- 🔀 **Pull Request管理** - PR作成・マージ
- 🔍 **ユーザー検索** - 詳細プロフィール・アクティビティ表示
- 🌙 **ダークモード対応**
- 📱 **レスポンシブデザイン** - スマホ・タブレット・PC対応

## 技術スタック 🛠

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **GitHub REST API**

## セットアップ方法 📦

### 1. リポジトリをクローン

```bash
git clone https://github.com/sephiria38/github-easy-hub.git
cd github-easy-hub
```

### 2. 依存関係をインストール

```bash
npm install
```

### 3. 開発サーバーを起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

### 4. GitHub Personal Access Token を取得

1. GitHubにログイン
2. **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
3. **Generate new token** をクリック
4. 必要な権限にチェック（推奨: `repo`, `user`, `read:org`）
5. 生成されたトークンをコピー
6. アプリの初回起動時にトークンを入力

## ビルド 🏗

### 本番環境用ビルド

```bash
npm run build
npm run start
```

### Vercel へのデプロイ

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sephiria38/github-easy-hub)

または、手動でデプロイ:

```bash
npm install -g vercel
vercel
```

## 機能一覧 📋

### リポジトリ管理
- リポジトリ一覧表示（更新日順）
- 新規リポジトリ作成（Public/Private選択可能）
- リポジトリ詳細情報表示
- GitHubへのリンク

### ファイルアップロード
- リポジトリ・ブランチ選択
- 複数ファイル対応
- アップロード進捗表示

### ファイルダウンロード
- リポジトリのファイルブラウザ
- ディレクトリナビゲーション
- 個別ファイルダウンロード
- プロジェクト全体のZIPダウンロード

### ブランチ管理
- ブランチ一覧表示
- 新規ブランチ作成
- ベースブランチ選択
- 保護ブランチの表示

### Issue管理
- Issue一覧表示（Pull Requestを除外）
- 新規Issue作成
- Issueのクローズ
- コメント追加
- 状態表示（Open/Closed）

### Pull Request管理
- PR一覧表示
- 新規PR作成（head/base選択）
- PRのマージ
- 状態表示（Open/Merged/Closed）

### ユーザー検索
- キーワード検索
- 詳細検索（言語・場所・フォロワー数）
- ユーザープロフィール表示
- 人気リポジトリ表示（スター順）
- スターしたリポジトリ一覧
- アクティビティタイムライン
- フォロワー・フォロー中一覧
- よく使う言語の表示
- 芋づる式ユーザー探索

## API制限について ⚠️

GitHub APIには1時間あたりのリクエスト制限があります：
- 認証済み: 5,000リクエスト/時
- 未認証: 60リクエスト/時

アプリのヘッダーに残りのAPI制限が表示されます。

## ライセンス 📄

MIT License

## 作者 👤

sephiria38

## リンク 🔗

- [GitHub](https://github.com/sephiria38/github-easy-hub)
- [Issues](https://github.com/sephiria38/github-easy-hub/issues)
